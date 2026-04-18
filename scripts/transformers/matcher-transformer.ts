import { TransformResult, Transformer } from '../types';

/**
 * Replaces Jasmine asymmetric matchers with Vitest equivalents:
 *   jasmine.any(T)              → expect.any(T)
 *   jasmine.objectContaining(o) → expect.objectContaining(o)
 *   jasmine.arrayContaining(a)  → expect.arrayContaining(a)
 *
 * All arguments are preserved verbatim.
 */
export const matcherTransformer: Transformer = (
  source: string,
  _filePath: string,
): TransformResult => {
  let result = source;

  result = result.replace(/jasmine\.any\s*\(/g, 'expect.any(');
  result = result.replace(/jasmine\.objectContaining\s*\(/g, 'expect.objectContaining(');
  result = result.replace(/jasmine\.arrayContaining\s*\(/g, 'expect.arrayContaining(');

  const changed = result !== source;

  return { source: result, changed, warnings: [] };
};
