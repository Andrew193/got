import { TransformResult, Transformer } from '../types';

const VITEST_GLOBALS = [
  'describe',
  'it',
  'test',
  'expect',
  'beforeEach',
  'afterEach',
  'beforeAll',
  'afterAll',
  'vi',
] as const;

type VitestSymbol = (typeof VITEST_GLOBALS)[number];

/**
 * Detects which Vitest symbols are actually used in the file body
 * (outside of the import statement itself).
 */
function detectUsedSymbols(source: string): VitestSymbol[] {
  // Strip the existing vitest import line(s) before scanning
  const withoutImport = source.replace(
    /^import\s*\{[^}]*\}\s*from\s*['"]vitest['"]\s*;?\s*\n?/gm,
    '',
  );

  return VITEST_GLOBALS.filter(sym => {
    // Match the symbol as a standalone identifier (word boundary)
    const re = new RegExp(`\\b${sym}\\b`);

    return re.test(withoutImport);
  });
}

/**
 * Merges the required Vitest symbols into a single import statement.
 * - If an `import { ... } from 'vitest'` already exists, merges missing symbols into it.
 * - If none exists, prepends a new import.
 * - Ensures exactly one vitest import in the output.
 * - Only imports symbols actually used in the file body.
 */
export const importMerger: Transformer = (source: string, _filePath: string): TransformResult => {
  const usedSymbols = detectUsedSymbols(source);

  if (usedSymbols.length === 0) {
    // Remove any stale vitest import if nothing is used
    const cleaned = source.replace(/^import\s*\{[^}]*\}\s*from\s*['"]vitest['"]\s*;?\s*\n?/gm, '');
    const changed = cleaned !== source;

    return { source: cleaned, changed, warnings: [] };
  }

  // Find existing vitest import
  const existingImportRe = /^import\s*\{([^}]*)\}\s*from\s*['"]vitest['"]\s*;?\s*\n?/m;
  const existingMatch = existingImportRe.exec(source);

  let result = source;

  if (existingMatch) {
    // Parse existing symbols
    const existingSymbols = existingMatch[1]
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    // Merge: union of existing + used, preserving order from VITEST_GLOBALS
    const merged = VITEST_GLOBALS.filter(
      sym => usedSymbols.includes(sym) || existingSymbols.includes(sym as string),
    );

    // Remove all existing vitest imports first
    result = result.replace(/^import\s*\{[^}]*\}\s*from\s*['"]vitest['"]\s*;?\s*\n?/gm, '');

    // Prepend the merged import
    const importLine = `import { ${merged.join(', ')} } from 'vitest';\n`;

    result = importLine + result;
  } else {
    // No existing import — prepend a new one
    const ordered = VITEST_GLOBALS.filter(sym => usedSymbols.includes(sym));
    const importLine = `import { ${ordered.join(', ')} } from 'vitest';\n`;

    result = importLine + result;
  }

  const changed = result !== source;

  return { source: result, changed, warnings: [] };
};
