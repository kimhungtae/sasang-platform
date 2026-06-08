/**
 * 환경변수 로더 (.env.local)
 *
 * 반드시 db 모듈보다 "먼저" import 되어야 함.
 * ESM은 import 된 모듈을 소스 순서대로 평가하므로,
 * 이 파일을 db import 위에 두면 dotenv.config()가 먼저 실행되어
 * db/index.ts가 올바른 DATABASE_URL(Turso)을 읽게 됨.
 */
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
