import { inject, Injectable } from '@angular/core';
import { ShortcutHelperService } from './helpers/shortcut-helper.service';
import {
  distinctUntilChanged,
  filter,
  fromEvent,
  map,
  merge,
  Observable,
  scan,
  Subscription,
  takeUntil,
} from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  KeyTypeHead,
  ShortcutConfig,
  ShortcutController,
  ShortcutInitOptions,
  ShortcutKeyboardEvent,
  ShortcutKeyboardType,
  ShortcutNotation,
  ShortcutNotationConfig,
  ShortcutNotationTriggers,
  KeyType,
} from '../../../models/shortcut/shortcut.model';

@Injectable({
  providedIn: 'root',
})
export class ShortcutService {
  private sessions = new Set<Subscription>();

  private config: ShortcutConfig = {
    separator: '-',
    errorMessage: 'Can only accept ShortcutNotation or ShortcutNotationConfig arrays.',
    throwError: true,
    ignore: [],
    aliasControlWithMeta: true,
    mirrorMetaWithControlOnNonMac: true,
  };
  private initOptions: ShortcutInitOptions = {};

  private alwaysOk = Object.values(ShortcutNotationTriggers) as string[];
  private helper = inject(ShortcutHelperService);

  private _notations: ShortcutNotation[] = [];
  private set notations(notations: ShortcutNotation[]) {
    this._notations = notations;
  }

  private targetEventParser = (obs: Observable<KeyboardEvent>) => {
    return obs.pipe(
      filter(e => !e.repeat),
      filter(e => {
        const code = e.code as KeyType;
        const ignore = this.config.ignore;

        return ignore && ignore.length && !this.alwaysOk.includes(code)
          ? !ignore.includes(code)
          : true;
      }),
      map(
        (e): ShortcutKeyboardEvent => ({
          code: e.code as KeyType,
          type:
            e.type === ShortcutKeyboardType.down
              ? ShortcutKeyboardType.down
              : ShortcutKeyboardType.up,
        }),
      ),
    );
  };

  private keyDown$ = fromEvent<KeyboardEvent>(document, ShortcutKeyboardType.down).pipe(
    this.targetEventParser,
  );
  private keyUp$ = fromEvent<KeyboardEvent>(document, ShortcutKeyboardType.up).pipe(
    this.targetEventParser,
  );
  private source = merge(this.keyDown$, this.keyUp$);

  init(
    notationOrConfig: ShortcutNotation[] | ShortcutNotationConfig[],
    opts: ShortcutInitOptions = {},
  ): ShortcutController {
    this.initOptions = opts;

    if (!this.initOptions.keepAlive) this.stopAllSessions();

    if (this.helper.isShortcutNotationArray(notationOrConfig)) {
      this.notations = notationOrConfig;
    } else if (this.helper.isShortcutNotationConfigArray(notationOrConfig)) {
      this.notations = this.helper.createShortcutNotation(notationOrConfig);
    } else {
      if (this.config.throwError) {
        throw new Error(this.config.errorMessage);
      } else {
        console.error(this.config.errorMessage);
      }

      return {
        stop: () => {},
        active: () => false,
      };
    }

    const sub = this.processRules();

    this.sessions.add(sub);

    return {
      stop: () => {
        if (!sub.closed) sub.unsubscribe();
        this.sessions.delete(sub);
      },
      active: () => !sub.closed,
    };
  }

  private stopAllSessions() {
    for (const s of this.sessions) {
      if (!s.closed) s.unsubscribe();
    }

    this.sessions.clear();
  }

  private processRules() {
    let source$ = this.source.pipe(
      scan((prev, e) => {
        const curr = new Set(prev);

        if (e.type === ShortcutKeyboardType.up) {
          curr.delete(e.code);
        } else {
          curr.add(e.code);
        }

        return curr;
      }, new Set<KeyType>()),
      map(pressedSet => {
        const pressedList = Array.from(pressedSet);

        return {
          pressedList,
          pressedSet,
          comboString: pressedList.join(this.config.separator),
        };
      }),
      distinctUntilChanged((a, b) => a.comboString === b.comboString),
    );

    if (this.initOptions.cancel$) {
      source$ = source$.pipe(takeUntil(this.initOptions.cancel$));
    }

    if (this.initOptions.destroyRef) {
      source$ = source$.pipe(takeUntilDestroyed(this.initOptions.destroyRef));
    }

    return source$.subscribe(({ pressedList, pressedSet }) => {
      for (const notation of this._notations) {
        if (this.matchesNotation(notation, pressedList, pressedSet)) {
          notation.action();
        }
      }
    });
  }

  private matchesNotation(
    notation: ShortcutNotation,
    pressedList: KeyType[],
    pressedSet: Set<KeyType>,
  ) {
    const ordered = notation.ordered ?? true;

    const expectedSeq: (KeyType | KeyTypeHead[])[] = [
      this.helper.resolveHeadAliases(notation.head, this.config, notation),
      ...notation.cut,
    ];

    if (ordered) {
      if (pressedList.length < expectedSeq.length) return false;

      for (let i = 0; i < expectedSeq.length; i++) {
        const expected = expectedSeq[i];
        const actual = pressedList[i];

        if (Array.isArray(expected)) {
          if (!expected.includes(actual as KeyTypeHead)) return false;
        } else {
          if (actual !== expected) return false;
        }
      }

      return true;
    }

    const headOk = (expectedSeq[0] as KeyTypeHead[]).some(h => pressedSet.has(h));

    if (!headOk) return false;

    for (let i = 1; i < expectedSeq.length; i++) {
      const k = expectedSeq[i] as KeyType;

      if (!pressedSet.has(k)) return false;
    }

    return true;
  }

  patchConfig(config: ShortcutConfig) {
    this.config = { ...this.config, ...config };
  }
}
