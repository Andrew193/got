import { TransformResult, Transformer } from '../types';

/**
 * Splits a string by top-level commas (not inside nested parens/brackets/braces/strings).
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

    if (ch === '(' || ch === '[' || ch === '{' || ch === '<') {
      depth++;
      current += ch;
    } else if (ch === ')' || ch === ']' || ch === '}' || ch === '>') {
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
 * Attempts to parse a literal string array like `['m1', 'm2']`.
 * Returns null if the argument is not a literal array of strings.
 * Returns [] for empty arrays or arrays containing only empty strings (treated as no methods).
 */
function parseLiteralStringArray(arg: string): string[] | null {
  const trimmed = arg.trim();

  if (!trimmed.startsWith('[') || !trimmed.endsWith(']')) return null;

  const inner = trimmed.slice(1, -1).trim();

  if (inner.length === 0) return [];

  const items = splitTopLevelArgs(inner);
  const result: string[] = [];

  for (const item of items) {
    const t = item.trim();

    if (
      (t.startsWith("'") && t.endsWith("'")) ||
      (t.startsWith('"') && t.endsWith('"')) ||
      (t.startsWith('`') && t.endsWith('`'))
    ) {
      const name = t.slice(1, -1);

      // Skip empty string entries — they represent "no methods"
      if (name.length > 0) result.push(name);
    } else {
      return null; // dynamic value
    }
  }

  return result;
}

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
      if (ch === '\\') i++;
      else if (ch === inString) inString = null;
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
 * Finds the matching closing angle bracket for a generic type at `startIdx`.
 * `startIdx` points to the character AFTER the opening `<`.
 */
function findClosingAngle(str: string, startIdx: number): number {
  let depth = 1;
  let inString: string | null = null;

  for (let i = startIdx; i < str.length; i++) {
    const ch = str[i];

    if (inString) {
      if (ch === '\\') i++;
      else if (ch === inString) inString = null;
      continue;
    }

    if (ch === '"' || ch === "'" || ch === '`') {
      inString = ch;
      continue;
    }

    if (ch === '<') depth++;
    else if (ch === '>') {
      depth--;
      if (depth === 0) return i;
    }
  }

  return -1;
}

function replaceCreateSpy(source: string): string {
  const pattern = /jasmine\.createSpy\s*\(/g;
  let result = '';
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(source)) !== null) {
    const openParenIdx = match.index + match[0].length;
    const closeParenIdx = findClosingParen(source, openParenIdx);

    if (closeParenIdx === -1) {
      result += source.slice(lastIndex, openParenIdx);
      lastIndex = openParenIdx;
      continue;
    }

    const argsStr = source.slice(openParenIdx, closeParenIdx);
    const topArgs = splitTopLevelArgs(argsStr);
    // topArgs[0] = name, topArgs[1] = impl (optional)
    const impl = topArgs[1]?.trim();
    const replacement = impl && impl.length > 0 ? `vi.fn(${impl})` : 'vi.fn()';

    result += source.slice(lastIndex, match.index);
    result += replacement;
    lastIndex = closeParenIdx + 1;
  }

  result += source.slice(lastIndex);

  return result;
}

function replaceCreateSpyObj(source: string, warnings: string[]): string {
  const pattern = /jasmine\.createSpyObj\s*\(/g;
  let result = '';
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(source)) !== null) {
    const openParenIdx = match.index + match[0].length;
    const closeParenIdx = findClosingParen(source, openParenIdx);

    if (closeParenIdx === -1) {
      result += source.slice(lastIndex, openParenIdx);
      lastIndex = openParenIdx;
      continue;
    }

    const argsStr = source.slice(openParenIdx, closeParenIdx);
    const topArgs = splitTopLevelArgs(argsStr);
    const methodsArg = topArgs[1]?.trim() ?? '';
    const propsArg = topArgs[2]?.trim();
    const methods = parseLiteralStringArray(methodsArg);

    let replacement: string;

    if (methods === null) {
      warnings.push(
        `jasmine.createSpyObj with dynamic method names at offset ${match.index} — manual migration required`,
      );
      replacement = `jasmine.createSpyObj(${argsStr}) /* TODO: manual migration required */`;
    } else {
      const methodEntries = methods.map(m => `${m}: vi.fn()`).join(', ');

      if (propsArg !== undefined) {
        const propsInner = propsArg.trim().replace(/^\{/, '').replace(/\}$/, '').trim();
        const parts = [methodEntries, propsInner].filter(p => p.length > 0).join(', ');

        replacement = `{ ${parts} }`;
      } else {
        replacement = methods.length === 0 ? '{}' : `{ ${methodEntries} }`;
      }
    }

    result += source.slice(lastIndex, match.index);
    result += replacement;
    lastIndex = closeParenIdx + 1;
  }

  result += source.slice(lastIndex);

  return result;
}

/**
 * Replaces jasmine.SpyObj<T> with bracket-aware matching to handle nested generics.
 */
function replaceSpyObjType(source: string): string {
  const pattern = /jasmine\.SpyObj\s*</g;
  let result = '';
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(source)) !== null) {
    const openAngleIdx = match.index + match[0].length;
    const closeAngleIdx = findClosingAngle(source, openAngleIdx);

    if (closeAngleIdx === -1) {
      result += source.slice(lastIndex, openAngleIdx);
      lastIndex = openAngleIdx;
      continue;
    }

    const T = source.slice(openAngleIdx, closeAngleIdx);
    const replacement = `{ [K in keyof ${T}]: ReturnType<typeof vi.fn> }`;

    result += source.slice(lastIndex, match.index);
    result += replacement;
    lastIndex = closeAngleIdx + 1;
  }

  result += source.slice(lastIndex);

  return result;
}

export const spyTransformer: Transformer = (source: string, _filePath: string): TransformResult => {
  let result = source;
  const warnings: string[] = [];

  result = replaceCreateSpy(result);
  result = replaceCreateSpyObj(result, warnings);
  result = replaceSpyObjType(result);

  // jasmine.Spy<jasmine.Func> → ReturnType<typeof vi.fn>
  result = result.replace(/jasmine\.Spy<jasmine\.Func>/g, 'ReturnType<typeof vi.fn>');

  // jasmine.Spy (standalone — not followed by Obj or <)
  result = result.replace(/jasmine\.Spy(?!Obj|<)/g, 'ReturnType<typeof vi.fn>');

  const changed = result !== source;

  return { source: result, changed, warnings };
};
