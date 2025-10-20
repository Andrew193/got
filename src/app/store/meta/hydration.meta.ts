import { ActionReducer, INIT, UPDATE } from '@ngrx/store';
import { BasicLocalStorage } from '../../services/localStorage/local-storage.service';
import { RECOMPUTE } from '@ngrx/store-devtools';
import { StoreNames } from '../store.interfaces';

export function hydrationMeta(slices: StoreNames[] = []) {
  return (reducer: ActionReducer<any>) => (state: any, action: any) => {
    if (action.type === INIT || action.type === UPDATE) {
      try {
        const raw = localStorage.getItem(BasicLocalStorage.appPrefix);

        if (raw) {
          const saved = JSON.parse(raw);
          const patched = { ...(state as any) };

          for (const key of slices) {
            if (saved?.[key] !== undefined) patched[key] = saved[key];
          }

          return reducer(patched, action);
        }
      } catch {}
    }

    const next = reducer(state, action);

    try {
      const snapshot: any = {};

      for (const key of slices) snapshot[key] = (next as any)?.[key];

      const raw = localStorage.getItem(BasicLocalStorage.appPrefix);
      const prev = raw ? JSON.parse(raw) : {};

      if (action.type !== RECOMPUTE) {
        localStorage.setItem(BasicLocalStorage.appPrefix, JSON.stringify({ ...prev, ...snapshot }));
      }
    } catch {}

    return next;
  };
}
