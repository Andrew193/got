import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { HeroesFacadeService } from '../../../services/facades/heroes/heroes.service';
import { MatTooltip } from '@angular/material/tooltip';
import { EffectsValues } from '../../../constants';
import { NgClass, NgTemplateOutlet } from '@angular/common';

type Chunk = { text: string; hint: boolean; desc?: string };

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

@Component({
  selector: 'app-effects-highlighter',
  imports: [MatTooltip, NgTemplateOutlet, NgClass],
  templateUrl: './effects-highlighter.component.html',
  styleUrl: './effects-highlighter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EffectsHighlighterComponent {
  heroService = inject(HeroesFacadeService);
  wordsToHighlight = input<string[]>([]);
  renderBySentence = input<boolean>(false);
  containerClass = input<string>('');
  convertTextToLowercase = input<boolean>(true);

  text = input.required<string>();

  private makeHighlighter(re: RegExp, getDesc: (w: string) => string | undefined) {
    return (text: string): Chunk[] => {
      const out: Chunk[] = [];
      let last = 0;
      const textToCheck = this.convertTextToLowercase() ? text.toLowerCase() : text;

      for (const m of textToCheck.matchAll(re)) {
        const idx = m.index ?? 0;

        if (idx > last) out.push({ text: text.slice(last, idx), hint: false });

        let word = m[0];

        if (word) {
          word = text.slice(idx, idx + word.length);
        }

        out.push({ text: word, hint: true, desc: getDesc(word) });

        last = idx + word.length;
      }

      if (last < text.length) out.push({ text: text.slice(last), hint: false });

      return out.map((el, i) => {
        return i === out.length - 1 ? { ...el, text: `${el.text.trim()}.`.replace('..', '.') } : el;
      });
    };
  }

  private effectsWords = computed(() => {
    console.log([this.wordsToHighlight(), this.heroService.helper.getEffectsToHighlight()].flat());

    return [this.wordsToHighlight(), this.heroService.helper.getEffectsToHighlight()].flat();
  });

  private effectsRegex = computed(() => {
    const words = this.effectsWords();

    if (!words.length) return null;

    const body = words.map(escapeRegex).join('|');
    const boundary = `(?<![\\p{L}\\p{N}_])(?:${body})(?![\\p{L}\\p{N}_])`;

    return new RegExp(boundary, 'gu');
  });

  private effectDescCache = computed(() => {
    const cache = new Map<string, string | undefined>();

    for (const w of this.effectsWords()) {
      cache.set(w, this.heroService.helper.getEffectsDescription(w as EffectsValues));
    }

    return cache;
  });

  formatedText = computed(() => {
    const text = this.text();

    if (!text) return [];

    const re = this.effectsRegex();
    const bySentence = this.renderBySentence();

    if (!re) return bySentence ? [] : [[{ text, hint: false }]];

    const getDesc = (w: string) =>
      this.effectDescCache().get(w) ??
      this.heroService.helper.getEffectsDescription(w as EffectsValues);

    const highlight = this.makeHighlighter(re, getDesc);

    if (bySentence) {
      const parts = text.split('.');
      const res: Chunk[][] = [];

      for (const p of parts) {
        if (!p) continue;
        const row = highlight(p);

        if (row.length) res.push(row);
      }

      return res;
    } else {
      const row = highlight(text);

      return [row.length ? row : [{ text, hint: false }]];
    }
  });
}
