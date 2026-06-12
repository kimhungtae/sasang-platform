'use client';

/**
 * Phase 3 — 원장실 2차 추가 설문 + 처방 도출 (클라이언트)
 *
 * 1차 결과(체질·한열) 위에, 원장이 진료실에서:
 *  - 정밀시진·기능검사 소견을 입력하고
 *  - 1차 자동 한열 판정을 직접 보정(재확인)하고
 *  - 류주열 처방(체질별 DB)을 검색·선택해 처방을 확정하고
 *  - (참고로) 전통 체질 처방을 함께 보고
 *  - 2차 소견(검토) 또는 처방 확정으로 저장한다.
 *
 * 처방 우선순위: 류주열 처방을 메인으로, 전통 체질 처방(type-info)은 하단 참고용.
 * ⚠️ 최종 판단·처방은 원장 책임.
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

type RxOption = { id: string; name: string; current: string | null; legacy: string | null };

type Props = {
  recordId: number;
  top: Constitution | null;
  resultHanyul: HanyulKey; // 1차 자동 판정
  initialMemo: ClinicMemoData | null;
  initialStage: string;
  prescriptions: RxOption[]; // 판정 체질의 류주열 처방 (메인 후보)
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
  prescriptions,
}: Props) {
  const [visual, setVisual] = useState(initialMemo?.visual ?? '');
  const [functional, setFunctional] = useState(initialMemo?.functional ?? '');
  const [hanyulConfirm, setHanyulConfirm] = useState<HanyulKey>(
    initialMemo?.hanyulConfirm
      ? normalizeHanyul(initialMemo.hanyulConfirm)
      : resultHanyul,
  );
  const [selectedRxId, setSelectedRxId] = useState(initialMemo?.selectedRxId ?? '');
  const [selectedRxName, setSelectedRxName] = useState(initialMemo?.selectedRx ?? '');
  const [selectedRxComposition, setSelectedRxComposition] = useState(
    initialMemo?.selectedRxComposition ?? '',
  );
  const [rxQuery, setRxQuery] = useState('');
  const [memo, setMemo] = useState(initialMemo?.memo ?? '');
  const [showTraditional, setShowTraditional] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ kind: 'ok' | 'err'; msg: string } | null>(null);

  const rxSet = useMemo(
    () => (top ? derivePrescriptions(top, hanyulConfirm) : null),
    [top, hanyulConfirm],
  );

  const filtered = useMemo(() => {
    const q = rxQuery.trim();
    if (!q) return prescriptions;
    return prescriptions.filter(
      (p) => p.name.includes(q) || (p.current ?? '').includes(q),
    );
  }, [prescriptions, rxQuery]);

  if (!top || !rxSet) {
    return (
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-5 text-sm text-zinc-500">
        1차 판정 체질 정보가 없어 처방 후보를 표시할 수 없습니다.
      </div>
    );
  }

  const info = TYPE_INFO[top];

  function pickRx(p: RxOption) {
    if (selectedRxId === p.id) {
      setSelectedRxId('');
      setSelectedRxName('');
      setSelectedRxComposition('');
    } else {
      setSelectedRxId(p.id);
      setSelectedRxName(p.name);
      setSelectedRxComposition(p.current ?? '');
    }
  }

  async function save(stage: 'reviewed' | 'prescribed') {
    setSaving(true);
    setStatus(null);
    const res = await saveClinicRecord({
      recordId,
      stage,
      memo: {
        visual,
        functional,
        hanyulConfirm,
        selectedRx: selectedRxName,
        selectedRxId,
        selectedRxComposition,
        memo,
      },
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
          <p className="text-xs text-zinc-400">1차 자동: {labelOfHanyul(resultHanyul)}</p>
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

      {/* 메인 — 류주열 처방 검색·선택 */}
      <div className="rounded-lg bg-white dark:bg-zinc-900 border-2 p-5 space-y-3" style={{ borderColor: info.color }}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
            류주열 처방 — {info.name} {info.hanja}
            <span className="ml-2 text-xs font-normal text-zinc-400">{prescriptions.length}개</span>
          </h3>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: info.color }}>
            메인 처방
          </span>
        </div>

        {prescriptions.length === 0 ? (
          <p className="text-sm text-zinc-400">이 체질의 류주열 처방이 DB에 없습니다.</p>
        ) : (
          <>
            <input
              type="text"
              value={rxQuery}
              onChange={(e) => setRxQuery(e.target.value)}
              placeholder="처방명 또는 약재로 검색 (예: 태음조위탕 / 마황)"
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
            />

            <div className="max-h-72 overflow-y-auto rounded-lg border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800">
              {filtered.length === 0 ? (
                <p className="p-3 text-sm text-zinc-400">검색 결과가 없습니다.</p>
              ) : (
                filtered.map((p) => {
                  const active = selectedRxId === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => pickRx(p)}
                      className={`w-full text-left px-3 py-2 transition ${
                        active
                          ? 'text-white'
                          : 'hover:bg-zinc-50 dark:hover:bg-zinc-800'
                      }`}
                      style={active ? { backgroundColor: info.color } : undefined}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] tabular-nums ${active ? 'opacity-80' : 'text-zinc-400'}`}>
                          {p.id}
                        </span>
                        <span className="text-sm font-medium">{p.name}</span>
                      </div>
                      {p.current && (
                        <p className={`text-[11px] mt-0.5 leading-snug ${active ? 'opacity-90' : 'text-zinc-500 dark:text-zinc-400'}`}>
                          {p.current}
                        </p>
                      )}
                    </button>
                  );
                })
              )}
            </div>
            {filtered.length > 0 && (
              <p className="text-[11px] text-zinc-400 text-right">{filtered.length}개 표시</p>
            )}
          </>
        )}

        {selectedRxName && (
          <div className="rounded-lg p-3" style={{ backgroundColor: `${info.color}12` }}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold" style={{ color: info.color }}>
                선택: {selectedRxName}
                {selectedRxId && <span className="ml-1 text-[11px] font-normal opacity-70">({selectedRxId})</span>}
              </span>
              <button
                type="button"
                onClick={() => {
                  setSelectedRxId('');
                  setSelectedRxName('');
                  setSelectedRxComposition('');
                }}
                className="text-xs underline opacity-70 hover:opacity-100"
                style={{ color: info.color }}
              >
                해제
              </button>
            </div>
            {selectedRxComposition && (
              <p className="text-xs mt-1 leading-relaxed" style={{ color: info.color }}>
                {selectedRxComposition}
              </p>
            )}
          </div>
        )}
      </div>

      {/* 참고 — 전통 체질 처방 (type-info) */}
      <div className="rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => setShowTraditional((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm"
        >
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            참고 · 전통 체질 처방 ({labelOfHanyul(hanyulConfirm)})
          </span>
          <span className="text-zinc-400">{showTraditional ? '▲ 접기' : '▼ 펼치기'}</span>
        </button>
        {showTraditional && (
          <div className="px-4 pb-4 space-y-3">
            {rxSet.targeted && (
              <RxBlock badge={rxSet.targetedLabel ?? '맞춤 처방'} badgeColor={info.color} rx={rxSet.targeted} />
            )}
            <RxBlock badge="기본 처방" badgeColor="#71717a" rx={rxSet.base} />
            <p className="text-[11px] text-zinc-400">대표 병증 · {rxSet.disease}</p>
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
}: {
  badge: string;
  badgeColor: string;
  rx: RxCandidate;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-3">
      <div className="flex items-center gap-2 mb-1.5">
        <span
          className="text-[11px] font-semibold px-2 py-0.5 rounded-full text-white"
          style={{ backgroundColor: badgeColor }}
        >
          {badge}
        </span>
        <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{rx.principle}</span>
      </div>
      {rx.formulas.length > 0 ? (
        <p className="text-sm text-zinc-700 dark:text-zinc-200">{rx.formulas.join(' · ')}</p>
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
