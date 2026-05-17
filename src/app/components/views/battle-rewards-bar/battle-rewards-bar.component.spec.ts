import { DecimalPipe } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import * as fc from 'fast-check';
import { beforeEach, describe, it } from 'vitest';

import { BattleRewardsBarComponent } from './battle-rewards-bar.component';

// Mirrors DecimalPipe default formatting used in the component template
function formatNumber(value: number): string {
  return new DecimalPipe('en-US').transform(value) ?? String(value);
}

describe('BattleRewardsBarComponent', () => {
  let fixture: ComponentFixture<BattleRewardsBarComponent>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BattleRewardsBarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BattleRewardsBarComponent);
    el = fixture.nativeElement as HTMLElement;
  });

  // ---------------------------------------------------------------------------
  // Arbitraries
  // ---------------------------------------------------------------------------

  const entryArb = fc.record({
    alias: fc.constantFrom('copper' as const, 'silver' as const, 'gold' as const),
    base: fc.integer({ min: 0, max: 1_000_000 }),
    win: fc.integer({ min: 0, max: 1_000_000 }),
    dmg: fc.integer({ min: 0, max: 1_000_000 }),
  });

  const nonEmptyConfigArb = fc.array(entryArb, { minLength: 1, maxLength: 10 });

  const singleEntryArb = fc.array(entryArb, { minLength: 1, maxLength: 1 });

  // ---------------------------------------------------------------------------
  // Property 1: Non-empty config renders correct wrapper structure and one row per entry
  // Validates: Requirements 1.5, 2.1, 2.2
  // ---------------------------------------------------------------------------

  it('Feature: battle-rewards-bar, Property 1: Non-empty config renders correct wrapper structure and one row per entry', () => {
    fc.assert(
      fc.property(nonEmptyConfigArb, config => {
        fixture.componentRef.setInput('rewardsConfig', config);
        fixture.detectChanges();

        const wrapper = el.querySelector('.d-flex.rewards-bar');

        expect(wrapper).toBeTruthy();
        expect(el.querySelectorAll('p.mb-0').length).toBe(config.length);
      }),
      { numRuns: 100 },
    );
  });

  // ---------------------------------------------------------------------------
  // Property 2: Each rendered row contains all required content for its entry
  // Validates: Requirements 2.4, 2.5
  // ---------------------------------------------------------------------------

  it('Feature: battle-rewards-bar, Property 2: Each rendered row contains all required content for its entry', () => {
    fc.assert(
      fc.property(singleEntryArb, ([entry]) => {
        fixture.componentRef.setInput('rewardsConfig', [entry]);
        fixture.detectChanges();

        const p = el.querySelector('p.mb-0');

        expect(p).toBeTruthy();

        const aliasSpan = p!.querySelector(`span.${entry.alias}`);

        expect(aliasSpan).toBeTruthy();
        expect(aliasSpan!.textContent).toContain(formatNumber(entry.base));
        expect(aliasSpan!.textContent).toContain(formatNumber(entry.win));

        const img = p!.querySelector(`img[alt="${entry.alias}"]`);

        expect(img).toBeTruthy();
        expect(img!.getAttribute('src')).toContain(`${entry.alias}.png`);

        const dmgSpan = p!.querySelector('span.highlight-effect');

        expect(dmgSpan).toBeTruthy();
        expect(dmgSpan!.textContent?.trim()).toBe(formatNumber(entry.dmg));
      }),
      { numRuns: 100 },
    );
  });
});
