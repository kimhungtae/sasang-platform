// @ts-nocheck
/**
 * 류주열 사상처방 엑셀 덤프 스크립트 (T8 1단계 — 일회성 도구)
 *
 * 엑셀(.xlsx)을 파싱해서:
 *   1) 전체 행을 data/prescriptions-raw.json 으로 저장 (시트별 객체 배열)
 *   2) 시트 이름·헤더·행수·앞부분 미리보기를 stdout에 출력 (배치가 로그로 캡처)
 *
 * 실행(배치): npm install --no-save xlsx  &&  npx tsx scripts/dump-prescriptions.ts
 * SheetJS(xlsx)는 일회성 파싱용으로 --no-save 설치 (package.json·배포 영향 없음).
 *
 * 엑셀 경로는 기본값(OneDrive) 또는 argv[2]로 지정.
 */
import * as fs from 'fs';
import * as path from 'path';
const XLSX = require('xlsx');

const DEFAULT_XLSX =
  'C:\\Users\\rla1w\\OneDrive\\Desktop\\onnuriclinic\\사상의학\\류주열사상처방개정판.xlsx';

function main() {
  const file = process.argv[2] || DEFAULT_XLSX;
  console.log('=== Dump prescriptions xlsx ===');
  console.log('  file: ' + file);
  if (!fs.existsSync(file)) {
    console.error('  ✗ 파일을 찾을 수 없습니다: ' + file);
    process.exit(1);
  }

  const wb = XLSX.readFile(file, { cellDates: false });
  console.log('  sheets: ' + JSON.stringify(wb.SheetNames));

  const out: Record<string, unknown[]> = {};

  for (const name of wb.SheetNames) {
    const ws = wb.Sheets[name];
    // 헤더 포함 2차원 배열 (구조 파악용)
    const matrix: unknown[][] = XLSX.utils.sheet_to_json(ws, {
      header: 1,
      defval: '',
      blankrows: false,
    });
    // 헤더를 키로 쓰는 객체 배열 (적재용)
    const objects: unknown[] = XLSX.utils.sheet_to_json(ws, { defval: '' });
    out[name] = objects;

    console.log('\n--- SHEET: ' + name + ' ---');
    console.log('  rows(matrix): ' + matrix.length + ' · rows(objects): ' + objects.length);
    console.log('  header row: ' + JSON.stringify(matrix[0] ?? []));
    console.log('  preview (first 5 object rows):');
    console.log(JSON.stringify(objects.slice(0, 5), null, 2));
  }

  const outPath = path.join(process.cwd(), 'data', 'prescriptions-raw.json');
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf8');
  console.log('\n  ✓ wrote ' + outPath);
  console.log('=== Done. Tell Claude it finished. ===');
}

main();
