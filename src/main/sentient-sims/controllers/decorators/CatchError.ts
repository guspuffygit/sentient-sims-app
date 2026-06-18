import log from 'electron-log';
import { Request, Response, NextFunction } from 'express';
import { CaughtError } from 'main/sentient-sims/models/CaughtError';
import { sendPopUpCaughtErrorNotification } from '../../util/notifyRenderer';

const defaultStatusCode = 200;

export type CatchErrorsParameters = {
  statusCode?: number;
};

type Handler = (req: Request, res: Response, next?: NextFunction) => unknown;

export function CatchErrors(catchErrorsParameters?: CatchErrorsParameters) {
  return function <T extends Handler>(_value: undefined, context: ClassFieldDecoratorContext<unknown, T>) {
    return function (initialValue: T): T {
      const fieldName = String(context.name);
      const wrapped = async function (req: Request, res: Response, next?: NextFunction) {
        try {
          await initialValue(req, res, next);
        } catch (err) {
          const statusCode = catchErrorsParameters?.statusCode ?? defaultStatusCode;
          log.error(`Error in ${fieldName}:`, err);
          const message = err instanceof Error ? err.message : String(err);
          try {
            res.status(statusCode).json({ error: message });
          } finally {
            const caughtError: CaughtError = {
              message,
              statusCode,
              body: req.body,
              url: req.url,
              method: req.method,
            };
            sendPopUpCaughtErrorNotification(caughtError);
          }
        }
      };
      return wrapped as T;
    };
  };
}
