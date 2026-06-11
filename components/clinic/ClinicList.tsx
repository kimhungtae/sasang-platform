'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { clinicLogout } from '@/app/actions/clinic';
import { TYPE_INFO, type Constitution } from '@/data/type-info';

export type ClinicRecord = {
  recordId: number;
  date: number; // epoch ms
  stage: string;
  name: string;
  chartNo: string;
  gender: 'M' | 'F' | null;
  age: number | null;
  top: Constitution | null;
};

const STAGE_LABEL: Record<string, string> = {
  intake: '1차 완료',
  reviewed: '원장 확인',
  prescribed: '처방 완료',
};

export function ClinicList({ records }: { records: ClinicRecord[] }) {
  const router = useRouter();
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return records;
    return records.filter(
      (r) => r.name.toLowerCase().includes(s) || r.chartNo.toLowerCase().includes(s),
    );
  }, [q, records]);

  async function logout() {
    await clinicLogout();
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 sm:py-12 space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <p className="text-xs tracking-widest text-zinc-500 dark:text-zinc-400">온누리한의원 · 원장실</p>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">환자 기록</h1>
          </div>
          <button
            type="button"
            onClick={logout}
            className="text-xs px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            잠금
          </button>
        </div>

        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="차트번호 또는 이름으로 검색"
          className="w-full px-3 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
        />

        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          총 {records.length}건{q.trim() && ` · 검색 ${filtered.length}건`}
        </p>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-zinc-500 dark:text-zinc-400">
            {records.length === 0 ? '저장된 기록이 없습니다.' : '검색 결과가 없습니다.'}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((r) => {
              const ti = r.top ? TYPE_INFO[r.top] : null;
              return (
                <Link
                  key={r.recordId}
                  href={`/clinic/${r.recordId}`}
                  className="block rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 hover:border-zinc-400 dark:hover:border-zinc-600 transition"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                          {r.name}
                        </span>
                        <span className="text-xs text-zinc-400">차트 {r.chartNo}</span>
                        {(r.gender || r.age != null) && (
                          <span className="text-xs text-zinc-400">
                            {r.gender === 'M' ? '남' : r.gender === 'F' ? '여' : ''}
                            {r.gender && r.age != null ? '·' : ''}
                            {r.age != null ? `${r.age}세` : ''}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                        {new Date(r.date).toLocaleString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        <span className="mx-1.5">·</span>
                        {STAGE_LABEL[r.stage] ?? r.stage}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {ti && (
                        <span
                          className="text-sm font-semibold px-2.5 py-1 rounded-full"
                          style={{ color: ti.color, backgroundColor: `${ti.color}15` }}
                        >
                          {ti.name}
                        </span>
                      )}
                      <span className="text-zinc-300 dark:text-zinc-600">›</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <div className="text-center pt-4">
          <Link href="/" className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
            ← 홈으로
          </Link>
        </div>
      </div>
    </div>
  );
}
