// 智能搜索和推荐系统
interface SearchResult<T> {
  item: T;
  score: number;
  highlights: string[];
  matchedFields: string[];
}

interface SearchIndex<T> {
  items: T[];
  fields: (keyof T)[];
  weights: Partial<Record<keyof T, number>>;
  stopWords: Set<string>;
}

export class SmartSearch<T> {
  private index: SearchIndex<T>;
  private searchHistory: string[] = [];
  private maxHistorySize = 50;

  constructor(
    items: T[],
    fields: (keyof T)[],
    weights: Partial<Record<keyof T, number>> = {},
    stopWords: string[] = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']
  ) {
    this.index = {
      items,
      fields,
      weights,
      stopWords: new Set(stopWords.map(w => w.toLowerCase())),
    };
  }

  search(query: string, limit = 10): SearchResult<T>[] {
    if (!query.trim()) return [];

    // 记录搜索历史
    this.addToHistory(query);

    const normalizedQuery = this.normalizeText(query);
    const queryTerms = this.tokenize(normalizedQuery);

    const results: SearchResult<T>[] = [];

    for (const item of this.index.items) {
      const result = this.scoreItem(item, queryTerms);
      if (result.score > 0) {
        results.push(result);
      }
    }

    // 按分数排序并限制结果数量
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  private scoreItem(item: T, queryTerms: string[]): SearchResult<T> {
    let totalScore = 0;
    const highlights: string[] = [];
    const matchedFields: string[] = [];

    for (const field of this.index.fields) {
      const fieldValue = String(item[field] || '');
      const normalizedValue = this.normalizeText(fieldValue);
      const fieldTerms = this.tokenize(normalizedValue);

      let fieldScore = 0;
      let fieldHighlights: string[] = [];

      for (const queryTerm of queryTerms) {
        for (const fieldTerm of fieldTerms) {
          if (fieldTerm.includes(queryTerm)) {
            const termScore = this.calculateTermScore(queryTerm, fieldTerm);
            fieldScore += termScore;
            fieldHighlights.push(queryTerm);
          }
        }
      }

      if (fieldScore > 0) {
        const weight = this.index.weights[field] || 1;
        totalScore += fieldScore * weight;
        highlights.push(...fieldHighlights);
        matchedFields.push(String(field));
      }
    }

    return {
      item,
      score: totalScore,
      highlights: [...new Set(highlights)],
      matchedFields: [...new Set(matchedFields)],
    };
  }

  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // 移除重音符号
      .replace(/[^\w\s]/g, ' ') // 移除标点符号
      .replace(/\s+/g, ' ') // 合并多个空格
      .trim();
  }

  private tokenize(text: string): string[] {
    return text
      .split(' ')
      .filter(term => term.length > 0 && !this.index.stopWords.has(term));
  }

  private calculateTermScore(queryTerm: string, fieldTerm: string): number {
    if (queryTerm === fieldTerm) return 1.0; // 完全匹配
    if (fieldTerm.startsWith(queryTerm)) return 0.8; // 前缀匹配
    if (fieldTerm.includes(queryTerm)) return 0.6; // 包含匹配
    return 0.3; // 部分匹配
  }

  private addToHistory(query: string): void {
    const trimmedQuery = query.trim();
    if (trimmedQuery && !this.searchHistory.includes(trimmedQuery)) {
      this.searchHistory.unshift(trimmedQuery);
      if (this.searchHistory.length > this.maxHistorySize) {
        this.searchHistory = this.searchHistory.slice(0, this.maxHistorySize);
      }
    }
  }

  getSearchHistory(): string[] {
    return [...this.searchHistory];
  }

  clearHistory(): void {
    this.searchHistory = [];
  }

  // 获取搜索建议
  getSuggestions(query: string, limit = 5): string[] {
    if (!query.trim()) return this.searchHistory.slice(0, limit);

    const normalizedQuery = this.normalizeText(query);
    const suggestions = new Set<string>();

    // 从历史记录中查找匹配项
    for (const historyItem of this.searchHistory) {
      if (this.normalizeText(historyItem).includes(normalizedQuery)) {
        suggestions.add(historyItem);
      }
    }

    // 从索引中查找匹配项
    for (const item of this.index.items) {
      for (const field of this.index.fields) {
        const fieldValue = String(item[field] || '');
        const normalizedValue = this.normalizeText(fieldValue);
        
        if (normalizedValue.includes(normalizedQuery)) {
          const words = this.tokenize(normalizedValue);
          for (const word of words) {
            if (word.includes(normalizedQuery) && word.length > normalizedQuery.length) {
              suggestions.add(word);
            }
          }
        }
      }
    }

    return Array.from(suggestions).slice(0, limit);
  }

  // 更新索引
  updateItems(newItems: T[]): void {
    this.index.items = newItems;
  }
}

// 推荐系统
export class RecommendationEngine<T> {
  private items: T[];
  private userPreferences: Record<string, number> = {};
  private itemFeatures: Map<string, Record<string, number>> = new Map();

  constructor(items: T[]) {
    this.items = items;
  }

  setUserPreferences(preferences: Record<string, number>): void {
    this.userPreferences = preferences;
  }

  setItemFeatures(itemId: string, features: Record<string, number>): void {
    this.itemFeatures.set(itemId, features);
  }

  getRecommendations(itemId?: string, limit = 5): T[] {
    if (itemId) {
      return this.getSimilarItems(itemId, limit);
    }
    return this.getPersonalizedRecommendations(limit);
  }

  private getSimilarItems(itemId: string, limit: number): T[] {
    const targetFeatures = this.itemFeatures.get(itemId);
    if (!targetFeatures) return [];

    const similarities: Array<{ item: T; similarity: number }> = [];

    for (const item of this.items) {
      const itemIdStr = String((item as any).id);
      if (itemIdStr === itemId) continue;

      const features = this.itemFeatures.get(itemIdStr);
      if (!features) continue;

      const similarity = this.calculateSimilarity(targetFeatures, features);
      similarities.push({ item, similarity });
    }

    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .map(s => s.item);
  }

  private getPersonalizedRecommendations(limit: number): T[] {
    const scores: Array<{ item: T; score: number }> = [];

    for (const item of this.items) {
      const itemIdStr = String((item as any).id);
      const features = this.itemFeatures.get(itemIdStr);
      if (!features) continue;

      let score = 0;
      for (const [feature, value] of Object.entries(features)) {
        const preference = this.userPreferences[feature] || 0;
        score += value * preference;
      }

      scores.push({ item, score });
    }

    return scores
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(s => s.item);
  }

  private calculateSimilarity(features1: Record<string, number>, features2: Record<string, number>): number {
    const keys = new Set([...Object.keys(features1), ...Object.keys(features2)]);
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (const key of keys) {
      const val1 = features1[key] || 0;
      const val2 = features2[key] || 0;
      dotProduct += val1 * val2;
      norm1 += val1 * val1;
      norm2 += val2 * val2;
    }

    if (norm1 === 0 || norm2 === 0) return 0;
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }
}