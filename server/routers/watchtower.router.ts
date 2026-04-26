import { Router, type Request, type Response } from 'express';

import type { NewsItem } from '../types';
import { readNews, writeNews } from '../storage/watchtower-storage';

const router = Router();

// GET /api/watchtower/news
router.get('/news', (_req: Request, res: Response) => {
  try {
    const store = readNews();

    res.json(store.news);
  } catch {
    res.status(500).json({ error: 'Storage error' });
  }
});

// POST /api/watchtower/news
router.post('/news', (req: Request, res: Response) => {
  try {
    const store = readNews();
    const newsItem: NewsItem = { ...req.body, id: `news-${Date.now()}` };

    store.news.push(newsItem);
    writeNews(store);

    res.status(201).json(newsItem);
  } catch {
    res.status(500).json({ error: 'Storage error' });
  }
});

export default router;
