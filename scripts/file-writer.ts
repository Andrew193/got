import * as fs from 'fs';

/**
 * Writes the transformed source to disk only if it differs from the current content.
 * Returns the actual status of the write operation.
 */
export function writeFile(
  filePath: string,
  transformedSource: string,
  originalSource: string,
  valid: boolean,
): 'migrated' | 'unchanged' | 'failed' {
  if (!valid) {
    // Validation failed — insert TODO comment at top and write original
    const marked = `// TODO: manual migration required — transformation produced invalid TypeScript\n${originalSource}`;

    fs.writeFileSync(filePath, marked, 'utf-8');

    return 'failed';
  }

  if (transformedSource === originalSource) {
    return 'unchanged';
  }

  fs.writeFileSync(filePath, transformedSource, 'utf-8');

  return 'migrated';
}
