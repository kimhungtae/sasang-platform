import Link from 'next/link';
import { notFound } from 'next/navigation';
import { TYPE_INFO, CONSTITUTIONS, type Constitution } from '@/data/type-info';
import { LIFESTYLE, SECTION_ORDER } from '@/data/lifestyle';
import { Disclaimer } from '@/components/Disclaimer';

export function generateStaticParams() {
  return CONSTITUTIONS.map((constitution) => ({ constitution }));
}

function isConstitution(value: string): value is Constitution {
  return (CONSTITUTIONS as string[]).includes(value);
}

type Props = {
  params: { constitution: string };
};

export default function GuidePage({ params }: Props) {
  const code = params.constitution;
  if (!isConstitution(code)) {
    notFound();
  }

  const info = TYPE_INFO[code];
  const guide = LIFESTYLE[code];

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/30 to-white dark:from-zinc-950 dark:to-zinc-900">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 sm:py-12 space-y-6">

        {/* 헤더 */}
        <div className="text-center space-y-1 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <p className="text-xs tracking-widest text-zinc-500 dark:text-zinc-400">온 누 리 한 의 원</p>
          <h1 className="text-xl sm:text-2xl font-serif font-semibold text-zinc-900 dark:text-zinc-100">
            사상체질 섭생 가이드
          </h1>
        </div>

        {/* 히어로 — 체질 */}
        <div
          className="rounded-2xl p-6 sm:p-8 shadow-sm border-2"
          style={{ borderColor: info.color, backgroundColor: `${info.color}10` }}
        >
          <div className="flex items-center gap-4 sm:gap-6">
            <div
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl text-white font-bold shadow-lg flex-shrink-0"
              style={{ backgroundColor: info.color }}
            >
              {info.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium tracking-wider" style={{ color: info.color }}>섭생 가이드</p>
              <h2 className="text-2xl sm:text-3xl font-bold mt-1" style={{ color: info.color }}>
                {info.name} <span className="text-lg sm:text-xl font-serif">{info.hanja}</span>
              </h2>
              <p className="text-sm mt-1" style={{ color: info.color, opacity: 0.8 }}>{info.organ}</p>
            </div>
          </div>
          <p className="text-sm mt-4 leading-relaxed text-zinc-700 dark:text-zinc-300">
            {guide.headline}
          </p>
        </div>

        {/* 핵심 건강 지표 */}
        <div
          className="rounded-lg border-l-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4"
          style={{ borderLeftColor: info.color }}
        >
          <p className="text-xs font-medium tracking-wider mb-1" style={{ color: info.color }}>
            핵심 건강 지표
          </p>
          <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{guide.keyIndicator}</p>
        </div>

        {/* 4섹션: 음식 · 운동 · 정서 · 주의 */}
        {SECTION_ORDER.map((key) => {
          const section = guide[key];
          return (
            <section
              key={key}
              className="rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 space-y-4"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                  style={{ backgroundColor: `${info.color}15` }}
                >
                  {section.icon}
                </span>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{section.label}</h3>
              </div>

              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{section.intro}</p>

              {/* 음식 섹션: 권장 / 절제 칩 */}
              {(section.recommend || section.avoid) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {section.recommend && (
                    <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 p-3">
                      <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300 mb-2">권장</p>
                      <div className="flex flex-wrap gap-1.5">
                        {section.recommend.map((f) => (
                          <span
                            key={f}
                            className="text-xs px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {section.avoid && (
                    <div className="rounded-lg bg-red-50 dark:bg-red-950/30 p-3">
                      <p className="text-xs font-medium text-red-700 dark:text-red-300 mb-2">절제</p>
                      <div className="flex flex-wrap gap-1.5">
                        {section.avoid.map((f) => (
                          <span
                            key={f}
                            className="text-xs px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 실천 항목 */}
              <ul className="space-y-2.5 text-sm text-zinc-700 dark:text-zinc-300">
                {section.tips.map((tip, i) => (
                  <li key={i} className="flex gap-3">
                    <span
                      className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: info.color }}
                    />
                    <span className="leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}

        {/* 면책 */}
        <Disclaimer variant="full" />

        {/* 다른 체질 가이드 */}
        <div className="rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 space-y-3">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">다른 체질 섭생 가이드</h3>
          <div className="flex flex-wrap gap-2">
            {CONSTITUTIONS.filter((c) => c !== code).map((c) => {
              const ti = TYPE_INFO[c];
              return (
                <Link
                  key={c}
                  href={`/guide/${c}`}
                  className="text-sm px-3 py-1.5 rounded-lg border transition hover:opacity-80"
                  style={{ borderColor: ti.color, color: ti.color }}
                >
                  {ti.icon} {ti.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* 액션 */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href="/result"
            className="px-6 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition text-center"
          >
            ← 결과지로 돌아가기
          </Link>
          <Link
            href="/"
            className="px-6 py-2.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition text-center"
          >
            홈으로
          </Link>
        </div>
      </div>
    </div>
  );
}
