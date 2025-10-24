import { Injectable } from '@angular/core';
import { Alphabet } from '../../../../../models/common.model';
import {
  ShortcutNotation,
  ShortcutNotationConfig,
} from '../../../../../models/shortcut/shortcut.model';

@Injectable({
  providedIn: 'root',
})
export abstract class ShortcutBaseHelperService {
  protected isAlphabet = (x: unknown): x is Alphabet => {
    return typeof x === 'string' && /^[A-Z]$/.test(x);
  };

  protected isKeyType = (x: unknown): x is KeyType => {
    return typeof x === 'string' && /^Key[A-Z]+$/.test(x);
  };

  protected isShortcutNotation = (x: any): x is ShortcutNotation => {
    return (
      x && typeof x.action === 'function' && Array.isArray(x.cut) && x.cut.every(this.isKeyType)
    );
  };

  protected isShortcutNotationConfig = (x: any): x is ShortcutNotationConfig => {
    return (
      x && typeof x.action === 'function' && Array.isArray(x.cut) && x.cut.every(this.isAlphabet)
    );
  };

  isShortcutNotationArray = (a: unknown): a is ShortcutNotation[] => {
    return Array.isArray(a) && a.every(this.isShortcutNotation);
  };

  isShortcutNotationConfigArray = (a: unknown): a is ShortcutNotationConfig[] => {
    return Array.isArray(a) && a.every(this.isShortcutNotationConfig);
  };
}
