/**
 * 사상의학 플랫폼 — Drizzle ORM 스키마 (SQLite) — v24
 *
 * v24 변경사항:
 *  - questions: section, effectsJson 추가, type 확장
 *  - choices: effectsJson 추가 (선지별 점수 설계)
 *  - 30문항 6 PART 구조 지원 (체형·생리·OX·성격·심리·음식·확정)
 *
 * 체질 약어:
 *  ty = 태양인, te = 태음인, sy = 소양인, se = 소음인
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

export const QUESTION_TYPES = [
  'single',           // 4지선다 1개 선택
  'single-unknown',   // 4지선다 + "잘 모르겠음" 1개 선택
  'multiselect-food', // (레거시 v23)
  'ox',               // 예/아니오/모름
  'killer-ox',        // 확정 OX (v24만, v21은 미사용)
  'dual-mark',        // v21 PART 1·6: 각 보기마다 확실그렇다/확실아니다 이중체크
] as const;
export type QuestionType = (typeof QUESTION_TYPES)[number];

export const QUESTION_SECTIONS = ['body', 'physio', 'ox', 'char', 'emo', 'food', 'killer'] as const;
export type QuestionSection = (typeof QUESTION_SECTIONS)[number];

// 선지의 효과 (JSON으로 저장)
// 예시:
//   single: { ty: 1 } - 태양인 +1
//   ox yes: { hanyul: 'cold' } 또는 { ty: 2 }
//   killer yes: { confirm: 'ty', weight: 5 }
export type ChoiceEffects =
  | { ty?: number; te?: number; sy?: number; se?: number }
  | { hanyul: 'cold' | 'hot' }
  | { hanyul_sy: 'cold' | 'hot' }
  | { confirm: Constitution; weight: number }
  | Record<string, unknown>;

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
    licenseNo: text('license_no'),
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
  type: text('type', { enum: ['adult28', 'adult-v21', 'adult-v24', 'pediatric', 'visual'] }).notNull(),
  version: text('version').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  weightsJson: text('weights_json'),
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
    section: text('section', { enum: QUESTION_SECTIONS }), // v24: PART 구분
    code: text('code'), // v24: 'b1', 'p1', 'ox1', 'k1' 등 원본 ID
    text: text('text').notNull(),
    tag: text('tag'), // v24: 'OX 한열', '소양시그널' 등 부가 태그
    type: text('type', { enum: QUESTION_TYPES }).notNull().default('single'),
    isCore: integer('is_core', { mode: 'boolean' }).notNull().default(false),
    confirmConstitution: text('confirm_constitution', { enum: CONSTITUTIONS }), // killer-ox용
    effectsJson: text('effects_json'), // OX/killer 응답별 효과 JSON
  },
  (t) => ({
    qnaireOrderIdx: index('questions_qnaire_order_idx').on(t.qnaireId, t.order),
    sectionIdx: index('questions_section_idx').on(t.section),
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
    constitutionKey: integer('constitution_key'), // 레거시 호환 (v23)
    effectsJson: text('effects_json'), // v24: 선지별 효과 JSON
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
    userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
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
    choiceId: integer('choice_id').references(() => choices.id),
    choiceIdsJson: text('choice_ids_json'),
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
  second: text('second', { enum: CONSTITUTIONS }),
  scoresJson: text('scores_json').notNull(),
  hanyul: text('hanyul', { enum: ['cold', 'hot', 'neutral'] }), // v24: 한열 판정
  confidence: real('confidence').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

// ─────────────────────────────────────────────────────────
// 8. prescriptions — 처방
// ─────────────────────────────────────────────────────────
export const prescriptions = sqliteTable(
  'prescriptions',
  {
    id: text('id').primaryKey(),
    constitution: text('constitution', { enum: CONSTITUTIONS }).notNull(),
    name: text('name').notNull(),
    compositionCurrent: text('composition_current'),
    compositionLegacy: text('composition_legacy'),
    source: text('source'),
    indicationsJson: text('indications_json'),
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
    aliasesJson: text('aliases_json'),
    constitutionsJson: text('constitutions_json'),
    strengthClass: text('strength_class', { enum: ['강', '중', '약'] }),
    meridiansJson: text('meridians_json'),
    qi: text('qi', { enum: ['한', '량', '평', '온', '열'] }),
    flavorJson: text('flavor_json'),
    effectsJson: text('effects_json'),
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
    doseDon: real('dose_don'),
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
  recommendedJson: text('recommended_json'),
  avoidJson: text('avoid_json'),
  description: text('description'),
});

// ─────────────────────────────────────────────────────────
// 12. patients — 환자 (진료 기록용, 차트번호로 식별)
//     ⚠️ 임상가 전용. 익명 자가진단과 별개. 차트번호로 환자 매칭.
// ─────────────────────────────────────────────────────────
export const patients = sqliteTable(
  'patients',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    chartNo: text('chart_no').notNull(), // 차트번호 (검색·매칭 키)
    name: text('name').notNull(), // 이름
    gender: text('gender', { enum: ['M', 'F'] }), // 선택
    age: integer('age'), // 선택
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => ({
    chartIdx: index('patients_chart_idx').on(t.chartNo),
  }),
);

// ─────────────────────────────────────────────────────────
// 13. survey_records — 환자 설문 기록 (1차 검사실 → 원장실 이어보기)
//     answersJson: 응답 맵, resultJson: 계산된 결과(체질/한열/신뢰도/분포)
//     stage: intake(1차 완료) → reviewed(원장 확인) → prescribed(처방)
// ─────────────────────────────────────────────────────────
export const surveyRecords = sqliteTable(
  'survey_records',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    patientId: integer('patient_id')
      .notNull()
      .references(() => patients.id, { onDelete: 'cascade' }),
    qnaireId: integer('qnaire_id')
      .notNull()
      .references(() => questionnaires.id),
    answersJson: text('answers_json').notNull(),
    resultJson: text('result_json').notNull(),
    stage: text('stage', { enum: ['intake', 'reviewed', 'prescribed'] })
      .notNull()
      .default('intake'),
    clinicMemo: text('clinic_memo'),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => ({
    patientIdx: index('survey_records_patient_idx').on(t.patientId),
    createdIdx: index('survey_records_created_idx').on(t.createdAt),
  }),
);
