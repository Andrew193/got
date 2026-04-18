import { TransformResult, Transformer } from '../types';

export const importTransformer: Transformer = (
  source: string,
  _filePath: string,
): TransformResult => {
  const lines = source.split('\n');
  const filtered = lines.filter(line => {
    const trimmed = line.trim();

    // Remove: import Spy = jasmine.Spy;
    if (/^import\s+\w+\s*=\s*jasmine\.\w+\s*;?$/.test(trimmed)) {
      return false;
    }

    // Remove: import 'jasmine';
    if (/^import\s+['"]jasmine['"]\s*;?$/.test(trimmed)) {
      return false;
    }

    // Remove: /// <reference types="jasmine" />
    if (/^\/\/\/\s*<reference\s+types=["']jasmine["']\s*\/>$/.test(trimmed)) {
      return false;
    }

    return true;
  });

  const result = filtered.join('\n');
  const changed = result !== source;

  return { source: result, changed, warnings: [] };
};
