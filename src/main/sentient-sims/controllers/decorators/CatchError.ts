import log from 'electron-log';
import { Request, Response, NextFunction } from 'express';
import { DbService } from 'main/sentient-sims/services/DbService';
import { CaughtError } from 'main/sentient-sims/models/CaughtError';
import { sendPopUpCaughtErrorNotification } from '../../util/notifyRenderer';

const defaultStatusCode = 200;

export type CatchErrorsParameters = {
  statusCode?: number;
  dbService?: DbService;
};

export function CatchErrors(catchErrorsParameters?: CatchErrorsParameters) {
  return function <T extends (this: any, req: Request, res: Response, next?: NextFunction) => unknown>(
    target: T,
    context: ClassMethodDecoratorContext,
  ) {
    return async function (this: ThisParameterType<T>, req: Request, res: Response, next?: NextFunction) {
      try {
        await target.call(this, req, res, next);
      } catch (err) {
        const statusCode = catchErrorsParameters?.statusCode ?? defaultStatusCode;
        log.error(`Error in ${String(context.name)}:`, err);
        const message = err instanceof Error ? err.message : String(err);
        try {
          res.status(statusCode).json({ error: message });
        } finally {
          // ask the user if they want to send logs
          // Send Logs + the error stuff
          const caughtError: CaughtError = {
            message,
            statusCode,
            body: req.body,
            url: req.url,
            method: req.method,
          };
          if (this?.dbService) {
            log.debug(`DbService was there`);
            const dbService = this.dbService as DbService;
            caughtError.databaseSession = dbService.copyErrorDatabase();
          }

          sendPopUpCaughtErrorNotification(caughtError);
        }
      }
    };
  };
}
