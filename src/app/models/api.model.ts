import { DATA_SOURCES, PARAMS_TO_CHECK_REACTION } from '../constants';
import { HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

type PutPostMetaBase<T> = {
  url: string;
  callback: (res: T) => void;
};

export type PutPostMetaOf<T> = PutPostMetaBase<T>;

// **************** Params checker ****************

export type ParamsToCheck = 'userId' | 'dsaContractId';

export type ParamViolation = string;

export type ParamCheckConfig = {
  reaction: PARAMS_TO_CHECK_REACTION;
  violation:
    | ParamViolation[]
    | ((rule: [string, ParamCheckConfig], req: HttpRequest<unknown>) => ParamViolation[]);
  fixer?: (req: HttpRequest<unknown>) => Observable<HttpRequest<unknown>>;
};

export type FailedParamRules = {
  paramName: string;
  config: ParamCheckConfig;
};

export type Source = (typeof DATA_SOURCES)[keyof typeof DATA_SOURCES];
