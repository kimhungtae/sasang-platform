'use server';

/**
 * 원장실 2차 소견·처방 저장 서버 액션 (Phase 3)
 *
 * survey_records의 clinicMemo(JSON 문자열)와 stage를 갱신한다.
 * clinicMemo에는 2차 추가 소견(정밀시진·기능검사), 한열 재확인, 선택 처방, 자유 메모를
 * 하나의 JSON으로 담는다. 원장실 인증(isClinicAuthed)을 통과해야만 동작.
 */

import { db, schema } from '@/db';
import { eq, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { isClinicAuthed } from '@/lib/clinic-auth';

/** clinicMemo 필드에 JSON으로 저장되는 2차 소견 데이터 */
export type ClinicMemoData = {
  visual?: string; // 정밀시진 소견
  functional?: string; // 기능검사 소견
  hanyulConfirm?: 'cold' | 'hot' | 'neutral' | ''; // 원장 한열 재확인 (1차 자동판정 보정)
  selectedRx?: string; // 선택/확정 처방명
  memo?: string; // 자유 메모
  updatedAt?: number; // epoch ms
};

export type SaveRecordInput = {
  recordId: number;
  memo: ClinicMemoData;
  stage: 'reviewed' | 'prescribed';
};

export type SaveRecordResult = { ok: true } | { ok: false; error: string };

export async function saveClinicRecord(
  input: SaveRecordInput,
): Promise<SaveRecordResult> {
  if (!isClinicAuthed()) {
    return { ok: false, error: '원장실 인증이 필요합니다. 다시 로그인해 주세요.' };
  }

  const id = Number(input.recordId);
  if (!Number.isInteger(id) || id < 1) {
    return { ok: false, error: '잘못된 기록 번호입니다.' };
  }
  if (input.stage !== 'reviewed' && input.stage !== 'prescribed') {
    return { ok: false, error: '잘못된 단계 값입니다.' };
  }

  const memo: ClinicMemoData = {
    visual: (input.memo.visual ?? '').trim() || undefined,
    functional: (input.memo.functional ?? '').trim() || undefined,
    hanyulConfirm: input.memo.hanyulConfirm || undefined,
    selectedRx: (input.memo.selectedRx ?? '').trim() || undefined,
    memo: (input.memo.memo ?? '').trim() || undefined,
    updatedAt: Date.now(),
  };

  try {
    const res = await db
      .update(schema.surveyRecords)
      .set({
        clinicMemo: JSON.stringify(memo),
        stage: input.stage,
        updatedAt: sql`(unixepoch())`,
      })
      .where(eq(schema.surveyRecords.id, id))
      .returning({ id: schema.surveyRecords.id });

    if (res.length === 0) {
      return { ok: false, error: '해당 기록을 찾을 수 없습니다.' };
    }

    revalidatePath(`/clinic/${id}`);
    revalidatePath('/clinic');
    return { ok: true };
  } catch (err) {
    console.error('saveClinicRecord failed:', err);
    return { ok: false, error: '저장 중 오류가 발생했습니다.' };
  }
}
