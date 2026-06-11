/**
 * 처방 도출 로직 (Phase 3)
 *
 * type-info.ts에 정리된 체질별 rx(기본)·rxCold(한자)·rxHot(열자) 처방 문자열을
 * 파싱해 진료 화면에서 쓰기 좋은 구조로 변환한다.
 *
 * ⚠️ 순수 함수 — DB·서버 의존성 없음. 서버/클라이언트 양쪽에서 import 가능.
 * ⚠️ 류주열 처방 352개 DB(T8)가 적재되면 derivePrescriptions가 그 데이터와
 *    매칭하도록 확장할 예정. 지금은 type-info.ts 자료만 사용.
 */

import { TYPE_INFO, type Constitution } from '@/data/type-info';

export type HanyulKey = 'cold' | 'hot' | 'neutral';

/** rx 문자열("治法 / 처방A·처방B")을 治法과 처방 목록으로 분리 */
export type RxCandidate = {
  principle: string; // 치법 (예: 淸肺降氣·補肝)
  formulas: string[]; // 처방명 (예: ['오가피장척탕', '미후등식장탕'])
  raw: string;
};

export function parseRx(raw: string): RxCandidate {
  const text = (raw ?? '').trim();
  const slash = text.indexOf('/');
  if (slash === -1) {
    return { principle: text, formulas: [], raw: text };
  }
  const principle = text.slice(0, slash).trim();
  const formulaStr = text.slice(slash + 1).trim();
  const formulas = formulaStr
    .split(/[·,、]/)
    .map((s) => s.trim())
    .filter(Boolean);
  return { principle, formulas, raw: text };
}

export type PrescriptionSet = {
  constitution: Constitution;
  base: RxCandidate; // 기본 처방 (rx)
  hanyul: HanyulKey;
  targeted: RxCandidate | null; // 한열 맞춤 (cold→rxCold, hot→rxHot, neutral→null)
  targetedLabel: string | null; // '한자(寒者) 처방' / '열자(熱者) 처방'
  disease: string; // 대표 병증
  good: string; // 좋은 음식
  bad: string; // 나쁜 음식
};

/**
 * 체질 + 한열 판정으로 처방 후보 도출.
 * hanyul이 cold/hot이면 맞춤 처방을, neutral이면 기본 처방만 강조.
 */
export function derivePrescriptions(
  constitution: Constitution,
  hanyul: HanyulKey,
): PrescriptionSet {
  const info = TYPE_INFO[constitution];
  const base = parseRx(info.rx);

  let targeted: RxCandidate | null = null;
  let targetedLabel: string | null = null;
  if (hanyul === 'cold') {
    targeted = parseRx(info.rxCold);
    targetedLabel = '한자(寒者) 맞춤 처방';
  } else if (hanyul === 'hot') {
    targeted = parseRx(info.rxHot);
    targetedLabel = '열자(熱者) 맞춤 처방';
  }

  return {
    constitution,
    base,
    hanyul,
    targeted,
    targetedLabel,
    disease: info.disease,
    good: info.good,
    bad: info.bad,
  };
}

/** result.hanyul 문자열(cold/hot/neutral/mixed 등)을 HanyulKey로 정규화 */
export function normalizeHanyul(value: unknown): HanyulKey {
  return value === 'cold' || value === 'hot' ? value : 'neutral';
}
