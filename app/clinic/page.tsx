import { db, schema } from '@/db';
import { desc, eq } from 'drizzle-orm';
import { isClinicAuthed, clinicConfigured } from '@/lib/clinic-auth';
import { ClinicGate } from '@/components/clinic/ClinicGate';
import { ClinicList, type ClinicRecord } from '@/components/clinic/ClinicList';
import type { Constitution } from '@/data/type-info';

export const dynamic = 'force-dynamic';

export default async function ClinicPage() {
  if (!isClinicAuthed()) {
    return <ClinicGate configured={clinicConfigured()} />;
  }

  const rows = await db
    .select({
      recordId: schema.surveyRecords.id,
      createdAt: schema.surveyRecords.createdAt,
      stage: schema.surveyRecords.stage,
      resultJson: schema.surveyRecords.resultJson,
      name: schema.patients.name,
      chartNo: schema.patients.chartNo,
      gender: schema.patients.gender,
      age: schema.patients.age,
    })
    .from(schema.surveyRecords)
    .innerJoin(schema.patients, eq(schema.surveyRecords.patientId, schema.patients.id))
    .orderBy(desc(schema.surveyRecords.createdAt))
    .limit(300);

  const records: ClinicRecord[] = rows.map((r) => {
    let top: Constitution | null = null;
    try {
      const parsed = JSON.parse(r.resultJson);
      top = (parsed?.top as Constitution) ?? null;
    } catch {
      top = null;
    }
    return {
      recordId: r.recordId,
      date: r.createdAt instanceof Date ? r.createdAt.getTime() : Number(r.createdAt) * 1000,
      stage: r.stage,
      name: r.name,
      chartNo: r.chartNo,
      gender: r.gender,
      age: r.age,
      top,
    };
  });

  return <ClinicList records={records} />;
}
