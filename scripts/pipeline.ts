import { TransformResult, Transformer } from './types';
import { validate } from './validator';
import { importTransformer } from './transformers/import-transformer';
import { spyTransformer } from './transformers/spy-transformer';
import { chainTransformer } from './transformers/chain-transformer';
import { spyOnTransformer } from './transformers/spyon-transformer';
import { matcherTransformer } from './transformers/matcher-transformer';
import { clockTransformer } from './transformers/clock-transformer';
import { importMerger } from './transformers/import-merger';

export interface PipelineResult {
  source: string;
  changed: boolean;
  valid: boolean;
  warnings: string[];
  errors: string[];
}

const TRANSFORMERS: Transformer[] = [
  importTransformer,
  spyTransformer,
  chainTransformer,
  spyOnTransformer,
  matcherTransformer,
  clockTransformer,
  importMerger,
];

/**
 * Runs the full transformation pipeline on a single spec file source.
 * Returns the transformed source, change/validity flags, and any warnings/errors.
 * If validation fails, returns the original source with valid=false.
 */
export function runPipeline(source: string, filePath: string): PipelineResult {
  let current = source;
  let anyChanged = false;
  const allWarnings: string[] = [];

  for (const transformer of TRANSFORMERS) {
    const result: TransformResult = transformer(current, filePath);

    current = result.source;

    if (result.changed) anyChanged = true;
    if (result.warnings.length > 0) allWarnings.push(...result.warnings);
  }

  const validation = validate(current, filePath);

  if (!validation.valid) {
    // Discard transformation — return original
    return {
      source,
      changed: false,
      valid: false,
      warnings: allWarnings,
      errors: validation.errors,
    };
  }

  return {
    source: current,
    changed: anyChanged,
    valid: true,
    warnings: allWarnings,
    errors: [],
  };
}
