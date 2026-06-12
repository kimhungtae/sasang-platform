/**
 * 류주열 사상처방 시드 스크립트 (T8 2단계)
 *
 * data/prescriptions-raw.json (DUMP-PRESCRIPTIONS.bat 산출물) 을 읽어
 * prescriptions 테이블에 적재한다.
 *
 *  - prescriptions 테이블 CREATE TABLE IF NOT EXISTS (schema.ts와 동일 컬럼)
 *  - 행마다 INSERT ... ON CONFLICT(id) DO UPDATE (멱등 — 재실행해도 안전)
 *  - 시트 이름(태양인/태음인/소양인/소음인) → 체질코드(ty/te/sy/se)
 *  - id = 엑셀 "No." (L001, H001, P001, R001 …). 비면 자동 생성.
 *
 * 실행(배치): SEED-PRESCRIPTIONS.bat  (npm run seed:prescriptions)
 * 주의: './load-env'를 db보다 먼저 import (Turso 주소 반영).
 */
import './load-env';

import { db } from '../db';
import { sql } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';

const SHEET_TO_CONSTITUTION: Record<string, 'ty' | 'te' | 'sy' | 'se'> = {
  태양인: 'ty',
  태음인: 'te',
  소양인: 'sy',
  소음인: 'se',
};

type RawRow = {
  'No.'?: string;
  처방명?: string;
  '구성(개정)'?: string;
  '구성(예전)'?: string;
};

function clean(v: unknown): string {
  return String(v ?? '').trim();
}

async function main() {
  const target = process.env.DATABASE_URL ?? 'file:./db/sasang.db (local)';
  console.log('\n=== Seed prescriptions ===');
  console.log('  DB target: ' + target);

  // 1) 테이블 보장 (schema.ts의 prescriptions와 동일)
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS prescriptions (
      id TEXT PRIMARY KEY,
      constitution TEXT NOT NULL,
      name TEXT NOT NULL,
      composition_current TEXT,
      composition_legacy TEXT,
      source TEXT,
      indications_json TEXT,
      notes TEXT,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );
  `);
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS prescriptions_constitution_idx ON prescriptions (constitution);`,
  );
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS prescriptions_name_idx ON prescriptions (name);`,
  );
  console.log('  ✓ table ready');

  // 2) raw.json 읽기
  const rawPath = path.join(process.cwd(), 'data', 'prescriptions-raw.json');
  if (!fs.existsSync(rawPath)) {
    console.error('  ✗ data/prescriptions-raw.json 이 없습니다. 먼저 DUMP-PRESCRIPTIONS.bat 실행.');
    process.exit(1);
  }
  const raw: Record<string, RawRow[]> = JSON.parse(fs.readFileSync(rawPath, 'utf8'));

  // 3) 적재 (멱등 upsert)
  let inserted = 0;
  let skipped = 0;
  const seenIds = new Set<string>();
  const perConstitution: Record<string, number> = {};

  for (const [sheet, rows] of Object.entries(raw)) {
    const constitution = SHEET_TO_CONSTITUTION[sheet];
    if (!constitution) {
      console.warn('  ! 알 수 없는 시트 건너뜀: ' + sheet);
      continue;
    }
    let autoIdx = 0;
    for (const row of rows) {
      const name = clean(row['처방명']);
      if (!name) {
        skipped++;
        continue; // 처방명 없는 행(구분선 등) 제외
      }
      let id = clean(row['No.']);
      if (!id || seenIds.has(id)) {
        id = `${constitution}-${String(++autoIdx).padStart(3, '0')}`;
        while (seenIds.has(id)) id = `${constitution}-${String(++autoIdx).padStart(3, '0')}`;
      }
      seenIds.add(id);

      const current = clean(row['구성(개정)']) || null;
      const legacy = clean(row['구성(예전)']) || null;

      await db.run(sql`
        INSERT INTO prescriptions (id, constitution, name, composition_current, composition_legacy, source)
        VALUES (${id}, ${constitution}, ${name}, ${current}, ${legacy}, ${'류주열사상처방개정판'})
        ON CONFLICT(id) DO UPDATE SET
          constitution = excluded.constitution,
          name = excluded.name,
          composition_current = excluded.composition_current,
          composition_legacy = excluded.composition_legacy,
          source = excluded.source
      `);
      inserted++;
      perConstitution[constitution] = (perConstitution[constitution] ?? 0) + 1;
    }
  }

  console.log('  ✓ upserted: ' + inserted + ' (skipped ' + skipped + ')');
  console.log('  by constitution: ' + JSON.stringify(perConstitution));

  const [{ cnt }] = (await db.all(
    sql`SELECT COUNT(*) as cnt FROM prescriptions`,
  )) as unknown as { cnt: number }[];
  console.log('  total rows in table: ' + cnt);
  console.log('=== Done. ===\n');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('SEED FAILED:', err);
    process.exit(1);
  });
