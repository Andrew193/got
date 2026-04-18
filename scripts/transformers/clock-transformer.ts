import { TransformResult, Transformer } from '../types';

/**
 * Finds the matching closing paren for an opening paren at `startIdx`.
 * `startIdx` points to the character AFTER the opening paren.
 */
function findClosingParen(str: string, startIdx: number): number {
  let depth = 1;
  let inString: string | null = null;

  for (let i = startIdx; i < str.length; i++) {
    const ch = str[i];

    if (inString) {
      if (ch === '\\') {
        i++;
      } else if (ch === inString) {
        inString = null;
      }

      continue;
    }

    if (ch === '"' || ch === "'" || ch === '`') {
      inString = ch;
      continue;
    }

    if (ch === '(') depth++;
    else if (ch === ')') {
      depth--;
      if (depth === 0) return i;
    }
  }

  return -1;
}

/**
 * Replaces jasmine.clock().tick(ms) → vi.advanceTimersByTime(ms)
 * and jasmine.clock().mockDate(d) → vi.setSystemTime(d)
 * preserving the argument verbatim.
 */
function replaceClockWithArgs(source: string): string {
  // Match jasmine.clock().tick( or jasmine.clock().mockDate(
  const pattern = /jasmine\.clock\s*\(\s*\)\s*\.\s*(tick|mockDate)\s*\(/g;
  let result = '';
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(source)) !== null) {
    const method = match[1];
    const openIdx = match.index + match[0].length;
    const closeIdx = findClosingParen(source, openIdx);

    if (closeIdx === -1) {
      result += source.slice(lastIndex, openIdx);
      lastIndex = openIdx;
      continue;
    }

    const arg = source.slice(openIdx, closeIdx);
    const replacement =
      method === 'tick' ? `vi.advanceTimersByTime(${arg})` : `vi.setSystemTime(${arg})`;

    result += source.slice(lastIndex, match.index);
    result += replacement;
    lastIndex = closeIdx + 1;
  }

  result += source.slice(lastIndex);

  return result;
}

/**
 * Checks whether the source has a `jasmine.clock().install()` inside a beforeEach
 * and ensures `vi.useRealTimers()` is present in a corresponding afterEach.
 */
function ensureAfterEachCleanup(source: string): string {
  // If there's no install() call, nothing to do
  if (!/vi\.useFakeTimers\(\)/.test(source) && !/jasmine\.clock\(\)\.install\(\)/.test(source)) {
    return source;
  }

  // If afterEach with useRealTimers already exists, skip
  if (/afterEach\s*\(/.test(source) && /vi\.useRealTimers\(\)/.test(source)) {
    return source;
  }

  // If there's a beforeEach with useFakeTimers but no afterEach cleanup, add one after the beforeEach block
  // Simple heuristic: find the closing of the first beforeEach block and insert afterEach after it
  const beforeEachPattern = /beforeEach\s*\(\s*(?:async\s*)?\(\s*\)\s*=>\s*\{/;
  const match = beforeEachPattern.exec(source);

  if (!match) return source;

  // Find the closing brace of this beforeEach
  const openBraceIdx = source.indexOf('{', match.index + match[0].length - 1);

  if (openBraceIdx === -1) return source;

  let depth = 1;
  let inString: string | null = null;
  let closeIdx = -1;

  for (let i = openBraceIdx + 1; i < source.length; i++) {
    const ch = source[i];

    if (inString) {
      if (ch === '\\') i++;
      else if (ch === inString) inString = null;
      continue;
    }

    if (ch === '"' || ch === "'" || ch === '`') {
      inString = ch;
      continue;
    }

    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) {
        closeIdx = i;
        break;
      }
    }
  }

  if (closeIdx === -1) return source;

  // Find the closing paren of beforeEach(...) after the closing brace
  const afterBrace = source.slice(closeIdx + 1);
  const closingParenMatch = /^\s*\)/.exec(afterBrace);

  if (!closingParenMatch) return source;

  const insertAt = closeIdx + 1 + closingParenMatch[0].length;

  // Detect indentation from the beforeEach line
  const lineStart = source.lastIndexOf('\n', match.index) + 1;
  const indent = source.slice(lineStart, match.index).match(/^(\s*)/)?.[1] ?? '';

  const cleanup = `\n\n${indent}afterEach(() => {\n${indent}  vi.useRealTimers();\n${indent}});`;

  return source.slice(0, insertAt) + cleanup + source.slice(insertAt);
}

export const clockTransformer: Transformer = (
  source: string,
  _filePath: string,
): TransformResult => {
  let result = source;

  // jasmine.clock().install() → vi.useFakeTimers()
  result = result.replace(
    /jasmine\.clock\s*\(\s*\)\s*\.\s*install\s*\(\s*\)/g,
    'vi.useFakeTimers()',
  );

  // jasmine.clock().uninstall() → vi.useRealTimers()
  result = result.replace(
    /jasmine\.clock\s*\(\s*\)\s*\.\s*uninstall\s*\(\s*\)/g,
    'vi.useRealTimers()',
  );

  // jasmine.clock().tick(ms) → vi.advanceTimersByTime(ms)
  // jasmine.clock().mockDate(d) → vi.setSystemTime(d)
  result = replaceClockWithArgs(result);

  // Ensure afterEach cleanup when useFakeTimers is used in beforeEach
  result = ensureAfterEachCleanup(result);

  const changed = result !== source;

  return { source: result, changed, warnings: [] };
};
