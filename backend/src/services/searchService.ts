import { prisma } from '../config/database';

export class SearchService {
  async globalSearch(query: string, type?: string, limit: number = 5) {
    const results: any = {
      groups: [],
      members: [],
      transactions: [],
    };

    if (!query || query.length < 2) {
      return results;
    }

    try {
      const dbCalls = [];

      // Groups Search
      if (!type || type === 'groups') {
        dbCalls.push(
          prisma.group.findMany({
            where: {
              name: { contains: query, mode: 'insensitive' },
            },
            take: limit,
            select: { id: true, name: true, contributionAmount: true, isActive: true },
          }).then((res: any) => { results.groups = res; })
        );
      }

      // Members (Users) Search
      if (!type || type === 'members') {
        dbCalls.push(
          prisma.user.findMany({
            where: {
              walletAddress: { contains: query, mode: 'insensitive' },
            },
            take: limit,
            select: { id: true, walletAddress: true, createdAt: true },
          }).then((res: any) => { results.members = res; })
        );
      }

      // Transactions (Contributions) Search
      if (!type || type === 'transactions') {
        dbCalls.push(
          prisma.contribution.findMany({
            where: {
              txHash: { contains: query, mode: 'insensitive' },
            },
            take: limit,
            select: { id: true, txHash: true, amount: true, group: { select: { name: true } } },
          }).then((res: any) => { results.transactions = res; })
        );
      }

      await Promise.all(dbCalls);
      return results;
    } catch (error) {
      console.error('Search error:', error);
      throw new Error('Failed to perform global search');
    }
  }
}

export const searchService = new SearchService();
