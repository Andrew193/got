import { Injectable } from '@angular/core';
import { ShortcutBaseHelperService } from './base/shortcut-base-helper.service';
import {
  KeyTypeHead,
  ShortcutConfig,
  ShortcutNotation,
  ShortcutNotationConfig,
} from '../../../../models/shortcut/shortcut.model';
import { Alphabet } from '../../../../models/common.model';

@Injectable({
  providedIn: 'root',
})
export class ShortcutHelperService extends ShortcutBaseHelperService {
  private get isMac(): boolean {
    return /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent);
  }

  resolveHeadAliases(
    head: KeyTypeHead,
    config: ShortcutConfig,
    notation?: ShortcutNotation,
  ): KeyTypeHead[] {
    if (notation?.headAliases?.length) return [head, ...notation.headAliases];

    const set = new Set<KeyTypeHead>([head]);

    if (config.aliasControlWithMeta) {
      const isControl = head.startsWith('Control');
      const isMeta = head.startsWith('Meta');

      const side = head.endsWith('Right') ? 'Right' : 'Left';

      if (this.isMac && isControl) {
        set.add(('Meta' + side) as KeyTypeHead);
      }

      if (!this.isMac && isMeta && config.mirrorMetaWithControlOnNonMac) {
        set.add(('Control' + side) as KeyTypeHead);
      }
    }

    return Array.from(set);
  }

  static makeKeyTypes<const T extends readonly Alphabet[]>(a: T) {
    return a.map(ch => `Key${ch}` as const) as {
      [P in keyof T]: `Key${T[P]}`;
    };
  }

  static tupleToEnum<const T extends readonly string[]>(a: T) {
    return Object.fromEntries(a.map(v => [v, v])) as { readonly [P in T[number]]: P };
  }

  createShortcutNotation(notationConfig: ShortcutNotationConfig[]): ShortcutNotation[] {
    return notationConfig.map(el => {
      return {
        cut: ShortcutHelperService.makeKeyTypes(el.cut),
        action: el.action,
        head: el.head,
      };
    });
  }
}
