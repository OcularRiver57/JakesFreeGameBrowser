import { readCache, writeCache } from "./cacheStorage";

const GAMERPOWER_BASE_URL = "https://www.gamerpower.com/api";
const GAMERPOWER_GIVEAWAYS_URL = `${GAMERPOWER_BASE_URL}/giveaways`;
const GAMERPOWER_NAMESPACE = "gamerpower";
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

async function readCachedGiveaways(cacheKey) {
	return await readCache(GAMERPOWER_NAMESPACE, cacheKey);
}

async function writeCachedGiveaways(cacheKey, data) {
	const cachePayload = {
		updatedAt: new Date().toISOString(),
		data: normalizeGiveaways(data),
	};

	await writeCache(GAMERPOWER_NAMESPACE, cacheKey, cachePayload, GAMERPOWER_CACHE_TTL_MS);
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
	const cacheKey = JSON.stringify(options);
	const giveaways = await fetchGamerPowerGiveaways(options);
	const cached = await writeCachedGiveaways(cacheKey, giveaways);

	return {
		giveaways,
		updatedAt: cached.updatedAt,
		fromCache: false,
	};
}

export async function getCachedGamerPowerGiveaways(options = {}) {
	const { sortBy = "date", order = "desc" } = options;
	const cacheKey = JSON.stringify(options);
	const cached = await readCachedGiveaways(cacheKey);

	if (!cached || !cached.data || !cached.updatedAt) {
		return sortGiveaways([], sortBy, order);
	}

	return sortGiveaways(cached.data, sortBy, order);
}

export async function getGamerPowerGiveaways(options = {}) {
	const { forceRefresh = false, platform, type, sortBy = "date", order = "desc" } = options;
	const cacheKey = JSON.stringify({ platform, type, sortBy });
	const cached = await readCachedGiveaways(cacheKey);
	const updatedAt = cached?.updatedAt ? Date.parse(cached.updatedAt) : 0;
	const isCacheStale = !updatedAt || Date.now() - updatedAt > GAMERPOWER_CACHE_TTL_MS;

	if (forceRefresh || isCacheStale || !cached?.data) {
		const freshData = await refreshGamerPowerCache({ platform, type, sortBy });
		return sortGiveaways(freshData.giveaways, sortBy, order);
	}

	return sortGiveaways(cached.data, sortBy, order);
}

export async function clearGamerPowerCache() {
	const { clearNamespaceCache } = await import("./cacheStorage");
	await clearNamespaceCache(GAMERPOWER_NAMESPACE);
}

export const gamerPowerCacheConfig = {
	namespace: GAMERPOWER_NAMESPACE,
	ttlMs: GAMERPOWER_CACHE_TTL_MS,
};
