// Shared caching system for admin panels
// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const BACKGROUND_REFRESH_THRESHOLD = 2 * 60 * 1000; // 2 minutes

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    key: string;
}

class AdminDataCache {
    private cache = new Map<string, CacheEntry<any>>();

    set<T>(key: string, data: T): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            key
        });
    }

    get<T>(key: string): T | null {
        const entry = this.cache.get(key);
        if (!entry) return null;

        const age = Date.now() - entry.timestamp;
        if (age > CACHE_DURATION) {
            this.cache.delete(key);
            return null;
        }

        return entry.data;
    }

    isStale(key: string): boolean {
        const entry = this.cache.get(key);
        if (!entry) return true;

        const age = Date.now() - entry.timestamp;
        return age > BACKGROUND_REFRESH_THRESHOLD;
    }

    invalidate(pattern?: string): void {
        if (!pattern) {
            this.cache.clear();
            return;
        }

        for (const [key] of this.cache) {
            if (key.includes(pattern)) {
                this.cache.delete(key);
            }
        }
    }

    getKeys(): string[] {
        return Array.from(this.cache.keys());
    }

    size(): number {
        return this.cache.size;
    }
}

// Global cache instance
export const adminCache = new AdminDataCache();

// Utility function to generate consistent cache keys
export const generateCacheKey = (type: string, params: Record<string, any>): string => {
    const sortedParams = Object.keys(params)
        .sort()
        .reduce((result, key) => {
            result[key] = params[key];
            return result;
        }, {} as Record<string, any>);
    return `${type}_${JSON.stringify(sortedParams)}`;
};

// Hook for cache-aware data fetching
export const useCachedFetch = () => {
    const fetchWithCache = async <T>(
        cacheKey: string,
        fetchFn: () => Promise<T>,
        forceRefresh = false
    ): Promise<{
        data: T | null;
        isFromCache: boolean;
        isStale: boolean;
    }> => {
        // Check cache first
        if (!forceRefresh) {
            const cachedData = adminCache.get<T>(cacheKey);
            if (cachedData) {
                return {
                    data: cachedData,
                    isFromCache: true,
                    isStale: adminCache.isStale(cacheKey)
                };
            }
        }

        try {
            const freshData = await fetchFn();
            adminCache.set(cacheKey, freshData);
            return {
                data: freshData,
                isFromCache: false,
                isStale: false
            };
        } catch (error) {
            return {
                data: null,
                isFromCache: false,
                isStale: false
            };
        }
    };

    return { fetchWithCache };
};

export { CACHE_DURATION, BACKGROUND_REFRESH_THRESHOLD };
