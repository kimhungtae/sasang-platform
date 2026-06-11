import Link from 'next/link';
import { TYPE_INFO, HANYUL_LABEL, CONSTITUTIONS, type Constitution } from '@/data/type-info';

type SavedResult = {
  top?: Constitution;
  pcts?: Partial<Record<Constitution, number>>;
  confidence?: { level?: string; detail?: string };
  hanyul?: string;
  hanyulCounts?: { cold?: number; hot?: number };
  answered?: number;
  total?: number;
  coverage?: number;
};

export type RecordViewProps = {
  patient: { name: string; chartNo: string; gender: 'M' | 'F' | null; age: number | null };
  date: number; // epoch ms
  stage: string;
  result: SavedResult;
};

export function RecordView({ patient, date, stage, result }: RecordViewProps) {
  const top = result.top && TYPE_INFO[result.top] ? result.top : null;
  const info = top ? TYPE_INFO[top] : null;
  const pcts = result.pcts ?? {};

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 sm:py-12 space-y-6">

        <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <p className="text-xs tracking-widest text-zinc-500 dark:text-zinc-400">온누리한의원 · 원장실</p>
            <h1 className="text-lg sm:text-xl font-serif font-semibold text-zinc-900 dark:text-zinc-100">
              환자 기록 — 1차 결과
            </h1>
          </div>
          <Link
            href="/clinic"
            className="text-xs px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            ← 목록
          </Link>
        </div>

        {/* 환자 정보 */}
        <div className="rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">{patient.name}</span>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">차트 {patient.chartNo}</span>
            {(patient.gender || patient.age != null) && (
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                {patient.gender === 'M' ? '남' : patient.gender === 'F' ? '여' : ''}
                {patient.gender && patient.age != null ? ' · ' : ''}
                {patient.age != null ? `${patient.age}세` : ''}
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            {new Date(date).toLocaleString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
            {' · '}
            {stage === 'intake' ? '1차 완료' : stage}
          </p>
        </div>

        {/* 판정 체질 */}
        {info ? (
          <div
            className="rounded-2xl p-6 flex items-center gap-4 border-2"
            style={{ borderColor: info.color, backgroundColor: `${info.color}10` }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl text-white font-bold flex-shrink-0"
              style={{ backgroundColor: info.color }}
            >
              {info.icon}
            </div>
            <div>
              <p className="text-xs font-medium tracking-wider" style={{ color: info.color }}>판정 체질</p>
              <h2 className="text-2xl font-bold mt-0.5" style={{ color: info.color }}>
                {info.name} <span className="text-lg font-serif">{info.hanja}</span>
              </h2>
              <p className="text-sm" style={{ color: info.color, opacity: 0.8 }}>{info.organ}</p>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 text-sm text-zinc-500">
            저장된 결과에 판정 체질 정보가 없습니다.
          </div>
        )}

        {/* 신뢰도 + 한열 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4">
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">판정 신뢰도</p>
            <p className="font-semibold text-zinc-900 dark:text-zinc-100">
              {result.confidence?.level ?? '—'}
            </p>
            {result.confidence?.detail && (
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">{result.confidence.detail}</p>
            )}
          </div>
          <div className="rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4">
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">한열 판정</p>
            <p className="font-semibold text-zinc-900 dark:text-zinc-100">
              {result.hanyul ? HANYUL_LABEL[result.hanyul] ?? result.hanyul : '—'}
            </p>
            {result.hanyulCounts && (
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                寒 {result.hanyulCounts.cold ?? 0} · 熱 {result.hanyulCounts.hot ?? 0}
              </p>
            )}
          </div>
        </div>

        {/* 체질 분포 */}
        <div className="rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 space-y-3">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">체질 분포 (Prior 보정)</h3>
          {CONSTITUTIONS.map((c) => {
            const ti = TYPE_INFO[c];
            const pct = Math.round(pcts[c] ?? 0);
            const isTop = c === top;
            return (
              <div key={c} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium" style={{ color: ti.color }}>
                    {ti.name} {isTop && '✓'}
                  </span>
                  <span className="text-zinc-600 dark:text-zinc-400 tabular-nums font-medium">{pct}%</span>
                </div>
                <div className="h-3 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: ti.color }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Phase 3 자리 */}
        <div className="rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 p-5 text-center text-sm text-zinc-400">
          2차 추가 설문 · 처방 도출은 다음 단계(Phase 3)에서 추가됩니다.
        </div>

        {result.answered != null && result.total != null && (
          <div className="text-center text-[10px] text-zinc-400">
            응답: {result.answered} / {result.total} 문항
            {result.coverage != null && ` · 커버리지 ${Math.round(result.coverage * 100)}%`}
          </div>
        )}
      </div>
    </div>
  );
}
