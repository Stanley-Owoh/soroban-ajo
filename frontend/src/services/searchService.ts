const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface SearchResult {
  groups: any[];
  members: any[];
  transactions: any[];
}

export const searchService = {
  async globalSearch(query: string, type?: string, limit: number = 5): Promise<SearchResult> {
    if (!query || query.length < 2) {
      return { groups: [], members: [], transactions: [] };
    }

    const params = new URLSearchParams({ q: query, limit: limit.toString() });
    if (type) params.append('type', type);

    try {
      const response = await fetch(`${API_URL}/search?${params.toString()}`);
      if (!response.ok) throw new Error('Search failed');
      const json = await response.json();
      return json.data;
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  }
};
