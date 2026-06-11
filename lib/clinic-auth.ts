/**
 * 원장실(임상가) 간단 비번 게이트 — 서버 전용 헬퍼
 *
 * 비번은 환경변수 CLINIC_PIN. 맞으면 쿠키에 sha256(PIN+salt) 토큰을 심어
 * 이후 요청에서 통과 여부를 확인한다. (쿠키 값은 PIN 없이는 위조 불가)
 * ⚠️ 서버 컴포넌트/액션에서만 import (cookies()·crypto 사용).
 */
import { cookies } from 'next/headers';
import { createHash } from 'crypto';

export const CLINIC_COOKIE = 'clinic_auth';

export function clinicConfigured(): boolean {
  return !!process.env.CLINIC_PIN;
}

/** CLINIC_PIN으로부터 기대 토큰 계산 (없으면 null) */
export function expectedToken(): string | null {
  const pin = process.env.CLINIC_PIN;
  if (!pin) return null;
  return createHash('sha256').update(`${pin}:sasang-clinic-v1`).digest('hex');
}

/** 현재 요청이 원장실 인증을 통과했는지 */
export function isClinicAuthed(): boolean {
  const expected = expectedToken();
  if (!expected) return false;
  const c = cookies().get(CLINIC_COOKIE)?.value;
  return !!c && c === expected;
}
