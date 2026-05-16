import { readCache, writeCache, clearNamespaceCache } from "./cacheStorage";

const CHEAPSHARK_BASE_URL = "https://www.cheapshark.com/api/1.0";
const CHEAPSHARK_NAMESPACE = "cheapshark";
const CHEAPSHARK_CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

const USER_AGENT = "JakesFreeGameApp/1.0 (jakehaloodst@gmail.com)";

/**
 * Fetch options with required User-Agent header
 */
function getFetchOptions() {
	return {
		headers: {
			"User-Agent": USER_AGENT,
		},
	};
}

/**
 * Convert Unix timestamp (seconds) to milliseconds
 */
function convertUnixTimestamp(unixSeconds) {
	if (!unixSeconds) return null;
	return new Date(Number(unixSeconds) * 1000);
}

export function buildCheapSharkRedirectUrl(dealID) {
	if (!dealID) {
		return null;
	}

	return `https://www.cheapshark.com/redirect?dealID=${dealID}`;
}

export function buildGameStoreUrl(deal = {}) {
	return buildCheapSharkRedirectUrl(deal.dealID);
}

/**
 * Search for games by title
 * @param {string} title - Game title to search for
 * @param {number} limit - Max results (default 60)
 * @param {boolean} exact - Exact match only
 * @returns {Promise<Array>} Array of games with basic info
 */
export async function searchGames(title, limit = 60, exact = false) {
	if (!title || title.trim() === "") {
		return [];
	}

	const query = { title, limit, exact };
	const cacheKey = `searchGames:${JSON.stringify(query)}`;

	// Check cache first
	const cached = await readCache(CHEAPSHARK_NAMESPACE, cacheKey);
	if (cached) {
		return cached;
	}

	try {
		const params = new URLSearchParams({
			title: title.trim(),
			limit,
			...(exact && { exact: 1 }),
		});

		const response = await fetch(
			`${CHEAPSHARK_BASE_URL}/games?${params}`,
			getFetchOptions()
		);

		if (!response.ok) {
			if (response.status === 429) {
				const retryAfter = response.headers.get("Retry-After");
				console.warn(
					`CheapShark rate limited. Retry after ${retryAfter} seconds`
				);
			}
			throw new Error(`CheapShark API error: ${response.status}`);
		}

		const data = await response.json();
		const games = Array.isArray(data) ? data : [];

		// Cache results
		await writeCache(CHEAPSHARK_NAMESPACE, cacheKey, games, CHEAPSHARK_CACHE_TTL_MS);

		return games;
	} catch (err) {
		console.error("Error searching games:", err);
		return [];
	}
}

/**
 * Get deals for a specific game by Steam App ID
 * @param {string} steamAppID - Steam App ID
 * @param {object} options - Filter options
 * @returns {Promise<Array>} Array of deals from different stores
 */
export async function getDealsBySteamAppID(steamAppID, options = {}) {
	if (!steamAppID) {
		return [];
	}

	const query = { steamAppID, ...options };
	const cacheKey = `getDealsBySteamAppID:${JSON.stringify(query)}`;

	// Check cache first
	const cached = await readCache(CHEAPSHARK_NAMESPACE, cacheKey);
	if (cached) {
		return cached;
	}

	try {
		const params = new URLSearchParams({
			steamAppID,
			...(options.storeID && { storeID: options.storeID }),
			...(options.lowerPrice !== undefined && {
				lowerPrice: options.lowerPrice,
			}),
			...(options.upperPrice !== undefined && {
				upperPrice: options.upperPrice,
			}),
			...(options.onSale && { onSale: 1 }),
		});

		const response = await fetch(
			`${CHEAPSHARK_BASE_URL}/deals?${params}`,
			getFetchOptions()
		);

		if (!response.ok) {
			if (response.status === 429) {
				const retryAfter = response.headers.get("Retry-After");
				console.warn(
					`CheapShark rate limited. Retry after ${retryAfter} seconds`
				);
			}
			throw new Error(`CheapShark API error: ${response.status}`);
		}

		const data = await response.json();
		const deals = Array.isArray(data) ? data : [];

		// Normalize deal data
		const normalizedDeals = deals.map((deal) => ({
			...deal,
			releaseDate: convertUnixTimestamp(deal.releaseDate),
			lastChange: convertUnixTimestamp(deal.lastChange),
			salePrice: Number.parseFloat(deal.salePrice) || 0,
			normalPrice: Number.parseFloat(deal.normalPrice) || 0,
			savings: Number.parseFloat(deal.savings) || 0,
			isOnSale: deal.isOnSale === "1" || deal.isOnSale === 1,
		}));


		return normalizedDeals;
	} catch (err) {
		console.error("Error getting deals by Steam ID:", err);
		return [];
	}
}

/**
 * Get deals with flexible filtering
 * @param {object} options - Filter options
 * @returns {Promise<Array>} Array of deals
 */
export async function getDeals(options = {}) {
	const query = options;
	const cacheKey = `getDeals:${JSON.stringify(query)}`;

	// Check cache first
	const cached = await readCache(CHEAPSHARK_NAMESPACE, cacheKey);
	if (cached) {
		return cached;
	}

	try {
		const params = new URLSearchParams({
			pageNumber: options.pageNumber || 0,
			pageSize: Math.min(options.pageSize || 20, 60), // Max 60
			sortBy: options.sortBy || "DealRating",
			desc: options.desc ? 1 : 0,
			...(options.storeID && { storeID: options.storeID }),
			...(options.lowerPrice !== undefined && {
				lowerPrice: options.lowerPrice,
			}),
			...(options.upperPrice !== undefined && {
				upperPrice: options.upperPrice,
			}),
			...(options.metacritic && { metacritic: options.metacritic }),
			...(options.steamRating && { steamRating: options.steamRating }),
			...(options.title && { title: options.title }),
			...(options.exact && { exact: 1 }),
			...(options.onSale && { onSale: 1 }),
		});

		const response = await fetch(
			`${CHEAPSHARK_BASE_URL}/deals?${params}`,
			getFetchOptions()
		);

		if (!response.ok) {
			if (response.status === 429) {
				const retryAfter = response.headers.get("Retry-After");
				console.warn(
					`CheapShark rate limited. Retry after ${retryAfter} seconds`
				);
			}
			throw new Error(`CheapShark API error: ${response.status}`);
		}

		const data = await response.json();
		const deals = Array.isArray(data) ? data : [];

		// Normalize deal data
		const normalizedDeals = deals.map((deal) => ({
			...deal,
			releaseDate: convertUnixTimestamp(deal.releaseDate),
			lastChange: convertUnixTimestamp(deal.lastChange),
			salePrice: Number.parseFloat(deal.salePrice) || 0,
			normalPrice: Number.parseFloat(deal.normalPrice) || 0,
			savings: Number.parseFloat(deal.savings) || 0,
			isOnSale: deal.isOnSale === "1" || deal.isOnSale === 1,
		}));

		// Cache results
		await writeCache(CHEAPSHARK_NAMESPACE, cacheKey, normalizedDeals, CHEAPSHARK_CACHE_TTL_MS);

		return normalizedDeals;
	} catch (err) {
		console.error("Error getting deals:", err);
		return [];
	}
}

/**
 * Get all available stores
 * @returns {Promise<Array>} Array of store objects
 */
export async function getStores() {
	const cacheKey = "getStores:all";

	// Check cache first
	const cached = await readCache(CHEAPSHARK_NAMESPACE, cacheKey);
	if (cached) {
		return cached;
	}

	try {
		const response = await fetch(`${CHEAPSHARK_BASE_URL}/stores`, getFetchOptions());

		if (!response.ok) {
			throw new Error(`CheapShark API error: ${response.status}`);
		}

		const stores = await response.json();

		// Cache results
		await writeCache(CHEAPSHARK_NAMESPACE, cacheKey, stores, CHEAPSHARK_CACHE_TTL_MS);

		return stores;
	} catch (err) {
		console.error("Error getting stores:", err);
		return [];
	}
}

/**
 * Get best price for a game across all stores
 * @param {string} steamAppID - Steam App ID
 * @returns {Promise<object|null>} Best deal info or null
 */
export async function getBestPrice(steamAppID) {
	if (!steamAppID) {
		return null;
	}

	try {
		const deals = await getDealsBySteamAppID(steamAppID);

		if (deals.length === 0) {
			return null;
		}

		// Sort by sale price ascending to get the best (lowest) price
		const bestDeal = deals.reduce((best, current) => {
			return Number(current.salePrice) < Number(best.salePrice)
				? current
				: best;
		});

		return bestDeal;
	} catch (err) {
		console.error("Error getting best price:", err);
		return null;
	}
}

/**
 * Check if game is on sale
 * @param {string} steamAppID - Steam App ID
 * @returns {Promise<boolean>} True if game is on sale
 */
export async function isGameOnSale(steamAppID) {
	if (!steamAppID) {
		return false;
	}

	try {
		const deals = await getDealsBySteamAppID(steamAppID, { onSale: true });
		return deals.length > 0;
	} catch (err) {
		console.error("Error checking if game is on sale:", err);
		return false;
	}
}

/**
 * Clear all CheapShark cache
 */
export async function clearCache() {
	try {
		await clearNamespaceCache(CHEAPSHARK_NAMESPACE);
		console.log("CheapShark cache cleared");
	} catch (err) {
		console.error("Error clearing CheapShark cache:", err);
	}
}

/**
 * Get cache statistics for debugging (returns stats for CheapShark namespace only)
 */
export async function getCacheStats() {
	try {
		const { getCacheStats: getAllCacheStats } = await import("./cacheStorage");
		const allStats = await getAllCacheStats();

		if (!allStats) {
			return { totalCacheSize: 0, entries: 0, ttlMs: CHEAPSHARK_CACHE_TTL_MS };
		}

		const cheapsharkStats = allStats.namespaces[CHEAPSHARK_NAMESPACE] || {
			entries: 0,
			keys: [],
		};

		return {
			namespace: CHEAPSHARK_NAMESPACE,
			entries: cheapsharkStats.entries,
			keys: cheapsharkStats.keys,
			ttlMs: CHEAPSHARK_CACHE_TTL_MS,
			ttlHours: CHEAPSHARK_CACHE_TTL_MS / (60 * 60 * 1000),
		};
	} catch (err) {
		console.error("Error getting cache stats:", err);
		return null;
	}
}
