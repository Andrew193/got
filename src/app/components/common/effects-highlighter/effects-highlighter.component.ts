import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { HeroesService } from '../../../services/heroes/heroes.service';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'app-effects-highlighter',
  imports: [MatTooltip],
  templateUrl: './effects-highlighter.component.html',
  styleUrl: './effects-highlighter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EffectsHighlighterComponent {
  heroService = inject(HeroesService);

  text = input.required<string>();

  formatedText = computed(() => {
    function escapeRegex(s: string) {
      return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    const _text = this.text();
    const effects = this.heroService.getEffectsToHighlight();

    if (!_text || !effects || (Array.isArray(effects) && !effects.length))
      return [];

    const words = (Array.isArray(effects) ? effects : [effects])
      .filter(Boolean)
      .map(escapeRegex);

    if (!words.length) return [];

    const body = words.join('|');
    const part = `(?:${body})`;
    const boundary = `(?<![\\p{L}\\p{N}_])${part}(?![\\p{L}\\p{N}_])`;

    const flags = `gu`;
    const re = new RegExp(boundary, flags);

    const out: { text: string; hint: boolean; desc?: string }[] = [];
    let last = 0;

    for (const match of _text.matchAll(re)) {
      const idx = match.index ?? 0;
      if (idx > last) out.push({ text: _text.slice(last, idx), hint: false });
      out.push({
        text: match[0],
        hint: true,
        desc: this.heroService.getEffectsDescription(match[0]),
      });
      last = idx + match[0].length;
    }

    if (last < _text.length) out.push({ text: _text.slice(last), hint: false });

    return out.length ? out : [{ text: _text, hint: false }];
  });
}
