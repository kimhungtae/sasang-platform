# sasang-platform — Claude 작업 가이드

> 새 Cowork 세션이 이 폴더를 열면 자동으로 읽는 컨텍스트 문서입니다.
> 사용자가 "T6 하자" 같은 짧은 멘트로 시작하더라도 이 파일을 읽고 즉시 작업 가능해야 합니다.

---

## 1. 프로젝트 개요

| 항목 | 값 |
|---|---|
| 이름 | **sasang-platform** (사상의학 디지털 플랫폼) |
| 운영자 | kim — epaphrokim@gmail.com — 온누리한의원 원장 |
| GitHub | https://github.com/kimhungtae/sasang-platform |
| 로컬 경로 | `C:\Users\rla1w\Downloads\sasang-platform` |
| 한의원 위치 | 경기 수원시 권선구 덕영대로1201번길 8, 남수원메드빌 3층 |
| 목적 | 진료실에서 사용할 사상체질 감별·진료 디지털 도구 |
| 모태 자료 | `C:\Users\rla1w\OneDrive\Desktop\onnuriclinic\사상의학\` 폴더 (DEVELOPMENT_GUIDE.md, PLATFORM_DESIGN.md, v24.html 등) |

---

## 2. 진행 상황 (2026-06-08 기준)

### ✅ 완료된 작업

| Task | 결과물 |
|---|---|
| T1 | Next.js 14 + TypeScript + Tailwind 부트스트랩, GitHub push |
| T2 | DB 스키마 (Drizzle + @libsql/client, 12 테이블) |
| T3 | 설문지 ETL (v23 28문항 → v21 26문항 → v24-platform 30문항으로 진화) |
| T4 | 자가진단 UI (`/quiz`, `/quiz/[step]`) |
| T5 | v24 채점 알고리즘 + 결과지 (Stage 1/2/3, 한열 분기, Bayesian Prior) |
| T6 | 섭생 가이드 페이지 (`/guide/[constitution]`, 음식·운동·정서·주의 4섹션, 결과지 연결) |
| T-deploy | **인터넷 배포 완료** — Vercel + Turso, https://sasang-platform.vercel.app (§10) |
| 진료 Phase 1 | **검사실 환자 접수 + 온라인 저장** (`/intake` 이름·차트번호 입력 → 설문 → Turso 저장) |
| 진료 Phase 2 | **원장실 조회/이어보기** (`/clinic` 간단 비번 `CLINIC_PIN`, 환자 목록·검색, 1차 결과 재표시) |
| 진료 Phase 3 (UI) | **2차 정밀 진찰 + 처방 도출 UI** (`/clinic/[recordId]`에 정밀시진·기능검사 입력 + 한열 재확인 + type-info 기반 처방 후보 + stage reviewed/prescribed 저장) — *tsc 검증·커밋 대기, T8 DB 연동은 추후* |

### ⏳ 남은 작업

| Task | 내용 | 예상 |
|---|---|---|
| T8후속 | 처방별 적응증·주치 데이터 조사 → `indicationsJson` 적재 → 한열·증상 자동추천 | 2~3시간 |
| T10 | 면책·법적 페이지 (PIPA 처리방침 포함) | 1시간 |
| T11 | README + 운영 문서 | 1시간 |

**진행률**: 핵심 진료 흐름 1단계까지 완료 · 진료실 적용 임박

---

## 3. 기술 스택

```json
{
  "next": "14.2.35",
  "react": "^18",
  "typescript": "^5",
  "tailwindcss": "^3.4.1",
  "drizzle-orm": "^0.36.0",
  "@libsql/client": "^0.14.0",   // SQLite (로컬) / Turso (운영)
  "zod": "^3.23.8",
  "drizzle-kit": "^0.28.0",
  "tsx": "^4.19.0",
  "dotenv": "^16.4.5"
}
```

**예정**: next-auth (T7), resend (T7), recharts (T9)

---

## 4. 폴더 구조

```
sasang-platform/
├── app/                      # Next.js App Router
│   ├── page.tsx              # 홈
│   ├── quiz/
│   │   ├── page.tsx          # 자가진단 진입 + 면책
│   │   └── [step]/page.tsx   # 문항 동적 라우트 (1~30)
│   ├── result/page.tsx       # 결과 페이지 (v24 양식)
│   └── guide/[constitution]/ # ⏳ T6에서 추가 예정
├── components/
│   ├── Disclaimer.tsx        # 면책 고지 (compact/full)
│   └── quiz/
│       ├── QuizStep.tsx      # 핵심 입력 컴포넌트
│       │                       (single/single-unknown/dual-mark/ox/killer-ox 모두 지원)
│       ├── ProgressBar.tsx
│       └── ResultView.tsx    # 결과 페이지 컴포넌트 (Client)
├── data/
│   ├── type-info.ts          # 🌟 4체질 상세 (T6에 핵심 사용)
│   │                           (trait/physio/good/bad/disease/rx/rxCold/rxHot/saeng 6항목)
│   └── questionnaires/
│       ├── adult-v21.json    # 30문항 v24-platform (현재 시드 데이터)
│       └── adult-v24.json    # v24 분석본 (참고용)
├── db/
│   ├── schema.ts             # Drizzle 스키마
│   ├── index.ts              # DB 클라이언트 (libsql)
│   ├── sasang.db             # SQLite DB (gitignore)
│   └── migrations/           # 자동 생성 SQL
├── lib/
│   ├── quiz.ts               # 서버 데이터 액세스 (getActiveQuestionnaire 등)
│   └── scoring.ts            # 🌟 v24 채점 알고리즘 (calcScores, applyPrior, hanyul)
├── scripts/
│   └── seed-questionnaire.ts # DB 시드 (npm run seed:questionnaire)
├── *.bat                     # 사용자 자동화 (DEV, RESET-DB-FINAL, COMMIT-*)
└── CLAUDE.md                 # 이 파일
```

---

## 5. 핵심 데이터 & 상수

### 체질 코드
- `ty` 태양인 (太陽人, 肺大肝小, #8B1A1A 빨강) — 인구비 0.01
- `te` 태음인 (太陰人, 肝大肺小, #1A4A2E 녹색) — 인구비 0.45 ← 최다
- `sy` 소양인 (少陽人, 脾大腎小, #A04000 주황) — 인구비 0.30
- `se` 소음인 (少陰人, 腎大脾小, #1A3A6B 청색) — 인구비 0.24

### 응답 타입 (DB schema)
- `single` — 4지선다 1개
- `single-unknown` — 4지선다 + "잘 모르겠음" (5번째)
- `ox` — 예/아니오/모름
- `killer-ox` — 예/아니오 (모름 없음, "예" → 해당 체질 +5)
- `dual-mark` — 각 보기마다 ✓확실그렇다/✗확실아니다 (체형·음식)

### 30문항 구성 (adult-v21.json)
- PART 1 체형 (5문항, dual-mark)
- PART 2 생리 (3문항, single-unknown)
- PART 3 OX (8문항, ox)
- PART 4 성격 (4문항, single-unknown)
- PART 5 심리 (4문항, single-unknown)
- PART 6 음식 (2문항, dual-mark)
- 확정 (4문항, killer-ox) — K1~K4

---

## 6. 컨벤션

### DO
- 한글 그대로 사용 (UTF-8)
- Tailwind 유틸 클래스만 사용 (커스텀 CSS 파일 만들지 말 것)
- Server Components 기본, 상호작용 필요 시에만 'use client'
- 모바일 반응형 (sm/md breakpoint)
- 폴더: `app/` 페이지, `components/` 컴포넌트, `lib/` 서버 로직, `data/` 정적 데이터

### DON'T
- 한글 변수명/함수명 X
- 별도 CSS 파일 만들지 X
- 클라이언트 컴포넌트에서 DB 직접 호출 X
- node_modules를 OneDrive에 두지 X (이미 Downloads로 옮김)

---

## 7. 사용자 작업 스타일

- **말투: 반드시 존댓말로 응대할 것** (사용자가 명시적으로 요청함 — 반말 금지)
- 한의사 (비개발자) — 시각적 안내 + 배치 파일 워크플로우 선호
- 진료 사이 짬짬이 작업 → 단계별 진행, 한 번에 너무 많이 X
- 화면 캡처로 결과 확인 좋아함
- 배치 파일 더블 클릭으로 작업 (DEV.bat, RESET-DB-FINAL.bat, COMMIT-*.bat)

---

## 8. 자주 쓰는 명령

```bash
# 개발 서버 (로컬 테스트)
DEV.bat                       # 또는 npm run dev

# DB 리셋 + 재시드
RESET-DB-FINAL.bat            # node 죽이고 → migrate → seed

# 마이그레이션 (스키마 변경 후)
npm run db:generate           # SQL 마이그레이션 생성
npm run db:migrate            # 적용
npm run seed:questionnaire    # 데이터 시드

# Git
COMMIT-*.bat (배치)           # 또는 git add -A && git commit -m "..." && git push
```

---

## 9. 작업 큐 (👉 다음: Phase 3 tsc 검증·커밋 → T8 처방 DB 연동)

### 🔧 진료 Phase 3 — 2차 정밀 진찰 + 처방 도출 UI (2026-06-11, 검증 대기)

- [x] `lib/prescription.ts` — type-info.ts의 rx/rxCold/rxHot 파싱 → 체질+한열 처방 후보 도출(`derivePrescriptions`, `parseRx`, `normalizeHanyul`). 순수 함수(서버/클라 공용). **T8 352개 DB 적재 후 이 함수에서 매칭하도록 확장 예정.**
- [x] `app/actions/clinic-record.ts` — `saveClinicRecord`(원장실 인증 게이트). `survey_records.clinicMemo`에 2차 소견(정밀시진·기능검사·한열재확인·선택처방·메모) JSON 저장 + `stage` → reviewed/prescribed + revalidatePath.
- [x] `components/clinic/SecondStage.tsx` — 정밀시진·기능검사 입력, 한열 재확인(1차 자동판정 보정), 처방 후보 카드(처방명 칩 선택), "2차 소견 저장(검토)"/"처방 확정 저장" 버튼, stage 배지.
- [x] `RecordView.tsx` 자리표시자 → `<SecondStage>` 교체. `app/clinic/[recordId]/page.tsx`에서 `clinicMemo` select 추가 + recordId 전달.
- [x] **검증 완료**: `VERIFY-PHASE3.bat` → `phase3-verify.log` 오류 0 (tsc 통과).
- [x] **커밋·배포 완료** (2026-06-11): `COMMIT-PHASE3.bat`로 푸시 → Vercel 자동 재배포.
- [ ] **T8 연동 남음**: `류주열사상처방개정판.xlsx`(OneDrive) → `prescriptions` 테이블 적재 후 처방 후보를 352개 실제 처방과 매칭.

### ✅ T8 완료 (2026-06-12) — 류주열 처방 342개 적재 + 진료화면 연동

> 엑셀 파싱은 Linux 샌드박스 다운으로 사용자 PC 배치 2단계 방식 사용(덤프→시드).
> 엑셀: `OneDrive/.../사상의학/류주열사상처방개정판.xlsx` (4시트=체질별, 컬럼 No.·처방명·구성(개정)·구성(예전)).

- [x] **덤프**: `scripts/dump-prescriptions.ts`(`// @ts-nocheck`, SheetJS) + `DUMP-PRESCRIPTIONS.bat`(`npm install --no-save xlsx`) → `data/prescriptions-raw.json` + `xlsx-dump.log`.
- [x] **시드**: `scripts/seed-prescriptions.ts`(prescriptions `CREATE TABLE IF NOT EXISTS` + raw.json 멱등 upsert, id=엑셀 No. L/H/P/R###) + `SEED-PRESCRIPTIONS.bat`. **Turso 적재 완료: 342개 (ty 71·te 131·sy 73·se 67)**.
- [x] **연동**: `app/clinic/[recordId]/page.tsx`가 판정 체질의 처방을 select → `RecordView`→`SecondStage`. **류주열 처방이 메인(검색: 처방명/약재) + 선택 시 구성 표시·저장(clinicMemo.selectedRxId/Name/Composition)**. 전통 type-info 처방은 하단 "참고"로 접힘.
- [x] tsc 통과(`phase3-verify.log` 0 오류). 커밋: `COMMIT-T8.bat`.
- ⚠️ **배치는 ASCII만**(한글 echo 넣으면 cmp 인코딩으로 다음 명령줄까지 깨짐 — 이번에 겪음).

### ⏳ T8 후속 (다음 세션 후보)

- [ ] **처방별 적응증·주치 데이터**: 엑셀엔 적응증/한열 태그가 없어 현재는 검색 기반만 가능.
      류주열 처방 적응증·주치를 신뢰 가능한 출처에서 조사·정리해 `prescriptions.indicationsJson`에 적재하면,
      체질+한열+증상 기준 **자동 추천**까지 가능. (사용자 보유 자료 있으면 우선 사용, 없으면 웹 조사 후 원장 검수 필요.)
- [ ] (선택) 테스트 기록 김테스트/T0608 삭제 기능.



### ✅ 진료 Phase 2 완료 (2026-06-11) — 원장실 조회/이어보기

- [x] 간단 비번 게이트 — `lib/clinic-auth.ts`(쿠키 sha256 토큰) + `app/actions/clinic.ts`
      (`verifyClinicPin`/`clinicLogout`). 비번은 환경변수 **`CLINIC_PIN`** (.env.local + Vercel 둘 다 설정됨).
- [x] `/clinic` — 비번 통과 시 환자 기록 목록(차트번호·이름 검색, 체질·날짜) — `app/clinic/page.tsx` + `components/clinic/ClinicList.tsx`
- [x] `/clinic/[recordId]` — 저장된 `resultJson`으로 1차 결과(체질·한열·신뢰도·분포) 재표시 — `RecordView.tsx`
- [x] 홈에 "🩺 원장실" 진입점 + 바탕화면 `사상앱` 폴더에 .url 바로가기(검사실·원장실·홈)
- 검증: tsc 통과 + 배포 사이트 E2E 확인 (원장실 7980 → 김테스트/T0608 → 태음인 결과 재표시 OK)

### ⏳ 진료 Phase 3 시작 시 첫 액션 (2차 설문 + 처방)

1. **T8 먼저**: `사상의학/류주열사상처방개정판.xlsx`(352개) → DB 적재 (`prescriptions` 테이블 이미 schema에 있음).
2. 원장실 기록 화면(`/clinic/[recordId]`)에 2차 추가 단계(정밀시진·기능검사) 입력 + `survey_records.stage` 갱신.
3. 체질+한열 기준 처방 후보 도출(`type-info.ts`의 rx/rxCold/rxHot + 류주열 처방 매칭).
4. (선택) 기록 삭제 기능 — 테스트 기록 김테스트/T0608 정리용.

### ✅ 진료 Phase 1 완료 (2026-06-08) — 검사실 환자 접수 + 온라인 저장

목표(사용자): 검사실 노트북에서 이름·차트번호 넣고 환자가 1차 설문 → 원장실 노트북에서
이어받아 2차 + 처방 도출 → 다시 볼 수 있게 저장. (원본 `온누리_사상체질_감별설문지_v24.html`
= Downloads에 있음, localStorage 기반 단일 브라우저 앱. 이걸 온라인 DB 버전으로 포팅 중.)

- [x] DB: `patients`(이름·차트번호·성별·나이), `survey_records`(answersJson·resultJson·stage) 테이블
      — `db/schema.ts` + `scripts/create-clinic-tables.ts` (CREATE TABLE 직접 SQL, drizzle-kit 회피)
- [x] `/intake` + `components/quiz/IntakeForm.tsx` — 이름·차트번호 필수, 성별·나이 선택
      → sessionStorage(`sasang-patient-info`) → `/quiz/1`
- [x] `app/actions/intake.ts` `saveIntakeRecord` — 차트번호 find-or-create 후 저장 (server action)
- [x] `ResultView.tsx` — 검사실 모드면 결과 1회 자동 저장 + "✓ 원장실에 저장됨" 배너.
      익명 자가진단(`/quiz` 직접)은 저장 안 함 (PIPA: 익명 유지)
- [x] 홈에 "🏥 검사실 — 환자 접수 설문" 진입점
- 검증: tsc 통과 + 배포 사이트에서 E2E 확인 (테스트 기록 **김테스트/차트 T0608** 1건 — Phase 3 삭제 기능으로 정리 예정)

> 참고: `db.run(sql\`...\`)` 로 직접 SQL 실행 가능. 새 테이블은 `scripts/create-*.ts` + 배치(로그 파일 출력)로
> 만들고 Claude가 로그를 읽어 확인하는 패턴이 안정적 (stale-mount로 bash tsc는 가짜 에러 잦음 → tsc는 배치로 로그 출력).
> 비번/토큰 등 비밀값은 Claude가 입력란에 직접 타이핑 X (보안) — 사용자가 Vercel·.env에 직접 입력. CLINIC_PIN도 동일.

---

## 10. 외부 서비스 상태

| 서비스 | 상태 | 비고 |
|---|---|---|
| GitHub | ✅ 사용 중 | kimhungtae/sasang-platform |
| Vercel | ✅ **배포 완료 (2026-06-08)** | **https://sasang-platform.vercel.app** · GitHub main push 시 자동 재배포 |
| Turso | ✅ **운영 중 (2026-06-08)** | DB `sasang-prod` (도쿄 aws-ap-northeast-1) · 30문항 시드 완료 · 웹 대시보드로 생성 (CLI 미사용) |
| Resend | ✅ 가입 완료 | 도메인 연결·API 키 발급 안 함 (T7 인증에서 사용 예정) |

### 배포 메모 (T-deploy 완료)
- **인터넷 주소**: https://sasang-platform.vercel.app — 접수실·검사실·원장실 노트북이 같은 주소로 접속해 자료 공유 (내부망 미사용 → 차트 프로그램과 충돌 없음)
- Vercel 환경변수: `DATABASE_URL`, `TURSO_AUTH_TOKEN` 설정됨 (Production·Preview)
- `next.config.mjs`: 빌드 단계 타입/ESLint 검사 비활성화 (`ignoreBuildErrors`/`ignoreDuringBuilds`) — Vercel `next build` 통과용. 코드 타입은 로컬 `tsc --noEmit`로 검증.
- **Turso 시드 주의**: `scripts/load-env.ts`를 db 모듈보다 먼저 import해야 Turso 주소 반영됨 (ESM import 호이스팅 회피). 시드 막힐 때 `RESET-TURSO-DB.bat`(리셋+재시드), 진단은 `DIAG-TURSO.bat`/`CHECK-TURSO.bat`(로그 파일 출력), 좀비 서버 정리는 `RESTART-DEV.bat`.
- **libsql Windows 주의**: `UV_HANDLE_CLOSING` assertion은 종료 시 무해한 크래시 (작업은 완료됨). 배치에서 `if errorlevel` 중단 걸지 말 것.

---

## 11. 보안 메모

- `.env.local` (DATABASE_URL 등) → gitignore됨
- GitHub 자격증명: Windows Credential Manager에 저장됨 (Git Credential Manager 사용)
- 진료실 PC 노출 사고 이력 있음 → 민감 정보는 항상 환경변수로

---

## 12. 마지막 commit

- **다음 액션: `COMMIT-T8.bat` 더블클릭** (tsc 통과 확인됨, 아직 커밋 전).
- 예정 Message: `feat(clinic): T8 - seed Ryu Ju-yeol 342 prescriptions, prioritize in 2nd stage`
- 직전 커밋: `feat(clinic): Phase 3 - 2nd-stage exam + prescription derivation` (`COMMIT-PHASE3.bat`, 2026-06-11)
- Vercel 환경변수: `DATABASE_URL`, `TURSO_AUTH_TOKEN`, `CLINIC_PIN` 모두 설정됨

---

## 13. 새 세션 시작 시 권장 흐름

1. **이 CLAUDE.md를 먼저 읽기** (자동 로드되어 있을 것)
2. 사용자 요청 듣고 → §9 작업 큐 확인 (현재 다음 작업: 진료 Phase 3 — 2차+처방, T8 선행)
3. **불필요한 재질문 금지**:
   - "어떤 DB?" → libsql + Drizzle (이미 셋업됨)
   - "체질 정보 어디?" → `data/type-info.ts`
   - "어떤 스타일?" → Tailwind만
   - "배포는?" → ✅ 완료. https://sasang-platform.vercel.app (Vercel + Turso, §10)
4. 새 코드는 §4 폴더 구조에 맞춰 배치
5. 큰 변경 끝나면 commit 배치 만들어 사용자에게 안내

---

**마지막 업데이트**: 2026-06-12 (T8 — 류주열 342개 처방 적재·진료화면 연동, 커밋 대기)
