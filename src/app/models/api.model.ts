import { PARAMS_TO_CHECK_REACTION } from '../constants';

type PutPostMetaBase<T> = {
  url: string;
  callback: (res: T) => void;
};

export type PutPostMetaOf<T, R extends boolean> = PutPostMetaBase<T> & { returnObs: R };

export type ParamToCheck = 'userId';

export type ParamCheckConfig = {
  reaction: PARAMS_TO_CHECK_REACTION;
  violation: any[];
};
