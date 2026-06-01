import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getActiveAdult28 } from '@/lib/quiz';
import { Disclaimer } from '@/components/Disclaimer';

export const dynamic = 'force-dynamic';

export default async function QuizEntryPage() {
  const qnaire = await getActiveAdult28();
  if (!qnaire) {
    // DB에 설문지가 아직 seed 안 됐을 때
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-semibold">설문지 데이터 없음</h1>
          <p className="text-zinc-600">
            <code>npm run seed:questionnaire</code>를 먼저 실행해주세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white dark:from-zinc-950 dark:to-zinc-900">
      <div className="max-w-2xl mx-auto px-4 py-12 sm:px-6 sm:py-20 space-y-8">
        <div className="space-y-3 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            {qnaire.title}
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            총 <strong>{qnaire.totalQuestions}문항</strong> · 약 5~10분 소요
          </p>
        </div>

        <div className="rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">설문지 안내</h2>
          <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
            {qnaire.description}
          </p>
        </div>

        <Disclaimer variant="full" />

        <div className="rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 space-y-3">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">진행 방법</h2>
          <ul className="text-sm text-zinc-700 dark:text-zinc-300 space-y-1.5">
            <li>• 한 문항씩 화면에 표시됩니다.</li>
            <li>• 자신에게 가장 해당되는 답을 하나 선택하세요.</li>
            <li>• 음식 관련 문항은 여러 항목 선택 가능합니다.</li>
            <li>• 이전 버튼으로 답을 수정할 수 있습니다.</li>
            <li>• 결과는 마지막 문항 후 자동 표시됩니다.</li>
          </ul>
        </div>

        <div className="flex justify-center pt-2">
          <Link
            href="/quiz/1"
            className="inline-block px-8 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-lg font-semibold shadow-sm transition"
          >
            시작하기 →
          </Link>
        </div>

        <div className="text-center">
          <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
            ← 홈으로
          </Link>
        </div>
      </div>
    </div>
  );
}
