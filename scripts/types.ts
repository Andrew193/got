export interface TransformResult {
  source: string; // transformed source
  changed: boolean; // whether any change was made
  warnings: string[]; // non-fatal issues found
}

export interface ScanResult {
  files: string[];
  totalCount: number;
}

export type FileStatus = 'migrated' | 'unchanged' | 'failed' | 'fallback';

export interface MigrationReport {
  timestamp: string;
  totalFiles: number;
  migratedFiles: number;
  skippedFiles: number;
  failedFiles: string[];
  warnings: Record<string, string[]>;
}

export type Transformer = (source: string, filePath: string) => TransformResult;
