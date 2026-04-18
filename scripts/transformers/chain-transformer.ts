import { TransformResult, Transformer } from '../types';

/**
 * Finds the matching closing paren for an opening paren at `startIdx` in `str`.
 * `startIdx` should point to the character AFTER the opening paren.
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

    if (ch === '(') {
      depth++;
    } else if (ch === ')') {
      depth--;
      if (depth === 0) return i;
    }
  }

  return -1;
}

/**
 * Splits top-level comma-separated args (respects nesting and strings).
 */
function splitTopLevelArgs(str: string): string[] {
  const args: string[] = [];
  let depth = 0;
  let inString: string | null = null;
  let current = '';

  for (let i = 0; i < str.length; i++) {
    const ch = str[i];

    if (inString) {
      current += ch;
      if (ch === '\\') {
        i++;
        if (i < str.length) current += str[i];
      } else if (ch === inString) {
        inString = null;
      }

      continue;
    }

    if (ch === '"' || ch === "'" || ch === '`') {
      inString = ch;
      current += ch;
      continue;
    }

    if (ch === '(' || ch === '[' || ch === '{') {
      depth++;
      current += ch;
    } else if (ch === ')' || ch === ']' || ch === '}') {
      depth--;
      current += ch;
    } else if (ch === ',' && depth === 0) {
      args.push(current);
      current = '';
    } else {
      current += ch;
    }
  }

  if (current.trim().length > 0) args.push(current);

  return args;
}

/**
 * Replaces .and.returnValues(v1, v2, ...) with chained .mockReturnValueOnce calls.
 */
function replaceReturnValues(source: string): string {
  const pattern = /\.and\.returnValues\s*\(/g;
  let result = '';
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(source)) !== null) {
    const openIdx = match.index + match[0].length;
    const closeIdx = findClosingParen(source, openIdx);

    if (closeIdx === -1) {
      result += source.slice(lastIndex, openIdx);
      lastIndex = openIdx;
      continue;
    }

    const argsStr = source.slice(openIdx, closeIdx);
    const args = splitTopLevelArgs(argsStr);
    const chain = args.map(a => `.mockReturnValueOnce(${a.trim()})`).join('');

    result += source.slice(lastIndex, match.index);
    result += chain;
    lastIndex = closeIdx + 1;
  }

  result += source.slice(lastIndex);

  return result;
}

export const chainTransformer: Transformer = (
  source: string,
  _filePath: string,
): TransformResult => {
  let result = source;

  // Order matters: returnValues before returnValue to avoid partial match
  result = replaceReturnValues(result);

  // .and.returnValue(val) → .mockReturnValue(val)
  result = result.replace(/\.and\.returnValue\s*\(/g, '.mockReturnValue(');

  // .and.callFake(fn) → .mockImplementation(fn)
  result = result.replace(/\.and\.callFake\s*\(/g, '.mockImplementation(');

  // .and.callThrough() → remove the chain entirely
  result = result.replace(/\.and\.callThrough\s*\(\s*\)/g, '');

  const changed = result !== source;

  return { source: result, changed, warnings: [] };
};
