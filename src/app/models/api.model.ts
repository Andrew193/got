import { DATA_SOURCES, PARAMS_TO_CHECK_REACTION } from '../constants';

type PutPostMetaBase<T> = {
  url: string;
  callback: (res: T) => void;
};

export type PutPostMetaOf<T> = PutPostMetaBase<T>;

export type ParamToCheck = 'userId';

export type ParamCheckConfig = {
  reaction: PARAMS_TO_CHECK_REACTION;
  violation: any[];
};

export type Source = (typeof DATA_SOURCES)[keyof typeof DATA_SOURCES];
