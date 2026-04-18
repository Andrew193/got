import { sync as globSync } from 'glob';
import * as path from 'path';

import { ScanResult } from './types';

export function scanFiles(rootDir: string): ScanResult {
  const pattern = path.join(rootDir, '**', '*.spec.ts').replace(/\\/g, '/');
  const files = globSync(pattern).map(f => path.resolve(f));

  return {
    files,
    totalCount: files.length,
  };
}
