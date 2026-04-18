import * as fs from 'fs';
import * as path from 'path';
import { FileStatus, MigrationReport } from './types';

interface FileEntry {
  status: FileStatus;
  warnings: string[];
  errors: string[];
}

export class DiffLogger {
  private entries = new Map<string, FileEntry>();

  record(
    filePath: string,
    status: FileStatus,
    warnings: string[] = [],
    errors: string[] = [],
  ): void {
    this.entries.set(filePath, { status, warnings, errors });
  }

  write(outputPath: string): void {
    const allEntries = Array.from(this.entries.entries());

    const report: MigrationReport = {
      timestamp: new Date().toISOString(),
      totalFiles: allEntries.length,
      migratedFiles: allEntries.filter(([, e]) => e.status === 'migrated').length,
      skippedFiles: allEntries.filter(([, e]) => e.status === 'unchanged').length,
      failedFiles: allEntries.filter(([, e]) => e.status === 'failed').map(([f]) => f),
      warnings: Object.fromEntries(
        allEntries.filter(([, e]) => e.warnings.length > 0).map(([f, e]) => [f, e.warnings]),
      ),
    };

    const dir = path.dirname(outputPath);

    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), 'utf-8');
  }

  printSummary(): void {
    const allEntries = Array.from(this.entries.entries());
    const migrated = allEntries.filter(([, e]) => e.status === 'migrated').length;
    const unchanged = allEntries.filter(([, e]) => e.status === 'unchanged').length;
    const failed = allEntries.filter(([, e]) => e.status === 'failed').length;
    const fallback = allEntries.filter(([, e]) => e.status === 'fallback').length;

    console.log('\n── Migration Summary ──────────────────────────');
    console.log(`  Total:     ${allEntries.length}`);
    console.log(`  Migrated:  ${migrated}`);
    console.log(`  Unchanged: ${unchanged}`);
    console.log(`  Fallback:  ${fallback}`);
    console.log(`  Failed:    ${failed}`);
    console.log('───────────────────────────────────────────────\n');

    if (failed > 0) {
      console.log('Failed files:');
      allEntries
        .filter(([, e]) => e.status === 'failed')
        .forEach(([f, e]) => {
          console.log(`  ${f}`);
          e.errors.forEach(err => console.log(`    ✗ ${err}`));
        });
    }
  }
}
