'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { QuestionData } from '@/lib/quiz';
import { calcScores, calcPartTallies, type AnswersMap, type StageResult } from '@/lib/scoring';
import { TYPE_INFO, HANYUL_LABEL, CONSTITUTIONS, type Constitution } from '@/data/type-info';
import { Disclaimer } from '@/components/Disclaimer';

type Props = {
  questions: QuestionData[];
};

const STORAGE_KEY = 'sasang-quiz-answers';

const SECTION_LABEL: Record<string, string> = {
  body: '체형',
  physio: '생리',
  ox: '예/아니오',
  char: '성격',
  emo: '심리',
  food: '음식',
};

export function ResultView({ questions }: Props) {
  const [answers, setAnswers] = useState<AnswersMap | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) {
      setAnswers({});
      return;
    }
    try {
      setAnswers(JSON.parse(stored));
    } catch {
      setAnswers({});
    }
  }, []);

  const final = useMemo<StageResult | null>(() => {
    if (!answers) return null;
    return calcScores(questions, answers, 3);
  }, [questions, answers]);

  const stage1 = useMemo<StageResult | null>(() => {
    if (!answers) return null;
    return calcScores(questions, answers, 1);
  }, [questions, answers]);

  const stage2 = useMemo<StageResult | null>(() => {
    if (!answers) return null;
    return calcScores(questions, answers, 2);
  }, [questions, answers]);

  const tallies = useMemo(() => {
    if (!answers) return null;
    return calcPartTallies(questions, answers);
  }, [questions, answers]);

  function resetQuiz() {
    sessionStorage.removeItem(STORAGE_KEY);
    window.location.href = '/quiz';
  }

  if (!answers) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-zinc-500">결과 계산 중...</p>
      </div>
    );
  }

  if (!final || final.answered === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white dark:from-zinc-950 dark:to-zinc-900">
        <div className="max-w-2xl mx-auto px-4 py-12 sm:px-6 sm:py-20 space-y-6 text-center">
          <div className="text-5xl">📋</div>
          <h1 className="text-2xl font-bold">아직 응답된 문항이 없습니다</h1>
          <p className="text-zinc-600">설문을 먼저 진행해주세요.</p>
          <Link href="/quiz" className="inline-block px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium">
            설문 시작하기
          </Link>
        </div>
      </div>
    );
  }

  const info = TYPE_INFO[final.top];
  const rxByHanyul =
    final.hanyul === 'cold' ? info.rxCold :
    final.hanyul === 'hot' ? info.rxHot :
    info.rx;

  const stageRankChanged = stage1!.top !== final.top || stage2!.top !== final.top;

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/30 to-white dark:from-zinc-950 dark:to-zinc-900">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 sm:py-12 space-y-6">

        {/* 헤더 */}
        <div className="text-center space-y-1 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <p className="text-xs tracking-widest text-zinc-500 dark:text-zinc-400">온 누 리 한 의 원</p>
          <h1 className="text-xl sm:text-2xl font-serif font-semibold text-zinc-900 dark:text-zinc-100">
            사상체질 감별 결과지
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* 히어로 — 판정 체질 */}
        <div
          className="rounded-2xl p-6 sm:p-8 flex items-center gap-4 sm:gap-6 shadow-sm border-2"
          style={{
            borderColor: info.color,
            backgroundColor: `${info.color}10`,
          }}
        >
          <div
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl text-white font-bold shadow-lg flex-shrink-0"
            style={{ backgroundColor: info.color }}
          >
            {info.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium tracking-wider" style={{ color: info.color }}>판정 체질</p>
            <h2 className="text-2xl sm:text-3xl font-bold mt-1" style={{ color: info.color }}>
              {info.name} <span className="text-lg sm:text-xl font-serif">{info.hanja}</span>
            </h2>
            <p className="text-sm mt-1" style={{ color: info.color, opacity: 0.8 }}>{info.organ}</p>
          </div>
        </div>

        {/* 신뢰도 + 한열 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4">
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">판정 신뢰도</p>
            <p className="font-semibold text-zinc-900 dark:text-zinc-100">
              {final.confidence.level}
              {final.confidence.level === '높음' && ' ✓'}
            </p>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">{final.confidence.detail}</p>
          </div>
          <div className="rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4">
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">한열 판정</p>
            <p className="font-semibold text-zinc-900 dark:text-zinc-100">{HANYUL_LABEL[final.hanyul]}</p>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
              寒 {final.hanyulCounts.cold} · 熱 {final.hanyulCounts.hot}
              {final.top === 'sy' && ` · 소양OX 寒${final.hanyulSyCounts.cold}/熱${final.hanyulSyCounts.hot}`}
            </p>
          </div>
        </div>

        {/* 태양인 경고 */}
        {info.warn && (
          <div className="rounded-lg border-2 border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-4 text-sm text-red-900 dark:text-red-200">
            ⚠️ <strong>태양인 판정</strong> — 인구 0.1% 미만 극소수 체질입니다.
            소양인과 반드시 감별이 필요하며, 약물반응 시험을 권장합니다.
          </div>
        )}

        {/* 체질 분포 점수 바 */}
        <div className="rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 space-y-3">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">체질 분포 (Prior 보정)</h3>
          {CONSTITUTIONS.map((c) => {
            const ti = TYPE_INFO[c];
            const pct = final.pcts[c];
            const isTop = c === final.top;
            return (
              <div key={c} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium" style={{ color: ti.color }}>
                    {ti.name} {isTop && '✓'}
                  </span>
                  <span className="text-zinc-600 dark:text-zinc-400 tabular-nums font-medium">{pct}%</span>
                </div>
                <div className="h-3 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, backgroundColor: ti.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* 단계별 추이 */}
        <div className="rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 space-y-3">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
            진단 단계별 추이 — 체형/생리/OX → +성격·심리 → +음식·확정
            {stageRankChanged && (
              <span className="ml-2 text-red-600 dark:text-red-400 text-xs">⚡ 1위 변동 — 면담 권장</span>
            )}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                  <th className="text-left py-2 pr-2">단계</th>
                  {CONSTITUTIONS.map((c) => (
                    <th key={c} className="text-center py-2 px-1 font-medium" style={{ color: TYPE_INFO[c].color }}>
                      {TYPE_INFO[c].name.slice(0, 2)}
                    </th>
                  ))}
                  <th className="text-right py-2 pl-2">우세</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { key: '1차', s: stage1! },
                  { key: '2차', s: stage2! },
                  { key: '최종', s: final },
                ].map(({ key, s }) => (
                  <tr key={key} className="border-b border-zinc-100 dark:border-zinc-800">
                    <td className="py-2 pr-2 font-medium text-zinc-700 dark:text-zinc-300">{key}</td>
                    {CONSTITUTIONS.map((c) => (
                      <td key={c} className={`text-center py-2 px-1 tabular-nums ${c === s.top ? 'font-bold' : 'text-zinc-500'}`}>
                        {s.pcts[c]}%
                      </td>
                    ))}
                    <td className="text-right py-2 pl-2 font-semibold" style={{ color: TYPE_INFO[s.top].color }}>
                      {TYPE_INFO[s.top].name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* PART별 응답 분포 */}
        {tallies && (
          <div className="rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 space-y-3">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
              PART별 응답 분포 — 체질 신호 카운트
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                    <th className="text-left py-2 pr-2">PART</th>
                    {CONSTITUTIONS.map((c) => (
                      <th key={c} className="text-center py-2 px-1 font-medium" style={{ color: TYPE_INFO[c].color }}>
                        {TYPE_INFO[c].name.slice(0, 2)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(tallies).map(([part, v]) => {
                    const isBip = v._yes !== undefined;
                    return (
                      <tr key={part} className="border-b border-zinc-100 dark:border-zinc-800">
                        <td className="py-2 pr-2 font-medium text-zinc-700 dark:text-zinc-300">
                          {SECTION_LABEL[part] ?? part}
                          {isBip && <span className="text-zinc-400 ml-1 text-[10px]">±</span>}
                        </td>
                        {CONSTITUTIONS.map((c) => {
                          const yc = isBip ? v._yes![c] : v[c];
                          const nc = isBip ? v._no![c] : 0;
                          return (
                            <td
                              key={c}
                              className="text-center py-2 px-1 tabular-nums"
                              style={{
                                backgroundColor: yc > 0 ? `${TYPE_INFO[c].color}15` : undefined,
                                color: yc > 0 ? TYPE_INFO[c].color : undefined,
                                fontWeight: yc > 0 ? 600 : 400,
                              }}
                            >
                              {yc}
                              {isBip && nc > 0 && <span className="text-zinc-400 ml-0.5">/-{nc}</span>}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-zinc-400">
              ± 표시: 체형·음식은 양극단 응답 (yes/no 둘 다 카운트)
            </p>
          </div>
        )}

        {/* 체질 특성 */}
        <div className="rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 space-y-4">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
            {info.name}({info.hanja}) 특성
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <Field label="특성" value={info.trait} />
            <Field label="생리 지표" value={info.physio} />
            <Field label="대표 병증" value={info.disease} />
            <Field label="감정 특성" value={info.emotion} />
            <Field label="좋은 음식" value={info.good} accent="emerald" />
            <Field label="삼가야 할 음식" value={info.bad} accent="red" />
          </div>
          {info.note && (
            <p className="text-xs text-zinc-500 italic border-t border-zinc-100 dark:border-zinc-800 pt-3">
              ※ {info.note}
            </p>
          )}
        </div>

        {/* 처방 방향 */}
        <div className="rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 space-y-3">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
            처방 방향 <span className="text-sm text-zinc-500">({HANYUL_LABEL[final.hanyul]})</span>
          </h3>
          <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
            {rxByHanyul}
          </p>
          <p className="text-xs text-zinc-400 italic">※ 실제 처방은 한의사 진료 후 결정됩니다.</p>
        </div>

        {/* 양생 가이드 */}
        <div className="rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 space-y-3">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{info.name} 양생 가이드</h3>
          <ol className="space-y-2.5 text-sm text-zinc-700 dark:text-zinc-300">
            {info.saeng.map((s, i) => (
              <li key={i} className="flex gap-3">
                <span
                  className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: info.color }}
                >
                  {i + 1}
                </span>
                <span className="leading-relaxed">{s}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* 면책 + 액션 */}
        <Disclaimer variant="full" />

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            type="button"
            onClick={resetQuiz}
            className="px-6 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition"
          >
            다시 검사하기
          </button>
          <Link
            href="/"
            className="px-6 py-2.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition text-center"
          >
            홈으로
          </Link>
        </div>

        <div className="text-center text-[10px] text-zinc-400 pt-4">
          응답: {final.answered} / {final.total} 문항 · 커버리지 {Math.round(final.coverage * 100)}%
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, accent }: { label: string; value: string; accent?: 'emerald' | 'red' }) {
  const color =
    accent === 'emerald' ? 'text-emerald-700 dark:text-emerald-300' :
    accent === 'red' ? 'text-red-700 dark:text-red-300' :
    'text-zinc-700 dark:text-zinc-300';
  return (
    <div>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">{label}</p>
      <p className={`text-sm leading-relaxed ${color}`}>{value}</p>
    </div>
  );
}
