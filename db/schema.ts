/**
 * 사상의학 플랫폼 — Drizzle ORM 스키마 (SQLite)
 *
 * PLATFORM_DESIGN.md §5 기준
 * Phase 1: 11개 핵심 테이블 (Phase 2~3 테이블은 주석으로 표시)
 *
 * 체질 약어 (DEVELOPMENT_GUIDE §15.1):
 *  ty = 태양인, te = 태음인, sy = 소양인, se = 소음인
 *
 * 처방 ID prefix:
 *  L = 태양인(류씨), H = 태음인, P = 소양인, R = 소음인
 */

import {
  sqliteTable,
  integer,
  text,
  real,
  primaryKey,
  index,
} from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// ─────────────────────────────────────────────────────────
// 공통 타입
// ─────────────────────────────────────────────────────────

export const CONSTITUTIONS = ['ty', 'te', 'sy', 'se'] as const;
export type Constitution = (typeof CONSTITUTIONS)[number];

export const USER_ROLES = ['guest', 'public', 'student', 'clinician', 'admin'] as const;
export type UserRole = (typeof USER_ROLES)[number];

// ─────────────────────────────────────────────────────────
// 1. users — 사용자
// ─────────────────────────────────────────────────────────
export const users = sqliteTable(
  'users',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    email: text('email').notNull().unique(),
    name: text('name'),
    role: text('role', { enum: USER_ROLES }).notNull().default('public'),
    licenseNo: text('license_no'), // 한의사 면허 (clinician 승인 시)
    approvedAt: integer('approved_at', { mode: 'timestamp' }),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => ({
    emailIdx: index('users_email_idx').on(t.email),
  }),
);

// ─────────────────────────────────────────────────────────
// 2. questionnaires — 설문지 메타
// ─────────────────────────────────────────────────────────
export const questionnaires = sqliteTable('questionnaires', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  type: text('type', { enum: ['adult28', 'pediatric', 'visual'] }).notNull(),
  version: text('version').notNull(), // 예: 'v23', 'v1.0'
  title: text('title').notNull(),
  description: text('description'),
  weightsJson: text('weights_json'), // JSON: { "questionId": weight }
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

// ─────────────────────────────────────────────────────────
// 3. questions — 설문 문항
// ─────────────────────────────────────────────────────────
export const questions = sqliteTable(
  'questions',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    qnaireId: integer('qnaire_id')
      .notNull()
      .references(() => questionnaires.id, { onDelete: 'cascade' }),
    order: integer('order').notNull(),
    text: text('text').notNull(),
    type: text('type', { enum: ['single', 'multiselect-food'] })
      .notNull()
      .default('single'),
    isCore: integer('is_core', { mode: 'boolean' }).notNull().default(false), // 가중치 2배
  },
  (t) => ({
    qnaireOrderIdx: index('questions_qnaire_order_idx').on(t.qnaireId, t.order),
  }),
);

// ─────────────────────────────────────────────────────────
// 4. choices — 문항 선지
// ─────────────────────────────────────────────────────────
export const choices = sqliteTable(
  'choices',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    questionId: integer('question_id')
      .notNull()
      .references(() => questions.id, { onDelete: 'cascade' }),
    order: integer('order').notNull(),
    label: text('label').notNull(),
    constitutionKey: integer('constitution_key'), // 1=ty, 2=te, 3=se, 4=sy (v23.html 기준)
  },
  (t) => ({
    questionOrderIdx: index('choices_question_order_idx').on(t.questionId, t.order),
  }),
);

// ─────────────────────────────────────────────────────────
// 5. responses — 응답 세션
// ─────────────────────────────────────────────────────────
export const responses = sqliteTable(
  'responses',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }), // null 허용 (게스트)
    qnaireId: integer('qnaire_id')
      .notNull()
      .references(() => questionnaires.id),
    startedAt: integer('started_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
    finishedAt: integer('finished_at', { mode: 'timestamp' }),
  },
  (t) => ({
    userIdx: index('responses_user_idx').on(t.userId),
  }),
);

// ─────────────────────────────────────────────────────────
// 6. answers — 응답 (문항별)
// ─────────────────────────────────────────────────────────
export const answers = sqliteTable(
  'answers',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    responseId: integer('response_id')
      .notNull()
      .references(() => responses.id, { onDelete: 'cascade' }),
    questionId: integer('question_id')
      .notNull()
      .references(() => questions.id),
    choiceId: integer('choice_id').references(() => choices.id), // 단일 선택용
    choiceIdsJson: text('choice_ids_json'), // 다중 선택 (multiselect-food) JSON
  },
  (t) => ({
    responseIdx: index('answers_response_idx').on(t.responseId),
  }),
);

// ─────────────────────────────────────────────────────────
// 7. results — 채점 결과
// ─────────────────────────────────────────────────────────
export const results = sqliteTable('results', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  responseId: integer('response_id')
    .notNull()
    .unique()
    .references(() => responses.id, { onDelete: 'cascade' }),
  top: text('top', { enum: CONSTITUTIONS }).notNull(),
  second: text('second', { enum: CONSTITUTIONS }), // 2차 후보
  scoresJson: text('scores_json').notNull(), // { ty: 0.x, te: 0.x, sy: 0.x, se: 0.x }
  confidence: real('confidence').notNull(), // 0.0 ~ 1.0
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

// ─────────────────────────────────────────────────────────
// 8. prescriptions — 처방 (류주열 352+ 등)
// ─────────────────────────────────────────────────────────
export const prescriptions = sqliteTable(
  'prescriptions',
  {
    id: text('id').primaryKey(), // 'L001', 'H001' 등
    constitution: text('constitution', { enum: CONSTITUTIONS }).notNull(),
    name: text('name').notNull(), // 류씨오가피장척탕
    compositionCurrent: text('composition_current'), // 개정판 원문
    compositionLegacy: text('composition_legacy'), // 옛 원문
    source: text('source'), // '류주열' | '안준철' | '새로사상책'
    indicationsJson: text('indications_json'), // 적응증 태그 JSON 배열
    notes: text('notes'),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => ({
    constitutionIdx: index('prescriptions_constitution_idx').on(t.constitution),
    nameIdx: index('prescriptions_name_idx').on(t.name),
  }),
);

// ─────────────────────────────────────────────────────────
// 9. herbs — 본초
// ─────────────────────────────────────────────────────────
export const herbs = sqliteTable(
  'herbs',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull().unique(),
    aliasesJson: text('aliases_json'), // 이명 JSON 배열
    constitutionsJson: text('constitutions_json'), // 주 사용 체질 JSON
    strengthClass: text('strength_class', { enum: ['강', '중', '약'] }), // 김기현 분류
    meridiansJson: text('meridians_json'), // 귀경 JSON
    qi: text('qi', { enum: ['한', '량', '평', '온', '열'] }),
    flavorJson: text('flavor_json'), // 미 JSON
    effectsJson: text('effects_json'), // 효능 JSON
    commentary: text('commentary'),
  },
  (t) => ({
    nameIdx: index('herbs_name_idx').on(t.name),
  }),
);

// ─────────────────────────────────────────────────────────
// 10. prescription_ingredients — 처방 구성 (M:N)
// ─────────────────────────────────────────────────────────
export const prescriptionIngredients = sqliteTable(
  'prescription_ingredients',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    prescriptionId: text('prescription_id')
      .notNull()
      .references(() => prescriptions.id, { onDelete: 'cascade' }),
    herbId: integer('herb_id')
      .notNull()
      .references(() => herbs.id),
    doseDon: real('dose_don'), // 돈 단위 (1돈 ≈ 3.75g)
    version: text('version', { enum: ['current', 'legacy'] })
      .notNull()
      .default('current'),
    order: integer('order').notNull(),
  },
  (t) => ({
    prescriptionIdx: index('pi_prescription_idx').on(t.prescriptionId),
    herbIdx: index('pi_herb_idx').on(t.herbId),
  }),
);

// ─────────────────────────────────────────────────────────
// 11. lifestyle_guides — 섭생 가이드 (4체질)
// ─────────────────────────────────────────────────────────
export const lifestyleGuides = sqliteTable('lifestyle_guides', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  constitution: text('constitution', { enum: CONSTITUTIONS }).notNull(),
  category: text('category', { enum: ['음식', '운동', '정서', '주의'] }).notNull(),
  recommendedJson: text('recommended_json'), // 권장 항목 JSON 배열
  avoidJson: text('avoid_json'), // 회피 항목 JSON 배열
  description: text('description'),
});

// ═════════════════════════════════════════════════════════
// Phase 2~3 테이블 (주석으로만 표시. 추후 활성화)
// ═════════════════════════════════════════════════════════
//
// organs, syndromes, syndrome_prescriptions  — 장부변증 (Phase 3)
// symptoms, symptom_prescriptions             — 증상-처방 카탈로그 (Phase 3)
// documents, document_chunks                  — 강의록 라이브러리 (Phase 3)
// bookmarks, notes                            — 학습/노트 (Phase 3)
//
// ─────────────────────────────────────────────────────────
