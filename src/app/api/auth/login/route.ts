import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyPassword, signToken, setSessionCookie } from '@/lib/auth'
import { getAppMode } from '@/lib/mode'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  // In Supabase (production) mode, login happens in the browser
  // via supabase-js signInWithPassword() — see src/lib/client-auth.ts
  if (getAppMode() === 'supabase') {
    return NextResponse.json(
      { error: 'در حالت پروداکشن، ورود مستقیماً از طریق Supabase انجام می‌شود.' },
      { status: 400 }
    )
  }

  try {
    const body = await req.json().catch(() => null)
    const email = String(body?.email ?? '').trim().toLowerCase()
    const password = String(body?.password ?? '')

    if (!email || !password) {
      return NextResponse.json(
        { error: 'ایمیل و رمز عبور الزامی است.' },
        { status: 400 }
      )
    }

    const user = await db.user.findUnique({ where: { email } })
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json(
        { error: 'ایمیل یا رمز عبور اشتباه است.' },
        { status: 401 }
      )
    }

    await setSessionCookie(signToken(user.id, user.email, user.name))
    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name },
    })
  } catch (err) {
    console.error('[login]', err)
    return NextResponse.json({ error: 'خطای سرور در ورود.' }, { status: 500 })
  }
}
