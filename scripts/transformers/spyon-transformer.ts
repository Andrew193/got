import { TransformResult, Transformer } from '../types';

/**
 * Replaces bare `spyOn(` with `vi.spyOn(`.
 * Must not match `vi.spyOn(` (already migrated) or `jasmine.spyOn(` (doesn't exist, but safe).
 * Uses a negative lookbehind to avoid double-prefixing.
 */
export const spyOnTransformer: Transformer = (
  source: string,
  _filePath: string,
): TransformResult => {
  // Replace spyOn( that is NOT preceded by a dot or word char (i.e. standalone call)
  // Negative lookbehind: not preceded by `.` or alphanumeric/underscore
  const result = source.replace(/(?<![.\w])spyOn\s*\(/g, 'vi.spyOn(');

  const changed = result !== source;

  return { source: result, changed, warnings: [] };
};
