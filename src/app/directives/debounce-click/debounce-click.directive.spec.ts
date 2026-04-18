import { describe, it, expect } from 'vitest';
import { DebounceClickDirective } from './debounce-click.directive';

describe('DebounceClickDirective', () => {
  it('should create an instance', () => {
    const directive = new DebounceClickDirective();

    expect(directive).toBeTruthy();
  });
});
