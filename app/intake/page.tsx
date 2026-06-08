import Link from 'next/link';
import { getActiveAdult28 } from '@/lib/quiz';
import { IntakeForm } from '@/components/quiz/IntakeForm';
import { Disclaimer } from '@/components/Disclaimer';

export const dynamic = 'force-dynamic';

export default async function IntakePage() {
  const qnaire = await getActiveAdult28();
  if (!qnaire) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-semibold">설문지 데이터 없음</h1>
          <p className="text-zinc-600 text-sm">DB에 설문지가 시드되지 않았습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white dark:from-zinc-950 dark:to-zinc-900">
      <div className="max-w-2xl mx-auto px-4 py-10 sm:px-6 sm:py-16 space-y-6">
        <div className="text-center space-y-2 pb-2 border-b border-zinc-200 dark:border-zinc-800">
          <p className="text-xs tracking-widest text-zinc-500 dark:text-zinc-400">온 누 리 한 의 원 · 검 사 실</p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            {qnaire.title}
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            환자 접수 설문 · 총 <strong>{qnaire.totalQuestions}문항</strong> · 약 5~10분
          </p>
        </div>

        <p className="text-sm text-zinc-600 dark:text-zinc-400 text-center">
          환자 정보를 입력한 뒤 설문을 시작하세요. 작성한 결과는 자동으로 저장되어
          원장실에서 이어서 확인할 수 있습니다.
        </p>

        <IntakeForm />

        <Disclaimer variant="full" />

        <div className="text-center">
          <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
            ← 홈으로
          </Link>
        </div>
      </div>
    </div>
  );
}
