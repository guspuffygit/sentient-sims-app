import { Request, Response } from 'express';
import log from 'electron-log';
import { ApiContext } from '../services/ApiContext';
import { billingReturnKind } from '../billing/billingReturn';
import { notifyBillingReturn } from '../util/notifyRenderer';

export class BillingController {
  private ctx: ApiContext;

  constructor(ctx: ApiContext) {
    this.ctx = ctx;
  }

  handleReturn = (req: Request, res: Response) => {
    const kind = billingReturnKind(req.query);
    log.info(`Billing return from the browser: ${kind}`);
    res.sendFile(this.ctx.getAssetPath('billing-return.html'));
    notifyBillingReturn(kind);
  };
}
