'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export const PATIENT_KEY = 'sasang-patient-info';
const ANSWERS_KEY = 'sasang-quiz-answers';

export type PatientInfo = {
  name: string;
  chartNo: string;
  gender: 'M' | 'F' | '';
  age: string; // 입력 단계에선 문자열, 저장 시 숫자 변환
};

export function IntakeForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [chartNo, setChartNo] = useState('');
  const [gender, setGender] = useState<'M' | 'F' | ''>('');
  const [age, setAge] = useState('');
  const [error, setError] = useState('');

  function start() {
    if (!name.trim() || !chartNo.trim()) {
      setError('이름과 차트번호를 입력해주세요.');
      return;
    }
    const info: PatientInfo = {
      name: name.trim(),
      chartNo: chartNo.trim(),
      gender,
      age: age.trim(),
    };
    // 새 환자 시작 — 이전 응답 비우고 인적사항 저장
    sessionStorage.removeItem(ANSWERS_KEY);
    sessionStorage.setItem(PATIENT_KEY, JSON.stringify(info));
    router.push('/quiz/1');
  }

  return (
    <div className="rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
      <div className="space-y-1">
        <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">환자 정보</h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          이름과 차트번호는 필수입니다. 성별·나이는 선택입니다.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            이름 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="홍길동"
            className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            차트번호 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={chartNo}
            onChange={(e) => setChartNo(e.target.value)}
            placeholder="예: 12345"
            className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            성별 <span className="text-zinc-400 text-xs">(선택)</span>
          </label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value as 'M' | 'F' | '')}
            className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">선택 안 함</option>
            <option value="M">남</option>
            <option value="F">여</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            나이 <span className="text-zinc-400 text-xs">(선택)</span>
          </label>
          <input
            type="number"
            inputMode="numeric"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="35"
            min={0}
            max={120}
            className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <button
        type="button"
        onClick={start}
        className="w-full sm:w-auto px-8 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-lg font-semibold shadow-sm transition"
      >
        설문 시작하기 →
      </button>
    </div>
  );
}
