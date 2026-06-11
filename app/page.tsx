import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 to-white dark:from-zinc-950 dark:to-zinc-900">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 sm:py-24">
        <div className="text-center space-y-6">
          <div className="inline-block text-5xl">🌿</div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            사상의학 플랫폼
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto">
            동무 이제마의 사상의학을 기반으로 한 체질 감별 · 처방 · 강의록 통합 플랫폼.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
          <Link
            href="/intake"
            className="group rounded-lg bg-emerald-600 hover:bg-emerald-700 border-2 border-emerald-600 p-6 transition text-white"
          >
            <div className="text-2xl mb-2">🏥</div>
            <h2 className="font-semibold mb-1">검사실 — 환자 접수 설문</h2>
            <p className="text-sm text-emerald-50/90">
              이름·차트번호 입력 후 환자가 설문 작성. 결과는 원장실에서 이어봅니다.
            </p>
            <div className="mt-3 text-sm font-medium group-hover:underline">
              환자 접수 시작 →
            </div>
          </Link>

          <Link
            href="/quiz"
            className="group rounded-lg bg-white dark:bg-zinc-900 border-2 border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 p-6 transition"
          >
            <div className="text-2xl mb-2">🔍</div>
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
              사상체질 자가진단 (익명)
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              30문항 설문으로 사상체질을 가늠해봅니다. (저장 안 됨)
            </p>
            <div className="mt-3 text-sm font-medium text-emerald-600 dark:text-emerald-400 group-hover:underline">
              시작하기 →
            </div>
          </Link>

          <Link
            href="/clinic"
            className="group rounded-lg bg-white dark:bg-zinc-900 border-2 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 p-6 transition"
          >
            <div className="text-2xl mb-2">🩺</div>
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
              원장실 — 환자 기록 조회
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              검사실에서 접수한 환자 기록 열람 (비밀번호 필요).
            </p>
            <div className="mt-3 text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:underline">
              입장 →
            </div>
          </Link>

          <div className="rounded-lg bg-zinc-100 dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 p-6 opacity-60">
            <div className="text-2xl mb-2">📚</div>
            <h2 className="font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              처방 검색
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-500">
              류주열 처방 352개 검색 (Phase 3)
            </p>
            <div className="mt-3 text-sm font-medium text-zinc-400">
              T8 이후 구현 예정
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-xs text-zinc-500 dark:text-zinc-500">
            온누리한의원 · 사상의학 디지털 플랫폼 · 개발 중 v0.1
          </p>
        </div>
      </div>
    </main>
  );
}
