import { notFound } from 'next/navigation';
import { getActiveAdult28, getQuestionByOrder } from '@/lib/quiz';
import { QuizStep } from '@/components/quiz/QuizStep';
import { Disclaimer } from '@/components/Disclaimer';

export const dynamic = 'force-dynamic';

type Props = {
  params: { step: string };
};

export default async function QuizStepPage({ params }: Props) {
  const step = Number(params.step);
  if (!Number.isInteger(step) || step < 1) {
    notFound();
  }

  const qnaire = await getActiveAdult28();
  if (!qnaire) {
    notFound();
  }

  if (step > qnaire.totalQuestions) {
    notFound();
  }

  const question = await getQuestionByOrder(qnaire.id, step);
  if (!question) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/30 to-white dark:from-zinc-950 dark:to-zinc-900">
      <QuizStep question={question} totalQuestions={qnaire.totalQuestions} />
      <div className="max-w-2xl mx-auto px-4 pb-8 sm:px-6">
        <Disclaimer variant="compact" />
      </div>
    </div>
  );
}
