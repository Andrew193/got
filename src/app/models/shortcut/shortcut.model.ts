import { Alphabet } from '../common.model';
import { DestroyRef } from '@angular/core';
import { Observable } from 'rxjs';

export type KeyTypeObj = { [P in Alphabet as P]: `Key${P}` };

export enum ShortcutNotationTriggers {
  ControlLeft = 'ControlLeft',
  ControlRight = 'ControlRight',
  ShiftLeft = 'ShiftLeft',
  ShiftRight = 'ShiftRight',
  AltLeft = 'AltLeft',
  AltRight = 'AltRight',
  MetaLeft = 'MetaLeft',
  MetaRight = 'MetaRight',
}

export type ShortcutKeyboardEvent = { code: KeyType; type: ShortcutKeyboardType };

export enum ShortcutKeyboardType {
  up = 'keyup',
  down = 'keydown',
}

export type KeyTypeHead =
  | 'ControlLeft'
  | 'ControlRight'
  | 'ShiftLeft'
  | 'ShiftRight'
  | 'AltLeft'
  | 'AltRight'
  | 'MetaLeft'
  | 'MetaRight';

export type KeyType = KeyTypeObj[Alphabet] | KeyTypeHead;

type ShortcutBase = {
  action: () => void;
  head: KeyTypeHead;
  ordered?: boolean;
  headAliases?: KeyTypeHead[];
};

export type ShortcutNotation = {
  cut: readonly KeyType[];
} & ShortcutBase;

export type ShortcutNotationConfig = {
  cut: Alphabet[];
} & ShortcutBase;

export type ShortcutConfig = Partial<{
  separator: string;
  errorMessage: string;
  throwError: boolean;
  ignore: readonly KeyType[];
  aliasControlWithMeta: boolean;
  mirrorMetaWithControlOnNonMac: boolean;
}>;

export type ShortcutInitOptions = {
  keepAlive?: boolean;
  cancel$?: Observable<unknown>;
  destroyRef?: DestroyRef;
};

export type ShortcutController = {
  stop(): void;
  readonly active: () => boolean;
};
