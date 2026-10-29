import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  hashPassword,
  signToken,
  setSessionCookie,
} from '@/lib/auth'
import { getAppMode } from '@/lib/mode'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  // In Supabase (production) mode, registration happens in the browser
  // via supabase-js signUp() — see src/lib/client-auth.ts
  if (getAppMode() === 'supabase') {
    return NextResponse.json(
      { error: 'در حالت پروداکشن، ثبت‌نام مستقیماً از طریق Supabase انجام می‌شود.' },
      { status: 400 }
    )
  }

  try {
    const body = await req.json().catch(() => null)
    const email = String(body?.email ?? '').trim().toLowerCase()
    const password = String(body?.password ?? '')
    const name = String(body?.name ?? '').trim() || null

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'ایمیل معتبر نیست.' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'رمز عبور باید حداقل ۶ کاراکتر باشد.' },
        { status: 400 }
      )
    }

    const existing = await db.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { error: 'این ایمیل قبلاً ثبت شده است. وارد شوید.' },
        { status: 409 }
      )
    }

    const user = await db.user.create({
      data: { email, name, passwordHash: hashPassword(password) },
    })

    await setSessionCookie(signToken(user.id, user.email, user.name))
    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name },
    })
  } catch (err) {
    console.error('[register]', err)
    return NextResponse.json({ error: 'خطای سرور در ثبت‌نام.' }, { status: 500 })
  }
}
