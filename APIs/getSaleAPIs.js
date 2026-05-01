import AsyncStorage from "@react-native-async-storage/async-storage";

const GAMERPOWER_BASE_URL = "https://www.gamerpower.com/api";
const GAMERPOWER_GIVEAWAYS_URL = `${GAMERPOWER_BASE_URL}/giveaways`;
const GAMERPOWER_STORAGE_KEY = "@JakesFreeGameBrowser:gamerpower_giveaways";
const GAMERPOWER_CACHE_TTL_MS = 12 * 60 * 60 * 1000;

function buildQueryString(params = {}) {
	const searchParams = new URLSearchParams();

	Object.entries(params).forEach(([key, value]) => {
		if (value === undefined || value === null || value === "") {
			return;
		}

		searchParams.append(key, String(value));
	});

	const query = searchParams.toString();
	return query ? `?${query}` : "";
}

function normalizeGiveaways(giveaways) {
	if (!Array.isArray(giveaways)) {
		return [];
	}

	return giveaways;
}

function parseDateValue(value) {
	const timestamp = Date.parse(value);
	return Number.isNaN(timestamp) ? 0 : timestamp;
}

function getComparableValue(giveaway, sortBy) {
	if (!giveaway || typeof giveaway !== "object") {
		return 0;
	}

	switch (sortBy) {
		case "value":
			return Number.parseFloat(String(giveaway.worth ?? giveaway.value ?? 0).replace(/[^0-9.-]/g, "")) || 0;
		case "popularity":
			return Number(giveaway.users ?? giveaway.popularity ?? giveaway.claims ?? 0) || 0;
		case "date":
		default:
			return parseDateValue(giveaway.end_date ?? giveaway.published_date ?? giveaway.start_date ?? giveaway.date);
	}
}

export function sortGiveaways(giveaways = [], sortBy = "date", order = "desc") {
	const direction = order === "asc" ? 1 : -1;

	return [...normalizeGiveaways(giveaways)].sort((left, right) => {
		const leftValue = getComparableValue(left, sortBy);
		const rightValue = getComparableValue(right, sortBy);

		if (leftValue < rightValue) {
			return -1 * direction;
		}

		if (leftValue > rightValue) {
			return 1 * direction;
		}

		const leftName = String(left?.title ?? left?.name ?? "").toLowerCase();
		const rightName = String(right?.title ?? right?.name ?? "").toLowerCase();

		return leftName.localeCompare(rightName) * direction;
	});
}

async function readCachedGiveaways() {
	const rawCache = await AsyncStorage.getItem(GAMERPOWER_STORAGE_KEY);

	if (!rawCache) {
		return null;
	}

	try {
		const parsedCache = JSON.parse(rawCache);

		if (!parsedCache || typeof parsedCache !== "object") {
			return null;
		}

		return parsedCache;
	} catch {
		return null;
	}
}

async function writeCachedGiveaways(data) {
	const cachePayload = {
		updatedAt: new Date().toISOString(),
		data: normalizeGiveaways(data),
	};

	await AsyncStorage.setItem(GAMERPOWER_STORAGE_KEY, JSON.stringify(cachePayload));
	return cachePayload;
}

export async function fetchGamerPowerGiveaways(options = {}) {
	const { platform, type, sortBy } = options;
	const queryString = buildQueryString({ platform, type, "sort-by": sortBy });
	const response = await fetch(`${GAMERPOWER_GIVEAWAYS_URL}${queryString}`);

	if (!response.ok) {
		throw new Error(`Failed to fetch GamerPower giveaways: ${response.status}`);
	}

	const giveaways = await response.json();
	return normalizeGiveaways(giveaways);
}

export async function refreshGamerPowerCache(options = {}) {
	const giveaways = await fetchGamerPowerGiveaways(options);
	const cached = await writeCachedGiveaways(giveaways);

	return {
		giveaways,
		updatedAt: cached.updatedAt,
		fromCache: false,
	};
}

export async function getCachedGamerPowerGiveaways(options = {}) {
	const { sortBy = "date", order = "desc" } = options;
	const cached = await readCachedGiveaways();

	if (!cached || !cached.data || !cached.updatedAt) {
		return sortGiveaways([], sortBy, order);
	}

	return sortGiveaways(cached.data, sortBy, order);
}

export async function getGamerPowerGiveaways(options = {}) {
	const { forceRefresh = false, platform, type, sortBy = "date", order = "desc" } = options;
	const cached = await readCachedGiveaways();
	const updatedAt = cached?.updatedAt ? Date.parse(cached.updatedAt) : 0;
	const isCacheStale = !updatedAt || Date.now() - updatedAt > GAMERPOWER_CACHE_TTL_MS;

	if (forceRefresh || isCacheStale || !cached?.data) {
		const freshData = await refreshGamerPowerCache({ platform, type, sortBy });
		return sortGiveaways(freshData.giveaways, sortBy, order);
	}

	return sortGiveaways(cached.data, sortBy, order);
}

export async function clearGamerPowerCache() {
	await AsyncStorage.removeItem(GAMERPOWER_STORAGE_KEY);
}

export const gamerPowerCacheConfig = {
	storageKey: GAMERPOWER_STORAGE_KEY,
	ttlMs: GAMERPOWER_CACHE_TTL_MS,
};
