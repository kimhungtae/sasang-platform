import Link from 'next/link';
import { db, schema } from '@/db';
import { eq } from 'drizzle-orm';
import { isClinicAuthed, clinicConfigured } from '@/lib/clinic-auth';
import { ClinicGate } from '@/components/clinic/ClinicGate';
import { RecordView } from '@/components/clinic/RecordView';

export const dynamic = 'force-dynamic';

type Props = { params: { recordId: string } };

export default async function ClinicRecordPage({ params }: Props) {
  if (!isClinicAuthed()) {
    return <ClinicGate configured={clinicConfigured()} />;
  }

  const id = Number(params.recordId);
  if (!Number.isInteger(id) || id < 1) {
    return <NotFoundBox />;
  }

  const rows = await db
    .select({
      createdAt: schema.surveyRecords.createdAt,
      stage: schema.surveyRecords.stage,
      resultJson: schema.surveyRecords.resultJson,
      clinicMemo: schema.surveyRecords.clinicMemo,
      name: schema.patients.name,
      chartNo: schema.patients.chartNo,
      gender: schema.patients.gender,
      age: schema.patients.age,
    })
    .from(schema.surveyRecords)
    .innerJoin(schema.patients, eq(schema.surveyRecords.patientId, schema.patients.id))
    .where(eq(schema.surveyRecords.id, id))
    .limit(1);

  const row = rows[0];
  if (!row) {
    return <NotFoundBox />;
  }

  let result: Record<string, unknown> = {};
  try {
    result = JSON.parse(row.resultJson);
  } catch {
    result = {};
  }

  let clinicMemo: Record<string, unknown> | null = null;
  if (row.clinicMemo) {
    try {
      clinicMemo = JSON.parse(row.clinicMemo);
    } catch {
      clinicMemo = null;
    }
  }

  // 판정 체질의 류주열 처방 목록 (메인 처방 후보)
  const topConstitution =
    typeof result.top === 'string' &&
    (['ty', 'te', 'sy', 'se'] as const).includes(result.top as 'ty' | 'te' | 'sy' | 'se')
      ? (result.top as 'ty' | 'te' | 'sy' | 'se')
      : null;

  let prescriptions: {
    id: string;
    name: string;
    current: string | null;
    legacy: string | null;
  }[] = [];
  if (topConstitution) {
    const rxRows = await db
      .select({
        id: schema.prescriptions.id,
        name: schema.prescriptions.name,
        current: schema.prescriptions.compositionCurrent,
        legacy: schema.prescriptions.compositionLegacy,
      })
      .from(schema.prescriptions)
      .where(eq(schema.prescriptions.constitution, topConstitution));
    prescriptions = rxRows;
  }

  return (
    <RecordView
      recordId={id}
      patient={{ name: row.name, chartNo: row.chartNo, gender: row.gender, age: row.age }}
      date={row.createdAt instanceof Date ? row.createdAt.getTime() : Number(row.createdAt) * 1000}
      stage={row.stage}
      result={result}
      clinicMemo={clinicMemo}
      prescriptions={prescriptions}
    />
  );
}

function NotFoundBox() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-4">
        <div className="text-4xl">🔍</div>
        <h1 className="text-xl font-semibold">기록을 찾을 수 없습니다</h1>
        <Link
          href="/clinic"
          className="inline-block px-5 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-sm"
        >
          ← 목록으로
        </Link>
      </div>
    </div>
  );
}
