'use server';

/**
 * 원장실 인증 서버 액션 — 간단 비번(CLINIC_PIN) 확인 후 쿠키 발급/삭제.
 */

import { cookies } from 'next/headers';
import { CLINIC_COOKIE, expectedToken } from '@/lib/clinic-auth';

export async function verifyClinicPin(
  pin: string,
): Promise<{ ok: boolean; error?: string }> {
  const real = process.env.CLINIC_PIN;
  if (!real) {
    return { ok: false, error: '서버에 비밀번호(CLINIC_PIN)가 설정되지 않았습니다.' };
  }
  if ((pin ?? '').trim() !== real) {
    return { ok: false, error: '비밀번호가 올바르지 않습니다.' };
  }
  const token = expectedToken();
  if (token) {
    cookies().set(CLINIC_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 12, // 12시간
    });
  }
  return { ok: true };
}

export async function clinicLogout(): Promise<void> {
  cookies().delete(CLINIC_COOKIE);
}
