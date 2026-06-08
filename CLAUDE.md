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

## 2. 진행 상황 (2026-06-01 기준)

### ✅ 완료된 작업

| Task | 결과물 |
|---|---|
| T1 | Next.js 14 + TypeScript + Tailwind 부트스트랩, GitHub push |
| T2 | DB 스키마 (Drizzle + @libsql/client, 12 테이블) |
| T3 | 설문지 ETL (v23 28문항 → v21 26문항 → v24-platform 30문항으로 진화) |
| T4 | 자가진단 UI (`/quiz`, `/quiz/[step]`) |
| T5 | v24 채점 알고리즘 + 결과지 (Stage 1/2/3, 한열 분기, Bayesian Prior) |

### ⏳ 남은 작업 (Phase 1)

| Task | 내용 | 예상 |
|---|---|---|
| **T6** | 섭생 가이드 페이지 `/guide/[constitution]` | 1~2시간 |
| T7 | Auth.js 인증 (한의사/환자 구분, Resend 이메일) | 3~5시간 |
| T8 | 류주열 처방 352개 ETL | 2~3시간 |
| T9 | 처방 검색 페이지 | 3~4시간 |
| T10 | 면책·법적 페이지 | 1시간 |
| T11 | README + 운영 문서 | 1시간 |
| T12 | Phase 1 검증 (E2E 테스트) | 2시간 |

**진행률**: 5/12 (42%) · 진료실 적용까지 약 2~3주 추정

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

## 9. T6 작업 큐 (다음 작업)

DEVELOPMENT_GUIDE §8 T6 (`/sasang-platform/CLAUDE.md`보다 더 상세):
- [ ] `data/lifestyle/{ty,te,sy,se}.md` 4파일 작성
  - **참고**: `data/type-info.ts`의 `TYPE_INFO[c].saeng` 6항목이 이미 있음
  - 사상의학 폴더의 섭생법 HWP 4종에서 추가 정리 가능
- [ ] `app/guide/[constitution]/page.tsx` 작성
- [ ] 4섹션 구조: 음식 · 운동 · 정서 · 주의
- [ ] 결과 페이지에서 "더 자세히 보기" 링크로 연결
- [ ] (선택) 한의사 상담 CTA — 내부용이라 v2에서 활성화

### T6 시작 시 첫 액션

1. `data/type-info.ts` 확인 (TYPE_INFO 구조 파악)
2. `사상의학` 폴더의 섭생법 HWP 파일 위치 확인
   - `/sessions/<id>/mnt/onnuriclinic/사상의학/[태양|태음|소양|소음]인 섭생법.hwp`
3. 페이지 구조 설계 후 사용자에게 보여주고 진행

---

## 10. 외부 서비스 상태

| 서비스 | 상태 | 비고 |
|---|---|---|
| GitHub | ✅ 사용 중 | kimhungtae/sasang-platform |
| Vercel | ✅ 가입 완료 | 아직 배포 안 함 |
| Turso | ✅ 가입 완료 | CLI 설치 + DB 생성 안 함 |
| Resend | ✅ 가입 완료 | 도메인 연결·API 키 발급 안 함 |

T7(인증)에서 Resend, T-deploy에서 Vercel/Turso 본격 사용 예정.

---

## 11. 보안 메모

- `.env.local` (DATABASE_URL 등) → gitignore됨
- GitHub 자격증명: Windows Credential Manager에 저장됨 (Git Credential Manager 사용)
- 진료실 PC 노출 사고 이력 있음 → 민감 정보는 항상 환경변수로

---

## 12. 마지막 commit

- Hash: `7fbe00b`
- Message: `feat(quiz): T5 v24-platform - scoring algorithm and result page`
- Date: 2026-06-01

---

## 13. 새 세션 시작 시 권장 흐름

1. **이 CLAUDE.md를 먼저 읽기** (자동 로드되어 있을 것)
2. 사용자 요청 듣고 → §9 T6 작업 큐 확인
3. **불필요한 재질문 금지**:
   - "어떤 DB?" → libsql + Drizzle (이미 셋업됨)
   - "체질 정보 어디?" → `data/type-info.ts`
   - "어떤 스타일?" → Tailwind만
   - "배포는?" → 아직 로컬만, T-deploy에서 Vercel
4. 새 코드는 §4 폴더 구조에 맞춰 배치
5. 큰 변경 끝나면 commit 배치 만들어 사용자에게 안내

---

**마지막 업데이트**: 2026-06-01 (T5 완료 시점, 이전 Cowork 세션에서 작성)
