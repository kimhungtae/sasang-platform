/**
 * 사상체질 설문 데이터 액세스 (v24)
 * 서버 컴포넌트에서 사용
 */

import { db, schema } from '@/db';
import { eq, asc, and } from 'drizzle-orm';

export type ChoiceEffects = Record<string, unknown>;

export type ChoiceData = {
  id: number;
  order: number;
  label: string;
  effects: ChoiceEffects;
};

export type QuestionData = {
  id: number;
  order: number;
  code: string | null;
  section: string | null;
  text: string;
  tag: string | null;
  type: 'single' | 'single-unknown' | 'multiselect-food' | 'ox' | 'killer-ox' | 'dual-mark';
  isCore: boolean;
  confirmConstitution: string | null;
  choices: ChoiceData[];
};

export type QuestionnaireData = {
  id: number;
  type: string;
  version: string;
  title: string;
  description: string | null;
  totalQuestions: number;
  sections?: Array<{ key: string; label: string; order: number }>;
};

function safeParseEffects(json: string | null): ChoiceEffects {
  if (!json) return {};
  try {
    return JSON.parse(json);
  } catch {
    return {};
  }
}

/**
 * 활성화된 adult-v24 설문지 가져오기
 */
export async function getActiveQuestionnaire(): Promise<QuestionnaireData | null> {
  // v24 우선 (Killer 포함 30문항), fallback: v21 → v23
  const tryTypes = ['adult-v24', 'adult-v21', 'adult28'] as const;
  let q: any;
  for (const t of tryTypes) {
    q = (
      await db
        .select()
        .from(schema.questionnaires)
        .where(
          and(
            eq(schema.questionnaires.type, t as any),
            eq(schema.questionnaires.active, true),
          ),
        )
        .limit(1)
    )[0];
    if (q) break;
  }

  if (!q) return null;

  const allQuestions = await db
    .select()
    .from(schema.questions)
    .where(eq(schema.questions.qnaireId, q.id));

  // weightsJson에서 sections 파싱
  let sections: QuestionnaireData['sections'];
  if (q.weightsJson) {
    try {
      const parsed = JSON.parse(q.weightsJson);
      sections = parsed.sections;
    } catch {
      // ignore
    }
  }

  return {
    id: q.id,
    type: q.type,
    version: q.version,
    title: q.title,
    description: q.description,
    totalQuestions: allQuestions.length,
    sections,
  };
}

/** v23 호환 alias */
export const getActiveAdult28 = getActiveQuestionnaire;

/**
 * 특정 순서의 문항 가져오기
 */
export async function getQuestionByOrder(
  qnaireId: number,
  order: number,
): Promise<QuestionData | null> {
  const [q] = await db
    .select()
    .from(schema.questions)
    .where(
      and(eq(schema.questions.qnaireId, qnaireId), eq(schema.questions.order, order)),
    )
    .limit(1);

  if (!q) return null;

  const choicesData = await db
    .select()
    .from(schema.choices)
    .where(eq(schema.choices.questionId, q.id))
    .orderBy(asc(schema.choices.order));

  return {
    id: q.id,
    order: q.order,
    code: q.code,
    section: q.section,
    text: q.text,
    tag: q.tag,
    type: q.type as any,
    isCore: q.isCore,
    confirmConstitution: q.confirmConstitution,
    choices: choicesData.map((c) => ({
      id: c.id,
      order: c.order,
      label: c.label,
      effects: safeParseEffects(c.effectsJson),
    })),
  };
}

/**
 * 모든 문항 한 번에 가져오기
 */
export async function getAllQuestions(qnaireId: number): Promise<QuestionData[]> {
  const allQ = await db
    .select()
    .from(schema.questions)
    .where(eq(schema.questions.qnaireId, qnaireId))
    .orderBy(asc(schema.questions.order));

  const result: QuestionData[] = [];
  for (const q of allQ) {
    const choicesData = await db
      .select()
      .from(schema.choices)
      .where(eq(schema.choices.questionId, q.id))
      .orderBy(asc(schema.choices.order));

    result.push({
      id: q.id,
      order: q.order,
      code: q.code,
      section: q.section,
      text: q.text,
      tag: q.tag,
      type: q.type as any,
      isCore: q.isCore,
      confirmConstitution: q.confirmConstitution,
      choices: choicesData.map((c) => ({
        id: c.id,
        order: c.order,
        label: c.label,
        effects: safeParseEffects(c.effectsJson),
      })),
    });
  }

  return result;
}
