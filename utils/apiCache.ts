/**
 * Utility for client-side caching using localStorage
 * Cache duration: 24 hours
 * Soft refresh threshold: 23 hours
 */

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const REFRESH_THRESHOLD = 23 * 60 * 60 * 1000; // 23 hours in milliseconds

interface CacheEntry<T> {
    data: T;
    timestamp: number;
}

interface CacheResult<T> {
    data: T | null;
    shouldRefresh: boolean;
}

export const getCachedData = <T>(key: string): CacheResult<T> => {
    if (typeof window === 'undefined') {
        return { data: null, shouldRefresh: true };
    }

    try {
        const item = localStorage.getItem(key);
        if (!item) {
            return { data: null, shouldRefresh: true };
        }

        const entry: CacheEntry<T> = JSON.parse(item);
        const now = Date.now();
        const age = now - entry.timestamp;

        // If cache is older than 24 hours, consider it expired
        if (age > CACHE_DURATION) {
            localStorage.removeItem(key);
            return { data: null, shouldRefresh: true };
        }

        // If cache is between 23 and 24 hours, return data but suggest refresh
        if (age > REFRESH_THRESHOLD) {
            return { data: entry.data, shouldRefresh: true };
        }

        // Cache is fresh
        return { data: entry.data, shouldRefresh: false };
    } catch (error) {
        console.error('Error reading from cache:', error);
        return { data: null, shouldRefresh: true };
    }
};

export const setCachedData = <T>(key: string, data: T): void => {
    if (typeof window === 'undefined') {
        return;
    }

    try {
        const entry: CacheEntry<T> = {
            data,
            timestamp: Date.now(),
        };
        localStorage.setItem(key, JSON.stringify(entry));
    } catch (error) {
        console.error('Error writing to cache:', error);
    }
};

export const clearCache = (key: string): void => {
    if (typeof window === 'undefined') {
        return;
    }
    localStorage.removeItem(key);
};
