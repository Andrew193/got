import { HttpInterceptorFn } from '@angular/common/http';
import { PARAMS_TO_CHECK, PARAMS_TO_CHECK_REACTION } from '../../constants';
import { FailedParamRules } from '../../models/api.model';
import { catchError, EMPTY, switchMap, tap, throwError } from 'rxjs';

const REACTION_PRIORITY: PARAMS_TO_CHECK_REACTION[] = [
  PARAMS_TO_CHECK_REACTION.empty,
  PARAMS_TO_CHECK_REACTION.throwError,
  PARAMS_TO_CHECK_REACTION.replace,
  PARAMS_TO_CHECK_REACTION.sendFixRequest,
  PARAMS_TO_CHECK_REACTION.log,
];

const typedEntries = <T extends Record<string, any>>(obj: T) =>
  Object.entries(obj) as [keyof T, T[keyof T]][];

export const paramsCheckerInterceptor: HttpInterceptorFn = (req, next) => {
  // **** Collect Failed Rules ***
  const failedRules = typedEntries(PARAMS_TO_CHECK)
    .filter(([paramName, config]) => {
      const value = req.params.get(String(paramName));

      if (value == null) return false;

      const violations = Array.isArray(config.violation)
        ? config.violation
        : config.violation([String(paramName), config], req);

      return violations.includes(value);
    })
    .map(([paramName, config]) => ({
      paramName: String(paramName),
      config,
    })) satisfies FailedParamRules[];

  // All is clear
  if (!failedRules.length) {
    return next(req);
  }

  // Helpers
  const has = (reaction: PARAMS_TO_CHECK_REACTION) =>
    failedRules.some(r => r.config.reaction === reaction);
  const finalReaction = REACTION_PRIORITY.find(r => has(r)) ?? PARAMS_TO_CHECK_REACTION.log;

  // Plain log (request goes to the server)
  if (has(PARAMS_TO_CHECK_REACTION.log)) {
    console.warn('[paramsChecker] Params violation detected:', {
      url: req.url,
      failedRules,
      finalReaction,
    });
  }

  switch (finalReaction) {
    case PARAMS_TO_CHECK_REACTION.empty:
      return EMPTY;

    // ERROR to the console + ignore this request (abort)
    case PARAMS_TO_CHECK_REACTION.throwError:
      return throwError(
        () =>
          new Error(
            `[paramsChecker] Request blocked due to params violation: ${JSON.stringify({ url: req.url, failedRules })}`,
          ),
      );

    // Replace the wrong param. Send a new request with this new param.
    case PARAMS_TO_CHECK_REACTION.replace: {
      const rule = failedRules.find(r => r.config.reaction === PARAMS_TO_CHECK_REACTION.replace);

      console.warn(`[paramsChecker] Params violation detected (replace block):`, {
        url: req.url,
        rule,
      });

      if (!rule?.config.fixer) {
        console.warn(
          `[paramsChecker] Params violation detected (replace block): There is no fixer function. The Request to the ${req.url} has been sent to the server as is.`,
        );

        return next(req);
      }

      return rule.config.fixer(req).pipe(
        tap({
          next: () => {
            console.log(
              `[paramsChecker] Params violation detected (replace block): The Request to the ${req.url} has been fixed.`,
            );
          },
          error: () => {
            console.log(
              `[paramsChecker] Params violation detected (replace block): The Request to the ${req.url} has NOT been fixed.`,
            );
          },
        }),
        switchMap(newReq => next(newReq)),
        catchError(err => {
          console.error('[paramsChecker] Replace fixer failed', err);

          return EMPTY;
        }),
      );
    }

    // The same logic as above, but no intermediate messages.
    case PARAMS_TO_CHECK_REACTION.sendFixRequest: {
      const rule = failedRules.find(
        r => r.config.reaction === PARAMS_TO_CHECK_REACTION.sendFixRequest,
      );

      if (!rule?.config.fixer) return next(req);

      return rule.config.fixer(req).pipe(
        switchMap(newReq => next(newReq)),
        catchError(err => {
          console.error('[paramsChecker] Fix request failed (replace block)', err);

          return EMPTY;
        }),
      );
    }

    case PARAMS_TO_CHECK_REACTION.log:
    default:
      return next(req);
  }
};
