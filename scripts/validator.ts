import * as ts from 'typescript';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates that the given TypeScript source string is syntactically valid
 * using the TypeScript compiler API.
 */
export function validate(source: string, filePath: string): ValidationResult {
  const sourceFile = ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true);

  const errors: string[] = [];

  // Collect parse diagnostics (syntax errors only)
  const diagnostics = (sourceFile as any).parseDiagnostics as ts.Diagnostic[] | undefined;

  if (diagnostics && diagnostics.length > 0) {
    for (const diag of diagnostics) {
      const msg = ts.flattenDiagnosticMessageText(diag.messageText, '\n');
      const pos =
        diag.start !== undefined ? sourceFile.getLineAndCharacterOfPosition(diag.start) : null;
      const location = pos ? ` (${pos.line + 1}:${pos.character + 1})` : '';

      errors.push(`${msg}${location}`);
    }
  }

  return { valid: errors.length === 0, errors };
}
