import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EMPTY, catchError, finalize, tap } from 'rxjs';
import { of } from 'rxjs';

import {
  BlockType,
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
import { FormErrorsContainerComponent } from '../../../components/form/form-errors-container/form-errors-container.component';

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

  form = new FormGroup({
    title: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    blockType: new FormControl<BlockType>(BlockType.paragraph, { nonNullable: true }),
  });
  blocks = signal<ContentBlock[]>([]);
  isPublishing = signal<boolean>(false);

  blockTypeOptions = of<LabelValue[]>([
    { value: BlockType.paragraph, label: 'Paragraph' },
    { value: BlockType.hero, label: 'Hero' },
    { value: BlockType.table, label: 'Table' },
  ]);

  isFormEmpty = computed(
    () => this.form?.get('title')?.value?.trim() === '' && this.blocks().length === 0,
  );

  addBlock() {
    const type = this.form.get('blockType')!.value;

    if (!type) {
      return;
    }

    let newBlock: ContentBlock;

    if (type === BlockType.paragraph) {
      newBlock = { type: BlockType.paragraph, text: '' } satisfies ParagraphBlock;
    } else if (type === BlockType.hero) {
      newBlock = { type: BlockType.hero, heroName: '' as HeroesNamesCodes } satisfies HeroBlock;
    } else {
      newBlock = { type: BlockType.table, columns: [], rows: [] } satisfies TableBlock;
    }

    this.blocks.update(b => [...b, newBlock]);
    this.form.get('blockType')?.reset();
  }

  removeBlock(index: number) {
    this.blocks.update(b => b.filter((_, i) => i !== index));
  }

  updateBlock(index: number, block: ContentBlock) {
    this.blocks.update(b => b.map((item, i) => (i === index ? block : item)));
  }

  buildPayload(): Omit<NewsConfig, 'id'> {
    return {
      headers: [{ title: this.form.get('title')?.value?.trim() || '', backgroundSrc: '' }],
      blocks: this.blocks(),
    };
  }

  isFormValid() {
    let valid = true;

    if (!this.form.get('title')?.value?.trim()) {
      this.form.get('title')?.setErrors({ required: true });
      valid = false;
    }

    this.blocks().forEach((block, i) => {
      if (block.type === BlockType.paragraph && block.text.trim() === '') {
        valid = false;
      } else if (block.type === BlockType.hero && !block.heroName) {
        valid = false;
      } else if (block.type === BlockType.table && block.columns.length === 0) {
        valid = false;
      }
    });

    return valid;
  }

  publish() {
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

  reset() {
    this.form.reset();
    this.blocks.set([]);
  }

  isParagraphBlock(block: ContentBlock): block is ParagraphBlock {
    return block.type === BlockType.paragraph;
  }

  isHeroBlock(block: ContentBlock): block is HeroBlock {
    return block.type === BlockType.hero;
  }

  isTableBlock(block: ContentBlock): block is TableBlock {
    return block.type === BlockType.table;
  }
}
