import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EMPTY, catchError, finalize, tap } from 'rxjs';
import { of } from 'rxjs';

import {
  ContentBlock,
  HeroBlock,
  NewsConfig,
  ParagraphBlock,
  TableBlock,
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

type BlockType = 'paragraph' | 'hero' | 'table';

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
  ],
  templateUrl: './news-constructor.component.html',
  styleUrl: './news-constructor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsConstructorComponent implements OnInit {
  private facade = inject(WatchtowerFacadeService);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);

  form!: FormGroup;
  blocks = signal<ContentBlock[]>([]);
  isPublishing = signal<boolean>(false);
  blockErrors = signal<Record<number, string>>({});

  blockTypeOptions = of<LabelValue[]>([
    { value: 'paragraph', label: 'Paragraph' },
    { value: 'hero', label: 'Hero' },
    { value: 'table', label: 'Table' },
  ]);

  isFormEmpty = computed(
    () => this.form?.get('title')?.value?.trim() === '' && this.blocks().length === 0,
  );

  ngOnInit(): void {
    this.form = this.fb.group({
      title: ['', Validators.required],
      blockType: [null],
    });
  }

  addBlock(): void {
    const type = this.form.get('blockType')?.value as BlockType;

    if (!type) {
      return;
    }

    let newBlock: ContentBlock;

    if (type === 'paragraph') {
      newBlock = { type: 'paragraph', text: '' } satisfies ParagraphBlock;
    } else if (type === 'hero') {
      newBlock = { type: 'hero', heroName: '' as HeroesNamesCodes } satisfies HeroBlock;
    } else {
      newBlock = { type: 'table', columns: [], rows: [] } satisfies TableBlock;
    }

    this.blocks.update(b => [...b, newBlock]);
    this.form.get('blockType')?.reset();
  }

  removeBlock(index: number): void {
    this.blocks.update(b => b.filter((_, i) => i !== index));
    this.blockErrors.update(errors => {
      const updated: Record<number, string> = {};

      Object.entries(errors).forEach(([key, val]) => {
        const k = Number(key);

        if (k < index) {
          updated[k] = val;
        } else if (k > index) {
          updated[k - 1] = val;
        }
      });

      return updated;
    });
  }

  updateBlock(index: number, block: ContentBlock): void {
    this.blocks.update(b => b.map((item, i) => (i === index ? block : item)));
    this.blockErrors.update(errors => {
      const updated = { ...errors };

      delete updated[index];

      return updated;
    });
  }

  buildPayload(): Omit<NewsConfig, 'id'> {
    return {
      headers: [{ title: this.form.get('title')?.value?.trim() || '', backgroundSrc: '' }],
      blocks: this.blocks(),
    };
  }

  isFormValid(): boolean {
    const errors: Record<number, string> = {};
    let valid = true;

    if (!this.form.get('title')?.value?.trim()) {
      this.form.get('title')?.setErrors({ required: true });
      valid = false;
    }

    this.blocks().forEach((block, i) => {
      if (block.type === 'paragraph' && block.text.trim() === '') {
        errors[i] = 'Paragraph text is required';
        valid = false;
      } else if (block.type === 'hero' && !block.heroName) {
        errors[i] = 'Hero is required';
        valid = false;
      } else if (block.type === 'table' && block.columns.length === 0) {
        errors[i] = 'Table must have at least one column';
        valid = false;
      }
    });

    this.blockErrors.set(errors);

    return valid;
  }

  publish(): void {
    if (!this.isFormValid()) {
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
    this.blocks.set([]);
    this.blockErrors.set({});
  }

  isParagraphBlock(block: ContentBlock): block is ParagraphBlock {
    return block.type === 'paragraph';
  }

  isHeroBlock(block: ContentBlock): block is HeroBlock {
    return block.type === 'hero';
  }

  isTableBlock(block: ContentBlock): block is TableBlock {
    return block.type === 'table';
  }
}
