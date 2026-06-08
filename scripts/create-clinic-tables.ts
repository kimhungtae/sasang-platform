/**
 * 진료(임상) 테이블 생성 스크립트 — patients, survey_records
 *
 * .env.local의 DATABASE_URL(Turso) 대상으로 CREATE TABLE IF NOT EXISTS 실행.
 * drizzle-kit 대신 직접 SQL — 추가 전용이라 안전하고 멱등적.
 *
 * 실행: npm run create:clinic
 * 주의: './load-env'를 db보다 먼저 import.
 */
import './load-env';

import { db } from '../db';
import { sql } from 'drizzle-orm';

async function main() {
  const target = process.env.DATABASE_URL ?? 'file:./db/sasang.db (local)';
  console.log('\n=== Create clinic tables ===');
  console.log('  DB target: ' + target);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chart_no TEXT NOT NULL,
      name TEXT NOT NULL,
      gender TEXT,
      age INTEGER,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );
  `);
  console.log('  ✓ patients');
  await db.run(sql`CREATE INDEX IF NOT EXISTS patients_chart_idx ON patients (chart_no);`);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS survey_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
      qnaire_id INTEGER NOT NULL REFERENCES questionnaires(id),
      answers_json TEXT NOT NULL,
      result_json TEXT NOT NULL,
      stage TEXT NOT NULL DEFAULT 'intake',
      clinic_memo TEXT,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    );
  `);
  console.log('  ✓ survey_records');
  await db.run(sql`CREATE INDEX IF NOT EXISTS survey_records_patient_idx ON survey_records (patient_id);`);
  await db.run(sql`CREATE INDEX IF NOT EXISTS survey_records_created_idx ON survey_records (created_at);`);

  console.log('=== Done. Clinic tables ready. ===\n');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('CREATE FAILED:', err);
    process.exit(1);
  });
