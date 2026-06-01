'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProgressBar } from './ProgressBar';

type Effects = Record<string, unknown>;

type Choice = {
  id: number;
  order: number;
  label: string;
  effects: Effects;
};

type Question = {
  id: number;
  order: number;
  code: string | null;
  section: string | null;
  text: string;
  tag: string | null;
  type: 'single' | 'single-unknown' | 'multiselect-food' | 'ox' | 'killer-ox' | 'dual-mark';
  isCore: boolean;
  confirmConstitution: string | null;
  choices: Choice[];
};

type Props = {
  question: Question;
  totalQuestions: number;
};

const STORAGE_KEY = 'sasang-quiz-answers';

// dual-mark용: 각 choice마다 'yes' | 'no' | null
type DualMarks = Record<number, 'yes' | 'no' | null>;

type StoredAnswer = {
  questionId: number;
  choiceId?: number;
  choiceIds?: number[];
  marks?: DualMarks; // dual-mark용
};

const SECTION_LABEL: Record<string, string> = {
  body: 'PART 1. 체형·골격',
  physio: 'PART 2. 생리·건강',
  ox: 'PART 3. 예/아니오',
  char: 'PART 4. 성격·기질',
  emo: 'PART 5. 심리·감정',
  food: 'PART 6. 음식 반응',
  killer: '확정 문항',
};

const SECTION_COLOR: Record<string, string> = {
  body: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
  physio: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200',
  ox: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200',
  char: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
  emo: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200',
  food: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
  killer: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200',
};

function constitutionOfChoice(effects: Effects): string | null {
  for (const key of ['ty', 'te', 'sy', 'se']) {
    if (typeof (effects as any)[key] === 'number') return key;
  }
  if ((effects as any).confirm) return String((effects as any).confirm);
  return null;
}

const CONSTITUTION_COLOR: Record<string, { border: string; bg: string; text: string }> = {
  ty: { border: 'border-red-700', bg: 'bg-red-50 dark:bg-red-950/30', text: 'text-red-900 dark:text-red-200' },
  te: { border: 'border-emerald-800', bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-900 dark:text-emerald-200' },
  sy: { border: 'border-orange-700', bg: 'bg-orange-50 dark:bg-orange-950/30', text: 'text-orange-900 dark:text-orange-200' },
  se: { border: 'border-blue-800', bg: 'bg-blue-50 dark:bg-blue-950/30', text: 'text-blue-900 dark:text-blue-200' },
};

export function QuizStep({ question, totalQuestions }: Props) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [marks, setMarks] = useState<DualMarks>({});
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) {
      setSelectedId(null);
      setSelectedIds([]);
      setMarks({});
      return;
    }
    try {
      const answers: Record<string, StoredAnswer> = JSON.parse(stored);
      const existing = answers[String(question.id)];
      if (existing) {
        setSelectedId(existing.choiceId ?? null);
        setSelectedIds(existing.choiceIds ?? []);
        setMarks(existing.marks ?? {});
      } else {
        setSelectedId(null);
        setSelectedIds([]);
        setMarks({});
      }
    } catch {
      // ignore
    }
  }, [question.id]);

  function handleSelect(choiceId: number) {
    setSelectedId(choiceId);
    setError('');
  }

  function handleMultiToggle(choiceId: number) {
    setSelectedIds((prev) =>
      prev.includes(choiceId) ? prev.filter((id) => id !== choiceId) : [...prev, choiceId],
    );
    setError('');
  }

  function handleDualMark(choiceId: number, mark: 'yes' | 'no') {
    setMarks((prev) => {
      const next = { ...prev };
      // 같은 것 다시 누르면 해제
      if (next[choiceId] === mark) {
        next[choiceId] = null;
      } else {
        next[choiceId] = mark;
      }
      return next;
    });
    setError('');
  }

  function navigate(direction: 'next' | 'prev') {
    if (direction === 'next') {
      const isMulti = question.type === 'multiselect-food';
      const isDualMark = question.type === 'dual-mark';

      if (isDualMark) {
        // dual-mark는 비워두는 것도 정답 (안내문 참조). 검증 없음.
      } else if (isMulti) {
        if (selectedIds.length === 0) {
          setError('하나 이상 선택해주세요.');
          return;
        }
      } else if (selectedId === null) {
        setError('답을 선택해주세요. ("잘 모르겠음"도 선택지입니다)');
        return;
      }

      const stored = sessionStorage.getItem(STORAGE_KEY);
      const answers: Record<string, StoredAnswer> = stored ? JSON.parse(stored) : {};
      answers[String(question.id)] = {
        questionId: question.id,
        ...(isDualMark
          ? { marks }
          : isMulti
            ? { choiceIds: selectedIds }
            : { choiceId: selectedId! }),
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
    }

    const target = direction === 'next' ? question.order + 1 : question.order - 1;
    if (target > totalQuestions) {
      router.push('/result');
    } else if (target < 1) {
      router.push('/quiz');
    } else {
      router.push(`/quiz/${target}`);
    }
  }

  const isFirst = question.order === 1;
  const isLast = question.order === totalQuestions;
  const isOX = question.type === 'ox' || question.type === 'killer-ox';
  const isDualMark = question.type === 'dual-mark';
  const isSingleUnknown = question.type === 'single-unknown';

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 sm:px-6 sm:py-12 space-y-6">
      <ProgressBar current={question.order} total={totalQuestions} />

      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap text-sm">
          <span className="text-zinc-500 dark:text-zinc-400">문항 {question.order} / {totalQuestions}</span>
          {question.section && (
            <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${SECTION_COLOR[question.section] ?? SECTION_COLOR.body}`}>
              {SECTION_LABEL[question.section] ?? question.section}
            </span>
          )}
          {question.tag && (
            <span className="inline-block rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-2 py-0.5 text-xs">
              {question.tag}
            </span>
          )}
          {question.isCore && (
            <span className="inline-block rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 text-xs font-medium">
              핵심
            </span>
          )}
        </div>
        <h2 className="text-xl sm:text-2xl font-semibold leading-tight text-zinc-900 dark:text-zinc-100">
          {question.text}
        </h2>
        {isDualMark && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-3">
            각 보기마다 <strong className="text-emerald-700 dark:text-emerald-400">확실히 그렇다</strong> /{' '}
            <strong className="text-zinc-700 dark:text-zinc-300">확실히 아니다</strong>를 표시하세요.
            <br />
            <span className="text-xs">⚠️ 모르겠으면 비워두는 것이 정답입니다. (원장님 면담으로 보충)</span>
          </p>
        )}
      </div>

      {/* dual-mark 타입 */}
      {isDualMark ? (
        <div className="space-y-3">
          {question.choices.map((c) => {
            const mark = marks[c.id] ?? null;
            const cKey = constitutionOfChoice(c.effects);
            const colors = cKey ? CONSTITUTION_COLOR[cKey] : null;
            return (
              <div
                key={c.id}
                className={`rounded-lg border-2 p-4 transition-all ${
                  mark === 'yes' && colors
                    ? `${colors.border} ${colors.bg}`
                    : mark === 'no'
                      ? 'border-zinc-400 bg-zinc-100 dark:bg-zinc-800 dark:border-zinc-600 opacity-60'
                      : 'border-zinc-200 dark:border-zinc-800'
                }`}
              >
                <div className="space-y-3">
                  <p className={`text-sm sm:text-base leading-relaxed ${mark === 'no' ? 'line-through text-zinc-500' : 'text-zinc-800 dark:text-zinc-200'}`}>
                    <span className="font-semibold mr-1">{['①', '②', '③', '④'][c.order - 1]}</span>
                    {c.label}
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleDualMark(c.id, 'yes')}
                      className={`flex-1 px-3 py-2 rounded-md border text-sm font-medium transition ${
                        mark === 'yes'
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-emerald-500'
                      }`}
                    >
                      ✓ 확실히 그렇다
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDualMark(c.id, 'no')}
                      className={`flex-1 px-3 py-2 rounded-md border text-sm font-medium transition ${
                        mark === 'no'
                          ? 'bg-zinc-700 border-zinc-700 text-white dark:bg-zinc-600 dark:border-zinc-600'
                          : 'bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-zinc-500'
                      }`}
                    >
                      ✗ 확실히 아니다
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : isOX ? (
        /* OX 타입 (예/아니오/모름) */
        <div className="space-y-3" role="radiogroup">
          {question.choices.map((c) => {
            const selected = selectedId === c.id;
            const isYes = c.label === '예';
            const isNo = c.label === '아니오';
            return (
              <button
                key={c.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => handleSelect(c.id)}
                className={`w-full text-left rounded-lg border-2 p-4 transition-all ${
                  selected
                    ? isYes
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950'
                      : isNo
                        ? 'border-zinc-400 bg-zinc-100 dark:bg-zinc-800 dark:border-zinc-500'
                        : 'border-amber-500 bg-amber-50 dark:bg-amber-950'
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    selected
                      ? isYes ? 'border-emerald-600 bg-emerald-600' : isNo ? 'border-zinc-500 bg-zinc-500' : 'border-amber-500 bg-amber-500'
                      : 'border-zinc-300 dark:border-zinc-600'
                  }`}>
                    {selected && <div className="h-2 w-2 rounded-full bg-white" />}
                  </div>
                  <span className="text-base font-medium text-zinc-800 dark:text-zinc-200">
                    {isYes && '✓ '}{isNo && '✗ '}{!isYes && !isNo && '? '}
                    {c.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        /* single 또는 single-unknown 타입 (4지선다 + 옵션으로 모름) */
        <div className="space-y-3" role="radiogroup">
          {question.choices.map((c) => {
            const selected = selectedId === c.id;
            const cKey = constitutionOfChoice(c.effects);
            const isUnknown = isSingleUnknown && c.order === 5;
            const colors = cKey ? CONSTITUTION_COLOR[cKey] : null;
            const selectedClass = isUnknown
              ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200'
              : colors
                ? `${colors.border} ${colors.bg} ${colors.text}`
                : 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950';
            return (
              <button
                key={c.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => handleSelect(c.id)}
                className={`w-full text-left rounded-lg border-2 p-4 transition-all ${
                  selected ? selectedClass : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                } ${isUnknown ? 'border-dashed' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-1 h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    selected ? 'border-current' : 'border-zinc-300 dark:border-zinc-600'
                  }`}>
                    {selected && <div className="h-2 w-2 rounded-full bg-current" />}
                  </div>
                  <span className="text-base leading-relaxed">
                    {!isUnknown && (
                      <span className="font-semibold mr-1">{['①', '②', '③', '④'][c.order - 1]}</span>
                    )}
                    {isUnknown && <span className="mr-1">🤔</span>}
                    {c.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">{error}</p>
      )}

      <div className="flex justify-between gap-3 pt-4">
        <button
          type="button"
          onClick={() => navigate('prev')}
          disabled={isFirst}
          className="px-5 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          ← 이전
        </button>
        <button
          type="button"
          onClick={() => navigate('next')}
          className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition"
        >
          {isLast ? '결과 보기 →' : '다음 →'}
        </button>
      </div>
    </div>
  );
}
