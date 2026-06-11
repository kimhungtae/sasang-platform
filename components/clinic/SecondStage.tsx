'use client';

/**
 * Phase 3 — 원장실 2차 추가 설문 + 처방 도출 (클라이언트)
 *
 * 1차 결과(체질·한열) 위에, 원장이 진료실에서:
 *  - 정밀시진·기능검사 소견을 입력하고
 *  - 1차 자동 한열 판정을 직접 보정(재확인)하고
 *  - 그 결과에 맞는 처방 후보(type-info.ts rx/rxCold/rxHot)를 보고 선택해
 *  - 2차 소견(검토) 또는 처방 확정으로 저장한다.
 *
 * ⚠️ 처방 후보는 보조 참고용. 최종 판단·처방은 원장 책임.
 */

import { useMemo, useState } from 'react';
import { TYPE_INFO, type Constitution } from '@/data/type-info';
import {
  derivePrescriptions,
  normalizeHanyul,
  type HanyulKey,
  type RxCandidate,
} from '@/lib/prescription';
import { saveClinicRecord, type ClinicMemoData } from '@/app/actions/clinic-record';

type Props = {
  recordId: number;
  top: Constitution | null;
  resultHanyul: HanyulKey; // 1차 자동 판정
  initialMemo: ClinicMemoData | null;
  initialStage: string;
};

const HANYUL_OPTIONS: { key: HanyulKey; label: string; hint: string }[] = [
  { key: 'cold', label: '寒者 (한자)', hint: '냉증·소화저하 경향' },
  { key: 'hot', label: '熱者 (열자)', hint: '열감·상열 경향' },
  { key: 'neutral', label: '중간·보류', hint: '뚜렷하지 않음' },
];

export function SecondStage({
  recordId,
  top,
  resultHanyul,
  initialMemo,
  initialStage,
}: Props) {
  const [visual, setVisual] = useState(initialMemo?.visual ?? '');
  const [functional, setFunctional] = useState(initialMemo?.functional ?? '');
  const [hanyulConfirm, setHanyulConfirm] = useState<HanyulKey>(
    initialMemo?.hanyulConfirm
      ? normalizeHanyul(initialMemo.hanyulConfirm)
      : resultHanyul,
  );
  const [selectedRx, setSelectedRx] = useState(initialMemo?.selectedRx ?? '');
  const [memo, setMemo] = useState(initialMemo?.memo ?? '');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ kind: 'ok' | 'err'; msg: string } | null>(
    null,
  );

  const rxSet = useMemo(
    () => (top ? derivePrescriptions(top, hanyulConfirm) : null),
    [top, hanyulConfirm],
  );

  if (!top || !rxSet) {
    return (
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-5 text-sm text-zinc-500">
        1차 판정 체질 정보가 없어 처방 후보를 표시할 수 없습니다.
      </div>
    );
  }

  const info = TYPE_INFO[top];

  async function save(stage: 'reviewed' | 'prescribed') {
    setSaving(true);
    setStatus(null);
    const res = await saveClinicRecord({
      recordId,
      stage,
      memo: { visual, functional, hanyulConfirm, selectedRx, memo },
    });
    setSaving(false);
    if (res.ok) {
      setStatus({
        kind: 'ok',
        msg: stage === 'prescribed' ? '처방이 확정 저장되었습니다.' : '2차 소견이 저장되었습니다.',
      });
    } else {
      setStatus({ kind: 'err', msg: res.error });
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 pt-2">
        <span className="text-xs font-semibold tracking-widest text-zinc-500 dark:text-zinc-400">
          2차 — 정밀 진찰 · 처방
        </span>
        <span className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
        <StageBadge stage={initialStage} />
      </div>

      {/* 정밀시진 · 기능검사 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="정밀시진 소견" hint="형색·설진·면색 등">
          <textarea
            value={visual}
            onChange={(e) => setVisual(e.target.value)}
            rows={3}
            placeholder="예) 면색 약간 붉음, 설질 담홍 설태 박백…"
            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-zinc-400"
          />
        </Field>
        <Field label="기능검사 소견" hint="맥진·복진·한출·이변 등">
          <textarea
            value={functional}
            onChange={(e) => setFunctional(e.target.value)}
            rows={3}
            placeholder="예) 맥 침세, 복진 심하비, 대변 1회/2일…"
            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-zinc-400"
          />
        </Field>
      </div>

      {/* 한열 재확인 */}
      <div className="rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">한열 재확인</p>
          <p className="text-xs text-zinc-400">
            1차 자동: {labelOfHanyul(resultHanyul)}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {HANYUL_OPTIONS.map((opt) => {
            const active = hanyulConfirm === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => setHanyulConfirm(opt.key)}
                className={`rounded-lg border px-3 py-2 text-center transition ${
                  active
                    ? 'border-transparent text-white'
                    : 'border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                }`}
                style={active ? { backgroundColor: info.color } : undefined}
              >
                <span className="block text-sm font-semibold">{opt.label}</span>
                <span className={`block text-[11px] ${active ? 'opacity-90' : 'text-zinc-400'}`}>
                  {opt.hint}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 처방 후보 */}
      <div className="rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
            처방 후보 — {info.name} {info.hanja}
          </h3>
          <span className="text-[11px] text-zinc-400">보조 참고 · 최종 판단은 원장</span>
        </div>

        {rxSet.targeted && (
          <RxBlock
            badge={rxSet.targetedLabel ?? '맞춤 처방'}
            badgeColor={info.color}
            rx={rxSet.targeted}
            selectedRx={selectedRx}
            onSelect={setSelectedRx}
            highlight
          />
        )}
        <RxBlock
          badge="기본 처방"
          badgeColor="#71717a"
          rx={rxSet.base}
          selectedRx={selectedRx}
          onSelect={setSelectedRx}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 pt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
          <p><span className="text-zinc-400">대표 병증</span> · {rxSet.disease}</p>
          <p><span className="text-zinc-400">권장/주의 음식</span> · {rxSet.good} / {rxSet.bad}</p>
        </div>

        {selectedRx && (
          <div
            className="rounded-lg px-3 py-2 text-sm font-medium"
            style={{ backgroundColor: `${info.color}12`, color: info.color }}
          >
            선택 처방: {selectedRx}
            <button
              type="button"
              onClick={() => setSelectedRx('')}
              className="ml-2 text-xs underline opacity-70 hover:opacity-100"
            >
              해제
            </button>
          </div>
        )}
      </div>

      {/* 자유 메모 */}
      <Field label="처방 메모" hint="가감·복약지도·재진 계획 등">
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          rows={2}
          placeholder="예) 본방 가 산조인 1돈, 7일분. 1주 후 재진."
          className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-zinc-400"
        />
      </Field>

      {/* 저장 */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <button
          type="button"
          disabled={saving}
          onClick={() => save('reviewed')}
          className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50 transition"
        >
          2차 소견 저장 (검토)
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => save('prescribed')}
          className="flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50 transition"
          style={{ backgroundColor: info.color }}
        >
          처방 확정 저장
        </button>
      </div>

      {status && (
        <p
          className={`text-sm text-center ${
            status.kind === 'ok'
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-red-600 dark:text-red-400'
          }`}
        >
          {status.kind === 'ok' ? '✓ ' : '⚠ '}
          {status.msg}
        </p>
      )}
    </div>
  );
}

function RxBlock({
  badge,
  badgeColor,
  rx,
  selectedRx,
  onSelect,
  highlight,
}: {
  badge: string;
  badgeColor: string;
  rx: RxCandidate;
  selectedRx: string;
  onSelect: (name: string) => void;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-lg p-3 ${
        highlight
          ? 'border-2'
          : 'border border-zinc-200 dark:border-zinc-800'
      }`}
      style={highlight ? { borderColor: badgeColor, backgroundColor: `${badgeColor}08` } : undefined}
    >
      <div className="flex items-center gap-2 mb-2">
        <span
          className="text-[11px] font-semibold px-2 py-0.5 rounded-full text-white"
          style={{ backgroundColor: badgeColor }}
        >
          {badge}
        </span>
        <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{rx.principle}</span>
      </div>
      {rx.formulas.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {rx.formulas.map((f) => {
            const active = selectedRx === f;
            return (
              <button
                key={f}
                type="button"
                onClick={() => onSelect(active ? '' : f)}
                className={`rounded-full px-3 py-1 text-sm border transition ${
                  active
                    ? 'border-transparent text-white'
                    : 'border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                }`}
                style={active ? { backgroundColor: badgeColor } : undefined}
              >
                {f}
              </button>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-zinc-400">처방명이 등록되지 않았습니다.</p>
      )}
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline gap-2 mb-1">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</label>
        {hint && <span className="text-[11px] text-zinc-400">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function StageBadge({ stage }: { stage: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    intake: { label: '1차 완료', cls: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300' },
    reviewed: { label: '검토됨', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
    prescribed: { label: '처방 완료', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
  };
  const s = map[stage] ?? map.intake;
  return <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${s.cls}`}>{s.label}</span>;
}

function labelOfHanyul(h: HanyulKey): string {
  if (h === 'cold') return '寒者';
  if (h === 'hot') return '熱者';
  return '보류';
}
