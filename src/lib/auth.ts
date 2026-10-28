import crypto from 'crypto'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { getAppMode } from '@/lib/mode'
import { verifySupabaseToken } from '@/lib/supabase-server'

const SECRET =
  process.env.AUTH_SECRET || 'zslide-dev-secret-change-me-in-production-9f2a'
const COOKIE_NAME = 'zslide_session'
const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 30 // 30 days

/* ── Password hashing (scrypt, salted, no external deps) ── */

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.scryptSync(password, salt, 64).toString('hex')
  return `scrypt:${salt}:${hash}`
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [scheme, salt, hash] = stored.split(':')
    if (scheme !== 'scrypt' || !salt || !hash) return false
    const candidate = crypto.scryptSync(password, salt, 64)
    const expected = Buffer.from(hash, 'hex')
    return candidate.length === expected.length && crypto.timingSafeEqual(candidate, expected)
  } catch {
    return false
  }
}

/* ── JWT (HS256) — minimal dependency-free implementation ── */

interface TokenPayload {
  sub: string
  email: string
  iat: number
  exp: number
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function b64urlDecode(input: string): Buffer {
  const pad = input.length % 4 === 0 ? '' : '='.repeat(4 - (input.length % 4))
  return Buffer.from(input.replace(/-/g, '+').replace(/_/g, '/') + pad, 'base64')
}

function sign(data: string): string {
  return b64url(crypto.createHmac('sha256', SECRET).update(data).digest())
}

export function signToken(userId: string, email: string): string {
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const now = Math.floor(Date.now() / 1000)
  const payload: TokenPayload = {
    sub: userId,
    email,
    iat: now,
    exp: now + TOKEN_TTL_SECONDS,
  }
  const body = b64url(JSON.stringify(payload))
  const signature = sign(`${header}.${body}`)
  return `${header}.${body}.${signature}`
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const [header, body, signature] = token.split('.')
    if (!header || !body || !signature) return null
    const expected = sign(`${header}.${body}`)
    const a = Buffer.from(signature)
    const b = Buffer.from(expected)
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null
    const payload = JSON.parse(b64urlDecode(body).toString('utf8')) as TokenPayload
    if (!payload.sub || payload.exp < Math.floor(Date.now() / 1000)) return null
    return payload
  } catch {
    return null
  }
}

/* ── Session helpers (App Router) ── */

export async function setSessionCookie(token: string) {
  const store = await cookies()
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false, // sandbox preview runs behind proxy; set true in HTTPS production
    path: '/',
    maxAge: TOKEN_TTL_SECONDS,
  })
}

export async function clearSessionCookie() {
  const store = await cookies()
  store.set(COOKIE_NAME, '', { httpOnly: true, path: '/', maxAge: 0 })
}

export interface SessionUser {
  id: string
  email: string
  name: string | null
  createdAt: Date
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies()
  const token = store.get(COOKIE_NAME)?.value
  if (!token) return null
  const payload = verifyToken(token)
  if (!payload) return null
  const user = await db.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, email: true, name: true, createdAt: true },
  })
  return user
}

/* ── Mode-aware request authentication ─────────────────────────
 * supabase mode : Authorization: Bearer <supabase-access-token>
 * local mode    : httpOnly session cookie (signed JWT)
 * Falls back to the other transport if the first yields nothing,
 * so both flows keep working during migration. */
export async function getUserFromRequest(req: Request): Promise<SessionUser | null> {
  const mode = getAppMode()

  if (mode === 'supabase') {
    const header = req.headers.get('authorization') ?? ''
    const bearer = header.toLowerCase().startsWith('bearer ')
      ? header.slice(7).trim()
      : null
    if (bearer) {
      const su = await verifySupabaseToken(bearer)
      if (su) return { id: su.id, email: su.email, name: su.name, createdAt: new Date() }
      return null
    }
    // local cookie fallback (e.g. iframe loads before client token wiring)
    return getSessionUser()
  }

  const local = await getSessionUser()
  if (local) return local
  // allow Bearer supabase tokens even in local mode (harmless no-op if invalid)
  const header = req.headers.get('authorization') ?? ''
  if (header.toLowerCase().startsWith('bearer ')) {
    try {
      const su = await verifySupabaseToken(header.slice(7).trim())
      if (su) return { id: su.id, email: su.email, name: su.name, createdAt: new Date() }
    } catch {
      /* ignore */
    }
  }
  return null
}
