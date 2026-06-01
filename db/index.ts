/**
 * Drizzle DB 클라이언트 (앱 코드에서 import)
 *
 * 로컬 개발: file:./db/sasang.db (SQLite 파일)
 * 프로덕션: libsql://...turso.io (환경변수로 전환)
 *
 * 사용 예:
 *   import { db, schema } from '@/db';
 *   const allUsers = await db.select().from(schema.users);
 */

import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

const url = process.env.DATABASE_URL ?? 'file:./db/sasang.db';
const authToken = process.env.TURSO_AUTH_TOKEN; // 로컬은 undefined OK

const client = createClient({
  url,
  authToken, // undefined일 때 자동 무시됨
});

export const db = drizzle(client, { schema });
export { schema };
