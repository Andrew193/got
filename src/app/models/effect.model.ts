import { EffectsValues } from '../constants';

export interface Effect {
  imgSrc: string;
  type: EffectsValues;
  duration: number;
  m: number;
  restore?: boolean;
  passive?: boolean;
  defDestroy?: number;
}

export type EffectForMult = Omit<Effect, 'type'> & {
  type: Extract<EffectsValues, 'Разлом брони' | 'Заржавелый Меч'>;
};
