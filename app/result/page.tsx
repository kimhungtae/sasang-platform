import { getActiveQuestionnaire, getAllQuestions } from '@/lib/quiz';
import { ResultView } from '@/components/quiz/ResultView';

export const dynamic = 'force-dynamic';

export default async function ResultPage() {
  const qnaire = await getActiveQuestionnaire();
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

  const questions = await getAllQuestions(qnaire.id);

  return <ResultView questions={questions} qnaireId={qnaire.id} />;
}
