import { HttpInterceptorFn } from '@angular/common/http';
import { PARAMS_TO_CHECK, PARAMS_TO_CHECK_REACTION } from '../../constants';
import { ParamCheckConfig } from '../../models/api.model';
import { EMPTY } from 'rxjs';

export const paramsCheckerInterceptor: HttpInterceptorFn = (req, next) => {
  const rules = Object.entries(PARAMS_TO_CHECK);
  const failedRules = rules
    .filter(rule => {
      const possibleRule = req.params.get(rule[0]);

      if (possibleRule) {
        return rule[1].violation.includes(possibleRule);
      }

      return false;
    })
    .map(el => el[1]) satisfies ParamCheckConfig[];

  const requestFailed = failedRules.some(el => el.reaction === PARAMS_TO_CHECK_REACTION.empty);

  if (requestFailed) {
    return EMPTY;
  }

  return next(req);
};
