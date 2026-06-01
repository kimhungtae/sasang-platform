/**
 * 면책 고지 컴포넌트
 * 자가진단/결과 페이지에서 재사용
 */

type Props = {
  variant?: 'compact' | 'full';
};

export function Disclaimer({ variant = 'compact' }: Props) {
  if (variant === 'full') {
    return (
      <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100">
        <p className="font-semibold mb-2">⚠️ 의료 면책 고지</p>
        <ul className="list-disc list-inside space-y-1">
          <li>본 자가진단은 <strong>참고용</strong>이며 의학적 진단을 대체하지 않습니다.</li>
          <li>정확한 사상체질 진단은 한의사의 직접 진료가 필요합니다.</li>
          <li>설문 결과만으로 약물 복용·치료를 결정하지 마세요.</li>
          <li>증상이 있으시면 반드시 의료기관을 방문해주세요.</li>
        </ul>
      </div>
    );
  }

  return (
    <p className="text-xs text-zinc-500 dark:text-zinc-400">
      ⚠️ 본 결과는 참고용이며 의학적 진단을 대체하지 않습니다. 정확한 진단은 한의사 진료가 필요합니다.
    </p>
  );
}
