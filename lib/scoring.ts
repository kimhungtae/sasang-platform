/**
 * 사상체질 채점 알고리즘 (v24 포팅)
 *
 * v21 Hybrid 응답 방식 + v23 stage 분리:
 *   - stage 1: 체형(±3) + 생리(+2) + OX (1차 중간 점검)
 *   - stage 2: + 성격·심리(+2) (2차 중간 점검)
 *   - stage 3 (또는 미지정): + 음식(±3) + 확정문항(+5) (최종)
 *
 * v24 변경:
 *   - PART 1·6 NO 페널티: -3 → -1 (yes/no 비대칭)
 *   - 라플라스 스무딩 (SMOOTHING_BASE = 1.0): 0% 극단 방지
 *   - ty prior 완화 (0.001 → 0.01): 한 체질만 살면 100% 극단 방지
 */

import type { QuestionData, ChoiceEffects } from './quiz';
import { CONSTITUTIONS, type Constitution, TYPE_INFO } from '@/data/type-info';

// 사용자 응답 (sessionStorage 형식)
export type DualMarks = Record<number, 'yes' | 'no' | null>;
export type UserAnswer = {
  questionId: number;
  choiceId?: number;
  choiceIds?: number[];
  marks?: DualMarks;
};
export type AnswersMap = Record<string, UserAnswer>;

// 인구비 사전확률 (v24)
const PRIOR: Record<Constitution, number> = {
  ty: 0.01,
  te: 0.45,
  sy: 0.30,
  se: 0.24,
};

const SMOOTHING_BASE = 1.0;

export type Hanyul = 'cold' | 'hot' | 'mixed' | 'neutral';

export type StageResult = {
  scores: Record<Constitution, number>;
  scoresRaw: Record<Constitution, number>;
  pcts: Record<Constitution, number>;
  top: Constitution;
  second: Constitution;
  hanyul: Hanyul;
  hanyulCounts: { cold: number; hot: number };
  hanyulSyCounts: { cold: number; hot: number };
  coverage: number; // 0~1
  answered: number;
  total: number;
  confidence: {
    level: '높음' | '보통' | '낮음';
    detail: string;
    margin: number;
  };
};

/**
 * choice의 effects가 단일 체질 점수인지 판별
 * 예: { ty: 1 } → 'ty' 반환
 */
function extractConstitutionFromEffects(effects: ChoiceEffects): Constitution | null {
  for (const c of CONSTITUTIONS) {
    if (typeof (effects as any)[c] === 'number') return c;
  }
  return null;
}

/**
 * 메인 채점 함수
 */
export function calcScores(
  questions: QuestionData[],
  answers: AnswersMap,
  stage: 1 | 2 | 3 = 3,
): StageResult {
  const isStage1 = stage === 1;
  const isStage2 = stage === 2;
  const isFinal = stage >= 3;

  const sc: Record<Constitution, number> = { ty: 0, te: 0, sy: 0, se: 0 };
  const hanyul = { cold: 0, hot: 0 };
  const hanyulSy = { cold: 0, hot: 0 };
  let answered = 0;
  let total = 0;

  for (const q of questions) {
    const isBody = q.section === 'body';
    const isPhysio = q.section === 'physio';
    const isOx = q.section === 'ox';
    const isChar = q.section === 'char';
    const isEmo = q.section === 'emo';
    const isFood = q.section === 'food';
    const isKiller = q.section === 'killer';

    // Stage별 활성화 조건
    if (isFood && !isFinal) continue;
    if (isKiller && !isFinal) continue;
    if ((isChar || isEmo) && isStage1) continue;

    total++;
    const ans = answers[String(q.id)];

    if (q.type === 'dual-mark') {
      // PART 1 체형, PART 6 음식: 각 보기마다 yes/no/null
      if (!ans?.marks) continue;
      const marks = ans.marks;
      let hasAnyMark = false;
      for (const c of q.choices) {
        const m = marks[c.id];
        if (m === null || m === undefined) continue;
        hasAnyMark = true;
        const cKey = extractConstitutionFromEffects(c.effects);
        if (!cKey) continue;
        if (m === 'yes') sc[cKey] += 3;
        else if (m === 'no') sc[cKey] -= 1; // v24: -3 → -1
      }
      if (hasAnyMark) answered++;
    } else if (q.type === 'ox' || q.type === 'killer-ox') {
      if (ans?.choiceId === undefined) continue;
      const choice = q.choices.find((c) => c.id === ans.choiceId);
      if (!choice) continue;
      const isUnknown = choice.label === '모름';
      answered++;
      if (isUnknown) continue;

      const eff = choice.effects as any;
      for (const [key, val] of Object.entries(eff)) {
        if (key === 'hanyul') {
          (hanyul as any)[val as string] += 1;
        } else if (key === 'hanyul_sy') {
          (hanyulSy as any)[val as string] += 1;
        } else if (key === 'confirm' && typeof eff.weight === 'number') {
          const conf = val as Constitution;
          if (CONSTITUTIONS.includes(conf)) sc[conf] += eff.weight;
        } else if (CONSTITUTIONS.includes(key as Constitution) && typeof val === 'number') {
          sc[key as Constitution] += val;
        }
      }
    } else if (q.type === 'single-unknown' || q.type === 'single') {
      if (ans?.choiceId === undefined) continue;
      const choice = q.choices.find((c) => c.id === ans.choiceId);
      if (!choice) continue;
      answered++;
      // "잘 모르겠음" 선지는 effects가 비어 있음 → 점수 0
      const cKey = extractConstitutionFromEffects(choice.effects);
      if (cKey) sc[cKey] += 2; // 생리·성격·심리 = +2 가중치
    }
  }

  // v24: 음수 클리핑 + 라플라스 스무딩
  const scSmoothed: Record<Constitution, number> = { ty: 0, te: 0, sy: 0, se: 0 };
  for (const c of CONSTITUTIONS) {
    scSmoothed[c] = Math.max(0, sc[c]) + SMOOTHING_BASE;
  }

  // Prior 보정 후 % 분포
  const pcts = applyPrior(scSmoothed);
  const pctsRounded: Record<Constitution, number> = { ty: 0, te: 0, sy: 0, se: 0 };
  for (const c of CONSTITUTIONS) pctsRounded[c] = Math.round(pcts[c]);
  // 반올림 오차 보정
  const diff = 100 - CONSTITUTIONS.reduce((s, c) => s + pctsRounded[c], 0);
  if (diff !== 0) {
    const big = CONSTITUTIONS.reduce((a, b) => (pctsRounded[a] >= pctsRounded[b] ? a : b));
    pctsRounded[big] += diff;
  }

  // 1위·2위
  const sorted = [...CONSTITUTIONS].sort((a, b) => pcts[b] - pcts[a]);
  const top = sorted[0];
  const second = sorted[1];

  // 한열 판정
  let hanyulResult: Hanyul = 'mixed';
  if (top === 'sy') {
    if (hanyulSy.cold > hanyulSy.hot) hanyulResult = 'cold';
    else if (hanyulSy.hot > hanyulSy.cold) hanyulResult = 'hot';
    else hanyulResult = 'mixed';
  } else {
    if (hanyul.cold > hanyul.hot) hanyulResult = 'cold';
    else if (hanyul.hot > hanyul.cold) hanyulResult = 'hot';
    else hanyulResult = 'mixed';
  }
  if (hanyul.cold === 0 && hanyul.hot === 0 && hanyulSy.cold === 0 && hanyulSy.hot === 0) {
    hanyulResult = 'neutral';
  }

  // 신뢰도
  const coverage = total > 0 ? answered / total : 0;
  const margin = pctsRounded[top] - pctsRounded[second];
  const covPct = Math.round(coverage * 100);

  let confidence: StageResult['confidence'];
  if (covPct < 50) {
    confidence = {
      level: '낮음',
      detail: `응답 ${covPct}%만 표시됨 — 면담 필수`,
      margin,
    };
  } else if (covPct >= 70 && margin >= 20) {
    confidence = {
      level: '높음',
      detail: `${TYPE_INFO[top].name} 우세 (응답 ${covPct}%, 격차 ${margin}%p)`,
      margin,
    };
  } else if (margin >= 10) {
    confidence = {
      level: '보통',
      detail: `${TYPE_INFO[top].name} vs ${TYPE_INFO[second].name} 추가 면담 권장 (응답 ${covPct}%)`,
      margin,
    };
  } else {
    confidence = {
      level: '낮음',
      detail: `${TYPE_INFO[top].name} vs ${TYPE_INFO[second].name} 정밀 감별 필요 (응답 ${covPct}%)`,
      margin,
    };
  }

  return {
    scores: scSmoothed,
    scoresRaw: sc,
    pcts: pctsRounded,
    top,
    second,
    hanyul: hanyulResult,
    hanyulCounts: hanyul,
    hanyulSyCounts: hanyulSy,
    coverage,
    answered,
    total,
    confidence,
  };
}

/** Prior 보정 — raw 점수에 인구비 곱한 뒤 정규화 */
function applyPrior(raw: Record<Constitution, number>): Record<Constitution, number> {
  const total = CONSTITUTIONS.reduce((s, c) => s + raw[c], 0) || 1;
  const adj: Record<Constitution, number> = { ty: 0, te: 0, sy: 0, se: 0 };
  for (const c of CONSTITUTIONS) {
    adj[c] = (raw[c] / total) * PRIOR[c];
  }
  const sum = CONSTITUTIONS.reduce((s, c) => s + adj[c], 0) || 1;
  for (const c of CONSTITUTIONS) {
    adj[c] = (adj[c] / sum) * 100;
  }
  return adj;
}

/** PART별 응답 분포 카운트 — 결과지 표시용 */
export type PartTally = {
  ty: number;
  te: number;
  sy: number;
  se: number;
  _yes?: Record<Constitution, number>;
  _no?: Record<Constitution, number>;
  _net?: Record<Constitution, number>;
};

export function calcPartTallies(
  questions: QuestionData[],
  answers: AnswersMap,
): Record<string, PartTally> {
  const result: Record<string, PartTally> = {};

  const sections = ['body', 'physio', 'ox', 'char', 'emo', 'food'] as const;
  for (const sec of sections) {
    const isBip = sec === 'body' || sec === 'food';
    const tally: PartTally = isBip
      ? {
          ty: 0, te: 0, sy: 0, se: 0,
          _yes: { ty: 0, te: 0, sy: 0, se: 0 },
          _no: { ty: 0, te: 0, sy: 0, se: 0 },
          _net: { ty: 0, te: 0, sy: 0, se: 0 },
        }
      : { ty: 0, te: 0, sy: 0, se: 0 };

    for (const q of questions) {
      if (q.section !== sec) continue;
      const ans = answers[String(q.id)];
      if (!ans) continue;

      if (q.type === 'dual-mark' && ans.marks && isBip) {
        for (const c of q.choices) {
          const m = ans.marks[c.id];
          if (m === null || m === undefined) continue;
          const cKey = extractConstitutionFromEffects(c.effects);
          if (!cKey) continue;
          if (m === 'yes') {
            tally._yes![cKey]++;
            tally[cKey]++;
            tally._net![cKey]++;
          } else if (m === 'no') {
            tally._no![cKey]++;
            tally._net![cKey]--;
          }
        }
      } else if (ans.choiceId !== undefined) {
        const choice = q.choices.find((c) => c.id === ans.choiceId);
        if (!choice) continue;
        if (choice.label === '모름' || choice.label.includes('잘 모르겠음')) continue;
        // OX는 effects 구조가 다양함
        const eff = choice.effects as any;
        for (const c of CONSTITUTIONS) {
          if (typeof eff[c] === 'number' && eff[c] > 0) tally[c]++;
        }
      }
    }

    result[sec] = tally;
  }

  return result;
}
