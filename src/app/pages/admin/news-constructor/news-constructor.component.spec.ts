import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { FormArray, FormGroup } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import * as fc from 'fast-check';

import { NewsConstructorComponent } from './news-constructor.component';
import { WatchtowerFacadeService } from '../../watchtower/services/watchtower-facade.service';
import { BlockType, ContentBlock } from '../../../models/watchtower/watchtower.model';
import { MatSnackBar } from '@angular/material/snack-bar';

const mockFacade = {
  createNews: vi.fn(() => of({})),
};

const mockSnackBar = {
  open: vi.fn(),
};

describe('NewsConstructorComponent', () => {
  let component: NewsConstructorComponent;

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [NewsConstructorComponent],
      providers: [
        provideHttpClient(),
        { provide: WatchtowerFacadeService, useValue: mockFacade },
        { provide: MatSnackBar, useValue: mockSnackBar },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(NewsConstructorComponent);

    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // --- 9.1 Инициализация ---

  describe('initialization', () => {
    it('should have form with title, blockType and blocks fields', () => {
      expect(component.form.controls.title).toBeDefined();
      expect(component.form.controls.blockType).toBeDefined();
      expect(component.form.controls.blocks).toBeDefined();
    });

    it('should initialize with empty blocks FormArray', () => {
      expect(component.blocksArray).toBeInstanceOf(FormArray);
      expect(component.blocksArray.length).toBe(0);
    });

    it('should initialize with empty title', () => {
      expect(component.form.controls.title.value).toBe('');
    });
  });

  // --- 9.2 addBlock() ---

  describe('addBlock()', () => {
    it('should add ParagraphBlockFormGroup when blockType is paragraph', () => {
      component.form.controls.blockType.setValue(BlockType.paragraph);
      component.addBlock();

      expect(component.blocksArray.length).toBe(1);
      expect(component.blocksArray.at(0).get('type')?.value).toBe(BlockType.paragraph);
      expect(component.blocksArray.at(0).get('text')).toBeDefined();
    });

    it('should add HeroBlockFormGroup when blockType is hero', () => {
      component.form.controls.blockType.setValue(BlockType.hero);
      component.addBlock();

      expect(component.blocksArray.length).toBe(1);
      expect(component.blocksArray.at(0).get('type')?.value).toBe(BlockType.hero);
      expect(component.blocksArray.at(0).get('heroName')).toBeDefined();
    });

    it('should add TableBlockFormGroup when blockType is table', () => {
      component.form.controls.blockType.setValue(BlockType.table);
      component.addBlock();

      expect(component.blocksArray.length).toBe(1);
      expect(component.blocksArray.at(0).get('type')?.value).toBe(BlockType.table);
      expect(component.blocksArray.at(0).get('columns')).toBeDefined();
      expect(component.blocksArray.at(0).get('rows')).toBeDefined();
    });

    it('should reset blockType after adding a block', () => {
      component.form.controls.blockType.setValue(BlockType.paragraph);
      component.addBlock();

      expect(component.form.controls.blockType.value).toBeNull();
    });

    it('should not add block when blockType is null', () => {
      component.form.controls.blockType.setValue(null as unknown as BlockType);
      component.addBlock();

      expect(component.blocksArray.length).toBe(0);
    });

    it('should create ParagraphBlockFormGroup with invalid text initially', () => {
      component.form.controls.blockType.setValue(BlockType.paragraph);
      component.addBlock();

      expect(component.blocksArray.at(0).invalid).toBe(true);
    });

    it('should create HeroBlockFormGroup with invalid heroName initially', () => {
      component.form.controls.blockType.setValue(BlockType.hero);
      component.addBlock();

      expect(component.blocksArray.at(0).invalid).toBe(true);
    });

    it('should create TableBlockFormGroup with invalid columns initially', () => {
      component.form.controls.blockType.setValue(BlockType.table);
      component.addBlock();

      expect(component.blocksArray.at(0).invalid).toBe(true);
    });
  });

  // --- 9.3 removeBlock() ---

  describe('removeBlock()', () => {
    beforeEach(() => {
      component.form.controls.blockType.setValue(BlockType.paragraph);
      component.addBlock();
      component.form.controls.blockType.setValue(BlockType.hero);
      component.addBlock();
    });

    it('should decrease FormArray length by 1', () => {
      component.removeBlock(0);

      expect(component.blocksArray.length).toBe(1);
    });

    it('should remove the correct block by index', () => {
      component.removeBlock(0);

      expect(component.blocksArray.at(0).get('type')?.value).toBe(BlockType.hero);
    });

    it('should result in empty FormArray after removing all blocks', () => {
      component.removeBlock(1);
      component.removeBlock(0);

      expect(component.blocksArray.length).toBe(0);
    });
  });

  // --- 9.4 updateTableBlock() ---

  describe('updateTableBlock()', () => {
    beforeEach(() => {
      component.form.controls.blockType.setValue(BlockType.table);
      component.addBlock();
    });

    it('should update columns and rows in TableBlockFormGroup', () => {
      const columns = [{ alias: 'name', label: 'Name' }];
      const rows = [{ name: 'Jon Snow' }];

      component.updateTableBlock(0, { type: BlockType.table, columns, rows });

      expect(component.blocksArray.at(0).get('columns')?.value).toEqual(columns);
      expect(component.blocksArray.at(0).get('rows')?.value).toEqual(rows);
    });
  });

  // --- 9.5 buildPayload() ---

  describe('buildPayload()', () => {
    it('should return correct payload with title and empty blocks', () => {
      component.form.controls.title.setValue('Test News');

      const payload = component.buildPayload();

      expect(payload.headers[0].title).toBe('Test News');
      expect(payload.blocks).toEqual([]);
    });

    it('should trim whitespace from title', () => {
      component.form.controls.title.setValue('  Trimmed Title  ');

      const payload = component.buildPayload();

      expect(payload.headers[0].title).toBe('Trimmed Title');
    });

    it('should include blocks from FormArray in payload', () => {
      component.form.controls.title.setValue('Test');
      component.form.controls.blockType.setValue(BlockType.paragraph);
      component.addBlock();
      component.blocksArray.at(0).get('text')?.setValue('Hello');

      const payload = component.buildPayload();

      expect(payload.blocks.length).toBe(1);
      expect((payload.blocks[0] as { text: string }).text).toBe('Hello');
    });
  });

  // --- 9.6 reset() ---

  describe('reset()', () => {
    beforeEach(() => {
      component.form.controls.title.setValue('Some Title');
      component.form.controls.blockType.setValue(BlockType.paragraph);
      component.addBlock();
    });

    it('should clear the blocks FormArray', () => {
      component.reset();

      expect(component.blocksArray.length).toBe(0);
    });

    it('should reset title to empty', () => {
      component.reset();

      expect(component.form.controls.title.value).toBe('');
    });

    it('should make isFormEmpty true after reset', () => {
      component.reset();

      expect(component.isFormEmpty).toBe(true);
    });
  });

  // --- 9.7 publish() ---

  describe('publish()', () => {
    it('should not call facade.createNews when form is invalid', () => {
      // form is invalid: title is empty, no blocks
      component.publish();

      expect(mockFacade.createNews).not.toHaveBeenCalled();
    });

    it('should call facade.createNews when form is valid', () => {
      component.form.controls.title.setValue('Valid Title');
      component.form.controls.blockType.setValue(BlockType.paragraph);
      component.addBlock();
      component.blocksArray.at(0).get('text')?.setValue('Some text');

      component.publish();

      expect(mockFacade.createNews).toHaveBeenCalledOnce();
    });
  });

  // --- 9.8 Validation ---

  describe('validation', () => {
    it('should make HeroBlockFormGroup invalid when heroName is empty', () => {
      component.form.controls.blockType.setValue(BlockType.hero);
      component.addBlock();

      const heroGroup = component.blocksArray.at(0) as FormGroup;

      heroGroup.get('heroName')?.setValue('');

      expect(heroGroup.invalid).toBe(true);
    });

    it('should make TableBlockFormGroup invalid when columns is empty', () => {
      component.form.controls.blockType.setValue(BlockType.table);
      component.addBlock();

      const tableGroup = component.blocksArray.at(0) as FormGroup;

      tableGroup.get('columns')?.setValue([]);

      expect(tableGroup.invalid).toBe(true);
    });

    it('should make form invalid when any block is invalid', () => {
      component.form.controls.title.setValue('Valid Title');
      component.form.controls.blockType.setValue(BlockType.paragraph);
      component.addBlock();
      // text is empty — block is invalid

      expect(component.form.valid).toBe(false);
    });

    it('should make form valid when all fields are filled correctly', () => {
      component.form.controls.title.setValue('Valid Title');
      component.form.controls.blockType.setValue(BlockType.paragraph);
      component.addBlock();
      component.blocksArray.at(0).get('text')?.setValue('Some text');

      expect(component.form.valid).toBe(true);
    });
  });

  // --- 10. Property-based tests ---

  describe('property-based tests', () => {
    // Feature: news-constructor-form-array, Property 1: whitespace title + empty blocks => isFormEmpty true
    it('should return isFormEmpty=true for any whitespace-only title with empty blocks', () => {
      fc.assert(
        fc.property(fc.stringMatching(/^\s*$/), whitespaceTitle => {
          component.form.controls.title.setValue(whitespaceTitle);
          component.blocksArray.clear();

          expect(component.isFormEmpty).toBe(true);
        }),
        { numRuns: 100 },
      );
    });

    // Feature: news-constructor-form-array, Property 2: non-empty title => isFormEmpty false
    it('should return isFormEmpty=false for any title with non-whitespace characters', () => {
      fc.assert(
        fc.property(fc.stringMatching(/\S+/), nonEmptyTitle => {
          component.blocksArray.clear();
          component.form.controls.title.setValue(nonEmptyTitle);

          expect(component.isFormEmpty).toBe(false);
        }),
        { numRuns: 100 },
      );
    });

    // Feature: news-constructor-form-array, Property 3: any invalid block => form.valid false
    it('should make form invalid when any block is invalid', () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 5 }), count => {
          component.blocksArray.clear();
          component.form.controls.title.setValue('Valid Title');

          for (let i = 0; i < count; i++) {
            component.form.controls.blockType.setValue(BlockType.paragraph);
            component.addBlock();
            // text remains empty — block is invalid
          }

          expect(component.form.valid).toBe(false);
        }),
        { numRuns: 100 },
      );
    });

    // Feature: news-constructor-form-array, Property 4: whitespace text => ParagraphBlockFormGroup invalid
    it('should make ParagraphBlockFormGroup invalid for any whitespace-only text', () => {
      fc.assert(
        fc.property(fc.stringMatching(/^\s*$/), whitespaceText => {
          component.blocksArray.clear();
          component.form.controls.blockType.setValue(BlockType.paragraph);
          component.addBlock();
          component.blocksArray.at(0).get('text')?.setValue(whitespaceText);

          expect(component.blocksArray.at(0).invalid).toBe(true);
        }),
        { numRuns: 100 },
      );
    });

    // Feature: news-constructor-form-array, Property 5: buildPayload reflects FormArray state
    it('should return blocks matching FormArray value in buildPayload', () => {
      fc.assert(
        fc.property(
          fc.array(fc.constantFrom(BlockType.paragraph, BlockType.hero), {
            minLength: 1,
            maxLength: 5,
          }),
          types => {
            component.blocksArray.clear();
            component.form.controls.title.setValue('Test');

            types.forEach(type => {
              component.form.controls.blockType.setValue(type);
              component.addBlock();
            });

            const payload = component.buildPayload();

            expect(payload.blocks).toEqual(component.form.controls.blocks.value as ContentBlock[]);
          },
        ),
        { numRuns: 100 },
      );
    });

    // Feature: news-constructor-form-array, Property 6: updateTableBlock syncs FormGroup with TableBlock data
    it('should sync TableBlockFormGroup with any emitted blockChange data', () => {
      fc.assert(
        fc.property(
          fc.array(fc.record({ alias: fc.string(), label: fc.string() })),
          fc.array(fc.dictionary(fc.string(), fc.anything())),
          (columns, rows) => {
            component.blocksArray.clear();
            component.form.controls.blockType.setValue(BlockType.table);
            component.addBlock();
            component.updateTableBlock(0, { type: BlockType.table, columns, rows });

            const groupValue = component.blocksArray.at(0).value as {
              columns: typeof columns;
              rows: typeof rows;
            };

            expect(groupValue.columns).toEqual(columns);
            expect(groupValue.rows).toEqual(rows);
          },
        ),
        { numRuns: 100 },
      );
    });
  });
});
