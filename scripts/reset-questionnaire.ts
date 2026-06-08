/**
 * 설문지 데이터 리셋 스크립트
 *
 * Turso(또는 .env.local의 DATABASE_URL 대상)에서
 * 설문 정의 데이터(choices → questions → questionnaires)를 모두 삭제.
 * 불완전하게 시드된 설문을 깨끗이 지운 뒤 재시드할 때 사용.
 *
 * 실행: npm run reset:questionnaire
 * 주의: './load-env'를 db보다 먼저 import 해야 올바른 DB(Turso)에 연결됨.
 *       사용자 제출/결과 등 다른 테이블은 건드리지 않음.
 */
import './load-env';

import { db, schema } from '../db';

async function main() {
  const target = process.env.DATABASE_URL ?? 'file:./db/sasang.db (local)';
  console.log('\n=== Reset questionnaire data ===');
  console.log('  DB target: ' + target);

  // FK 순서: choices → questions → questionnaires
  await db.delete(schema.choices);
  console.log('  cleared: choices');
  await db.delete(schema.questions);
  console.log('  cleared: questions');
  await db.delete(schema.questionnaires);
  console.log('  cleared: questionnaires');

  console.log('=== Reset complete. Now seed. ===\n');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('\n✗ Reset failed:', err);
    process.exit(1);
  });
