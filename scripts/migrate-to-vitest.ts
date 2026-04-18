import * as fs from 'fs';
import * as path from 'path';
import { scanFiles } from './file-scanner';
import { runPipeline } from './pipeline';
import { writeFile } from './file-writer';
import { DiffLogger } from './diff-logger';

async function main(): Promise<void> {
  const rootDir = path.resolve(process.cwd(), 'src/app');
  const reportPath = path.resolve(process.cwd(), 'migration-report.json');

  console.log(`Scanning spec files in: ${rootDir}`);

  const { files, totalCount } = scanFiles(rootDir);

  console.log(`Found ${totalCount} spec files. Starting migration...\n`);

  const logger = new DiffLogger();

  for (const filePath of files) {
    const originalSource = fs.readFileSync(filePath, 'utf-8');
    const result = runPipeline(originalSource, filePath);

    if (!result.valid) {
      console.warn(`  ✗ FAILED   ${path.relative(process.cwd(), filePath)}`);
      result.errors.forEach(e => console.warn(`      ${e}`));
      writeFile(filePath, result.source, originalSource, false);
      logger.record(filePath, 'failed', result.warnings, result.errors);
      continue;
    }

    if (result.warnings.length > 0) {
      console.warn(`  ⚠ FALLBACK ${path.relative(process.cwd(), filePath)}`);
      result.warnings.forEach(w => console.warn(`      ${w}`));
    }

    const status = writeFile(filePath, result.source, originalSource, true);

    if (status === 'migrated') {
      console.log(`  ✓ MIGRATED ${path.relative(process.cwd(), filePath)}`);
    }

    const fileStatus = result.warnings.length > 0 ? 'fallback' : status;

    logger.record(filePath, fileStatus, result.warnings, result.errors);
  }

  logger.printSummary();
  logger.write(reportPath);
  console.log(`Report written to: ${reportPath}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
