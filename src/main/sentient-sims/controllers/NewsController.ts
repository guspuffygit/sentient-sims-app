import axios from 'axios';
import { Request, Response } from 'express';
import { ApiContext } from '../services/ApiContext';
import log from 'electron-log';

export class NewsController {
  private readonly ctx: ApiContext;

  constructor(ctx: ApiContext) {
    this.ctx = ctx;

    this.getNews = this.getNews.bind(this);
  }

  async getNews(req: Request, res: Response) {
    const response = await axios.get(`https://www.sentientsimulations.com/announcements.json?t=${Date.now()}`);

    log.info(`NEWS: ${JSON.stringify(response.data, null, 2)}`);

    res.json(response.data);
  }
}
