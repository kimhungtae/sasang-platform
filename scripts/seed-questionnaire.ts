/**
 * 설문지 시드 스크립트 (v21 우선)
 *
 * data/questionnaires/adult-v21.json → SQLite DB
 *
 * 실행: npm run seed:questionnaire
 * 멱등성: 같은 type+version 이미 있으면 스킵
 */

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { db, schema } from '../db';
import { eq, and } from 'drizzle-orm';
import questionnaire from '../data/questionnaires/adult-v21.json';

type ChoiceData = {
  order: number;
  label: string;
  effects: Record<string, unknown>;
};

type QuestionData = {
  order: number;
  code: string;
  section: string;
  type: 'single' | 'single-unknown' | 'multiselect-food' | 'ox' | 'killer-ox' | 'dual-mark';
  isCore: boolean;
  tag?: string;
  confirmConstitution?: string;
  text: string;
  choices: ChoiceData[];
};

async function main() {
  console.log(`\n=== Seeding questionnaire: ${questionnaire.type} ${questionnaire.version} ===`);

  const existing = await db
    .select()
    .from(schema.questionnaires)
    .where(
      and(
        eq(schema.questionnaires.type, questionnaire.type as any),
        eq(schema.questionnaires.version, questionnaire.version),
      ),
    );

  if (existing.length > 0) {
    console.log(`✓ Already seeded (id=${existing[0].id}). Skipping.`);
    return;
  }

  const [qnaire] = await db
    .insert(schema.questionnaires)
    .values({
      type: questionnaire.type as any,
      version: questionnaire.version,
      title: questionnaire.title,
      description: questionnaire.description,
      weightsJson: JSON.stringify({
        sections: questionnaire.sections,
        constitutionPalette: questionnaire.constitutionPalette,
      }),
      active: true,
    })
    .returning();

  console.log(`✓ Inserted questionnaire (id=${qnaire.id})`);

  let questionCount = 0;
  let choiceCount = 0;
  const sectionCounts: Record<string, number> = {};

  for (const q of questionnaire.questions as QuestionData[]) {
    const [questionRow] = await db
      .insert(schema.questions)
      .values({
        qnaireId: qnaire.id,
        order: q.order,
        code: q.code,
        section: q.section as any,
        text: q.text,
        tag: q.tag,
        type: q.type as any,
        isCore: q.isCore,
        confirmConstitution: q.confirmConstitution as any,
        effectsJson: null,
      })
      .returning();

    questionCount++;
    sectionCounts[q.section] = (sectionCounts[q.section] || 0) + 1;

    for (const c of q.choices) {
      await db.insert(schema.choices).values({
        questionId: questionRow.id,
        order: c.order,
        label: c.label,
        constitutionKey: null,
        effectsJson: JSON.stringify(c.effects),
      });
      choiceCount++;
    }
  }

  console.log(`✓ Inserted ${questionCount} questions, ${choiceCount} choices`);
  console.log('\n  Section breakdown:');
  for (const [k, v] of Object.entries(sectionCounts)) {
    console.log(`    ${k.padEnd(10)} ${v} questions`);
  }

  console.log('\n=== Seed complete! ===');
  console.log(`  Title:    ${qnaire.title}`);
  console.log(`  Version:  ${qnaire.version}`);
  console.log(`  Questions: ${questionCount}`);
  console.log(`  Choices:   ${choiceCount}`);
  console.log('');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('\n✗ Seed failed:', err);
    process.exit(1);
  });
