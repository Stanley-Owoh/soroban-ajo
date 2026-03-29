import { Request, Response } from 'express';
import { searchService } from '../services/searchService';
import { logger } from '../utils/logger';

export const globalSearch = async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    const type = req.query.type as string | undefined;
    const limit = parseInt(req.query.limit as string) || 5;

    if (!query) {
      return res.status(400).json({ error: 'Search query (q) is required' });
    }

    const results = await searchService.globalSearch(query, type, limit);

    // Handle BigInt serialization for Prisma responses
    const safeResults = JSON.parse(
      JSON.stringify(results, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      )
    );

    return res.json({ data: safeResults });
  } catch (error) {
    logger.error('Search Controller Error', { error });
    return res.status(500).json({ error: 'Internal server error during search' });
  }
};
