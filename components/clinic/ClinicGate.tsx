'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { verifyClinicPin } from '@/app/actions/clinic';

export function ClinicGate({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!pin.trim()) {
      setError('비밀번호를 입력해주세요.');
      return;
    }
    setLoading(true);
    setError('');
    const res = await verifyClinicPin(pin);
    setLoading(false);
    if (res.ok) {
      router.refresh();
    } else {
      setError(res.error ?? '인증 실패');
      setPin('');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900 p-6">
      <div className="w-full max-w-sm space-y-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 shadow-sm">
        <div className="text-center space-y-1">
          <div className="text-3xl">🔒</div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">원장실</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            환자 기록 조회 — 비밀번호가 필요합니다.
          </p>
        </div>

        {!configured ? (
          <p className="text-sm text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 rounded-lg p-3">
            서버에 비밀번호(CLINIC_PIN)가 아직 설정되지 않았습니다. 관리자에게 문의하세요.
          </p>
        ) : (
          <div className="space-y-3">
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submit();
              }}
              placeholder="비밀번호"
              autoFocus
              className="w-full px-3 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-zinc-500"
            />
            {error && <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>}
            <button
              type="button"
              onClick={submit}
              disabled={loading}
              className="w-full px-4 py-2.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? '확인 중…' : '입장'}
            </button>
          </div>
        )}

        <div className="text-center">
          <Link href="/" className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
            ← 홈으로
          </Link>
        </div>
      </div>
    </div>
  );
}
