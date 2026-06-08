/**
 * Turso 내용 점검 (진단용)
 * .env.local의 DATABASE_URL 대상 DB의 설문 데이터를 그대로 출력.
 */
import './load-env';

import { db, schema } from '../db';
import { eq, and } from 'drizzle-orm';

async function main() {
  console.log('DB target:', process.env.DATABASE_URL);

  const all = await db.select().from(schema.questionnaires);
  console.log(`\n=== questionnaires rows: ${all.length} ===`);
  for (const q of all) {
    console.log(
      `  id=${q.id} type=${JSON.stringify(q.type)} ver=${JSON.stringify(q.version)} ` +
        `active=${JSON.stringify(q.active)} (typeof=${typeof q.active})`,
    );
  }

  // getActiveQuestionnaire 와 동일한 조건 재현
  const match = await db
    .select()
    .from(schema.questionnaires)
    .where(
      and(
        eq(schema.questionnaires.type, 'adult-v24' as any),
        eq(schema.questionnaires.active, true),
      ),
    );
  console.log(`\n=== match (type=adult-v24 AND active=true): ${match.length} rows ===`);

  const qs = await db.select().from(schema.questions);
  const ch = await db.select().from(schema.choices);
  console.log(`\nquestions total: ${qs.length}`);
  console.log(`choices total: ${ch.length}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('CHECK ERROR:', err);
    process.exit(1);
  });
