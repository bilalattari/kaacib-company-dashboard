const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds

export const getCachedData = (key) => {
  try {
    const cached = sessionStorage.getItem(key);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    const now = Date.now();

    if (now - timestamp > CACHE_DURATION) {
      sessionStorage.removeItem(key);
      return null;
    }

    console.log(`Cache hit for: ${key}`);
    return data;
  } catch (error) {
    console.error('Error reading from cache:', error);
    return null;
  }
};

export const setCachedData = (key, data) => {
  try {
    const cacheItem = {
      data,
      timestamp: Date.now(),
    };
    sessionStorage.setItem(key, JSON.stringify(cacheItem));
    console.log(`Cached: ${key}`);
  } catch (error) {
    console.error('Error writing to cache:', error);
  }
};

export const clearCache = (key) => {
  try {
    sessionStorage.removeItem(key);
    console.log(`Cleared cache: ${key}`);
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
};

export const clearAllCache = () => {
  try {
    sessionStorage.clear();
    console.log('Cleared all cache');
  } catch (error) {
    console.error('Error clearing all cache:', error);
  }
};

export const isCacheValid = (key) => {
  return getCachedData(key) !== null;
};
