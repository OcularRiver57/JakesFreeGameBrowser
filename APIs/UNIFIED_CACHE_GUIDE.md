# Unified Cache Storage System

This document explains the unified cache storage system used across all APIs in the app.

## Overview

All APIs now use a standardized caching system (`APIs/cacheStorage.js`) that:
- Stores all cached data in a single AsyncStorage key (`@JakesFreeGameBrowser:api_cache`)
- Organizes data by namespace (e.g., `gamerpower`, `cheapshark`)
- Automatically handles TTL (time-to-live) expiration
- Cleans up expired entries automatically
- Provides utilities for cache management and debugging

## Cache Structure

```javascript
// Stored in AsyncStorage as:
@JakesFreeGameBrowser:api_cache = {
  "gamerpower": {
    "cache-key-1": { data: {...}, timestamp: 1715000000000, ttlMs: 43200000 },
    "cache-key-2": { data: {...}, timestamp: 1715000000000, ttlMs: 43200000 }
  },
  "cheapshark": {
    "cache-key-1": { data: {...}, timestamp: 1715000000000, ttlMs: 21600000 },
    "cache-key-2": { data: {...}, timestamp: 1715000000000, ttlMs: 21600000 }
  },
  "future-api": {
    "cache-key-1": { data: {...}, timestamp: 1715000000000, ttlMs: 36000000 }
  }
}
```

## API Reference

### `readCache(namespace, cacheKey)`
Read cached data for a specific namespace and key.

**Parameters:**
- `namespace` (string) - API namespace (e.g., 'gamerpower', 'cheapshark')
- `cacheKey` (string) - Unique cache key within the namespace

**Returns:** `Promise<any|null>` - Cached data or null if expired/missing

**Example:**
```javascript
import { readCache } from './APIs/cacheStorage';

const data = await readCache('gamerpower', 'type:game,sortBy:date');
```

### `writeCache(namespace, cacheKey, data, ttlMs)`
Write data to cache with TTL.

**Parameters:**
- `namespace` (string) - API namespace
- `cacheKey` (string) - Unique cache key within the namespace
- `data` (any) - Data to cache
- `ttlMs` (number) - Time to live in milliseconds

**Example:**
```javascript
import { writeCache } from './APIs/cacheStorage';

await writeCache('cheapshark', 'searchGames:{"title":"Elden Ring"}', games, 6 * 60 * 60 * 1000);
```

### `clearNamespaceCache(namespace)`
Clear all cached data for a specific namespace.

**Parameters:**
- `namespace` (string) - API namespace to clear

**Example:**
```javascript
import { clearNamespaceCache } from './APIs/cacheStorage';

await clearNamespaceCache('gamerpower');
```

### `clearAllCache()`
Clear all cached data across all namespaces.

**Example:**
```javascript
import { clearAllCache } from './APIs/cacheStorage';

await clearAllCache();
```

### `getCacheStats()`
Get cache statistics across all namespaces.

**Returns:** `Promise<object>` - Cache stats with size, entries per namespace, etc.

**Example:**
```javascript
import { getCacheStats } from './APIs/cacheStorage';

const stats = await getCacheStats();
// {
//   totalSize: 12345,
//   namespaces: {
//     gamerpower: { entries: 5, keys: [...] },
//     cheapshark: { entries: 3, keys: [...] }
//   },
//   totalEntries: 8
// }
```

### `getCacheRemainingTTL(namespace, cacheKey)`
Get remaining TTL for a cached item.

**Returns:** `Promise<number|null>` - Remaining TTL in milliseconds, or null if not found/expired

**Example:**
```javascript
import { getCacheRemainingTTL } from './APIs/cacheStorage';

const remainingMs = await getCacheRemainingTTL('gamerpower', 'type:game');
const remainingHours = remainingMs / (60 * 60 * 1000);
```

## Adding a New API

When adding a new API to the app, follow this pattern:

### 1. Create API Module (`APIs/getNewAPI.js`)

```javascript
import { readCache, writeCache, clearNamespaceCache } from "./cacheStorage";

const NEW_API_BASE_URL = "https://api.example.com/v1";
const NEW_API_NAMESPACE = "new-api";      // Unique namespace
const NEW_API_CACHE_TTL_MS = 3 * 60 * 60 * 1000; // 3 hours

// Function to generate cache key from query parameters
function getCacheKey(type, query) {
  return `${type}:${JSON.stringify(query)}`;
}

/**
 * Fetch data from API
 */
export async function fetchData(query) {
  // Create cache key
  const cacheKey = getCacheKey("fetchData", query);

  // Check cache first
  const cached = await readCache(NEW_API_NAMESPACE, cacheKey);
  if (cached) {
    return cached;
  }

  try {
    // Make API call
    const response = await fetch(`${NEW_API_BASE_URL}/endpoint`, {
      headers: { 'User-Agent': 'FreeGameApp/1.0 (contact@example.com)' }
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    // Cache the result
    await writeCache(NEW_API_NAMESPACE, cacheKey, data, NEW_API_CACHE_TTL_MS);

    return data;
  } catch (err) {
    console.error("Error fetching data:", err);
    return null;
  }
}

/**
 * Clear cache for this API
 */
export async function clearCache() {
  await clearNamespaceCache(NEW_API_NAMESPACE);
}
```

### 2. Create Custom Hook (`hooks/useNewAPI.js`)

```javascript
import { useState, useCallback } from "react";
import { fetchData } from "../APIs/getNewAPI";

export function useNewAPI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getData = useCallback(async (query) => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchData(query);
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, getData };
}
```

### 3. Use in Components

```javascript
import { useNewAPI } from '../hooks/useNewAPI';

function MyComponent() {
  const { getData, loading, error } = useNewAPI();

  const handleFetch = async () => {
    const data = await getData({ searchTerm: 'example' });
  };

  return (
    <TouchableOpacity onPress={handleFetch}>
      <Text>{loading ? 'Loading...' : 'Fetch Data'}</Text>
    </TouchableOpacity>
  );
}
```

## Cache Key Naming Convention

Use this format for cache keys:

```
"functionName:parameterString"
```

**Examples:**
```javascript
// GamerPower
"getGiveaways:type:game,sortBy:date"
"getGiveaways:type:game,sortBy:value"

// CheapShark
"searchGames:{\"title\":\"Elden Ring\",\"limit\":10}"
"getDealsBySteamAppID:{\"steamAppID\":\"292030\"}"

// New API
"searchItems:{\"query\":\"sword\",\"filter\":\"rarity:epic\"}"
```

## Best Practices

✅ **DO:**
- Use unique, descriptive cache keys
- Include query parameters in cache key for proper segregation
- Use appropriate TTL values (shorter for frequently changing data)
- Check cache before making API calls
- Clear namespace cache when appropriate

❌ **DON'T:**
- Hardcode storage keys (use the cacheStorage utility)
- Store duplicate data across different namespaces
- Use generic cache keys that don't differentiate queries
- Forget to handle expired cache (cacheStorage handles this)
- Mix old and new caching approaches

## Cache TTL Guidelines

| Data Type | Suggested TTL | Reasoning |
|-----------|---------------|-----------|
| Game listings | 12 hours | Data changes slowly |
| Price/sales data | 6 hours | Prices update ~hourly from stores |
| Store information | 24 hours | Store list rarely changes |
| Search results | 12 hours | User-specific, can be stale |
| Real-time data | 30 minutes | Requires fresh data |

## Debugging Cache

### View all cache stats:
```javascript
import { getCacheStats } from './APIs/cacheStorage';

const stats = await getCacheStats();
console.log('Cache stats:', stats);
// Output:
// {
//   totalSize: 45678 bytes,
//   namespaces: {
//     gamerpower: { entries: 5, keys: [...] },
//     cheapshark: { entries: 3, keys: [...] }
//   },
//   totalEntries: 8
// }
```

### Clear specific namespace:
```javascript
import { clearNamespaceCache } from './APIs/cacheStorage';

await clearNamespaceCache('gamerpower');
```

### Clear all cache:
```javascript
import { clearAllCache } from './APIs/cacheStorage';

await clearAllCache();
```

## Migration from Old System

Both existing APIs (GamerPower and CheapShark) have been migrated to use the unified cache system:

**Before:**
- `AsyncStorage.getItem(GAMERPOWER_STORAGE_KEY)`
- `AsyncStorage.getItem(CHEAPSHARK_STORAGE_KEY)`
- Multiple storage keys in AsyncStorage

**After:**
- `readCache("gamerpower", cacheKey)`
- `readCache("cheapshark", cacheKey)`
- Single unified storage key with namespaces

## Future Expansion

The unified cache system makes it easy to add APIs like:
- Steam price tracking API
- Epic Games Store deals
- Xbox Game Pass titles
- Twitch Prime Gaming free games
- Any other game service

Just:
1. Create a new namespace constant
2. Use `readCache` and `writeCache` with your namespace
3. Optionally export `clearCache` for your API
4. All data automatically benefits from TTL management and debugging tools
