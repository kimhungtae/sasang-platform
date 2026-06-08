'use server';

/**
 * 검사실 1차 설문 저장 서버 액션
 * 차트번호로 환자 find-or-create → survey_records에 응답·결과 저장.
 * 임상가 워크플로우 전용 (익명 자가진단은 저장하지 않음).
 */

import { db, schema } from '@/db';
import { eq } from 'drizzle-orm';

export type IntakeInput = {
  name: string;
  chartNo: string;
  gender?: 'M' | 'F' | '';
  age?: number | null;
  qnaireId: number;
  answers: unknown;
  result: unknown;
};

export type IntakeResult =
  | { ok: true; recordId: number; patientId: number }
  | { ok: false; error: string };

export async function saveIntakeRecord(input: IntakeInput): Promise<IntakeResult> {
  try {
    const name = (input.name ?? '').trim();
    const chartNo = (input.chartNo ?? '').trim();
    if (!name || !chartNo) {
      return { ok: false, error: '이름과 차트번호는 필수입니다.' };
    }

    const gender = input.gender === 'M' || input.gender === 'F' ? input.gender : undefined;
    const age =
      typeof input.age === 'number' && Number.isFinite(input.age) ? input.age : undefined;

    // 차트번호로 환자 매칭 (없으면 생성)
    const existing = await db
      .select()
      .from(schema.patients)
      .where(eq(schema.patients.chartNo, chartNo))
      .limit(1);

    let patientId: number;
    if (existing.length > 0) {
      patientId = existing[0].id;
    } else {
      const [created] = await db
        .insert(schema.patients)
        .values({ chartNo, name, gender, age })
        .returning();
      patientId = created.id;
    }

    const [rec] = await db
      .insert(schema.surveyRecords)
      .values({
        patientId,
        qnaireId: input.qnaireId,
        answersJson: JSON.stringify(input.answers ?? {}),
        resultJson: JSON.stringify(input.result ?? {}),
        stage: 'intake',
      })
      .returning();

    return { ok: true, recordId: rec.id, patientId };
  } catch (err) {
    console.error('saveIntakeRecord failed:', err);
    return { ok: false, error: '저장 중 오류가 발생했습니다.' };
  }
}
