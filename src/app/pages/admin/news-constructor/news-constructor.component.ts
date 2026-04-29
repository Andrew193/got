import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EMPTY, catchError, finalize, tap } from 'rxjs';
import { of } from 'rxjs';

import {
  BlockType,
  ContentBlock,
  NewsConfig,
  TableBlock,
  WatchtowerTableColumn,
} from '../../../models/watchtower/watchtower.model';
import { HeroesNamesCodes } from '../../../models/units-related/unit.model';
import { WatchtowerFacadeService } from '../../watchtower/services/watchtower-facade.service';
import { SNACKBAR_CONFIG } from '../../../constants';
import { ParagraphBlockComponent } from './blocks/paragraph-block/paragraph-block.component';
import { HeroBlockComponent } from './blocks/hero-block/hero-block.component';
import { TableBlockComponent } from './blocks/table-block/table-block.component';
import { TextInputComponent } from '../../../components/data-inputs/text-input/text-input.component';
import { BaseSelectComponent } from '../../../components/data-inputs/base-select/base-select.component';
import { LabelValue } from '../../../components/form/enhancedFormConstructor/form-constructor.models';
import { FormErrorsContainerComponent } from '../../../components/form/form-errors-container/form-errors-container.component';

type ParagraphBlockFormGroup = FormGroup<{
  type: FormControl<BlockType.paragraph>;
  text: FormControl<string>;
}>;

type HeroBlockFormGroup = FormGroup<{
  type: FormControl<BlockType.hero>;
  heroName: FormControl<HeroesNamesCodes | ''>;
}>;

type TableBlockFormGroup = FormGroup<{
  type: FormControl<BlockType.table>;
  columns: FormControl<WatchtowerTableColumn[]>;
  rows: FormControl<Record<string, unknown>[]>;
}>;

type BlockFormGroup = ParagraphBlockFormGroup | HeroBlockFormGroup | TableBlockFormGroup;

type NewsConstructorForm = FormGroup<{
  title: FormControl<string>;
  blockType: FormControl<BlockType | null>;
  blocks: FormArray<BlockFormGroup>;
}>;

function nonEmptyArrayValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;

  if (!Array.isArray(value) || value.length === 0) {
    return { required: true };
  }

  return null;
}

@Component({
  selector: 'app-news-constructor',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    ParagraphBlockComponent,
    HeroBlockComponent,
    TableBlockComponent,
    TextInputComponent,
    BaseSelectComponent,
    FormErrorsContainerComponent,
  ],
  templateUrl: './news-constructor.component.html',
  styleUrl: './news-constructor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsConstructorComponent {
  private facade = inject(WatchtowerFacadeService);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);

  private readonly blocksFormArray = new FormArray<BlockFormGroup>([]);

  form = new FormGroup({
    title: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    blockType: new FormControl<BlockType>(BlockType.paragraph),
    blocks: this.blocksFormArray,
  }) as NewsConstructorForm;

  isPublishing = signal<boolean>(false);

  blockTypeOptions = of<LabelValue[]>([
    { value: BlockType.paragraph, label: 'Paragraph' },
    { value: BlockType.hero, label: 'Hero' },
    { value: BlockType.table, label: 'Table' },
  ]);

  get blocksArray(): FormArray<BlockFormGroup> {
    return this.form.controls.blocks;
  }

  get isFormEmpty(): boolean {
    return this.form.controls.title.value.trim() === '' && this.blocksArray.length === 0;
  }

  addBlock(): void {
    const type = this.form.controls.blockType.value;

    if (!type) {
      return;
    }

    if (type === BlockType.paragraph) {
      this.blocksArray.push(this.createParagraphGroup());
    } else if (type === BlockType.hero) {
      this.blocksArray.push(this.createHeroGroup());
    } else {
      this.blocksArray.push(this.createTableGroup());
    }

    this.form.controls.blockType.reset();
  }

  removeBlock(index: number): void {
    this.blocksArray.removeAt(index);
  }

  getBlockType(blockGroup: BlockFormGroup): BlockType {
    return (blockGroup as FormGroup).get('type')?.value as BlockType;
  }

  updateTableBlock(index: number, block: TableBlock): void {
    this.blocksArray.at(index).patchValue({ columns: block.columns, rows: block.rows });
  }

  buildPayload(): Omit<NewsConfig, 'id'> {
    return {
      headers: [{ title: this.form.controls.title.value.trim(), backgroundSrc: '' }],
      blocks: this.form.controls.blocks.value as ContentBlock[],
    };
  }

  publish(): void {
    if (!this.form.valid) {
      this.form.markAllAsTouched();

      return;
    }

    this.isPublishing.set(true);

    const payload = this.buildPayload();

    this.facade
      .createNews(payload)
      .pipe(
        tap(() => {
          this.snackBar.open('News published successfully', 'Close', SNACKBAR_CONFIG);
          this.reset();
        }),
        catchError(() => {
          this.snackBar.open('Failed to publish news. Please try again.', 'Close', SNACKBAR_CONFIG);

          return EMPTY;
        }),
        finalize(() => this.isPublishing.set(false)),
      )
      .subscribe();
  }

  reset(): void {
    this.form.reset();
    this.blocksArray.clear();
  }

  private createParagraphGroup(): ParagraphBlockFormGroup {
    return this.fb.group({
      type: [BlockType.paragraph as const],
      text: ['', [Validators.required, Validators.pattern(/\S+/)]],
    }) as ParagraphBlockFormGroup;
  }

  private createHeroGroup(): HeroBlockFormGroup {
    return this.fb.group({
      type: [BlockType.hero as const],
      heroName: ['' as HeroesNamesCodes, Validators.required],
    }) as HeroBlockFormGroup;
  }

  private createTableGroup(): TableBlockFormGroup {
    return this.fb.group({
      type: [BlockType.table as const],
      columns: [[] as WatchtowerTableColumn[], nonEmptyArrayValidator],
      rows: [[] as Record<string, unknown>[]],
    }) as TableBlockFormGroup;
  }
}
