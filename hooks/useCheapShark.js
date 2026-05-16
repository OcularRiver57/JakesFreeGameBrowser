import { useState, useCallback } from "react";
import {
	searchGames,
	getDealsBySteamAppID,
	getBestPrice,
	isGameOnSale,
	getDeals,
} from "../APIs/getCheapSharkAPIs";

export function useCheapShark() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const searchForGames = useCallback(async (title, limit = 60, exact = false) => {
		try {
			setLoading(true);
			setError(null);
			const results = await searchGames(title, limit, exact);
			return results;
		} catch (err) {
			setError(err.message || "Error searching games");
			console.error("Search games error:", err);
			return [];
		} finally {
			setLoading(false);
		}
	}, []);

	const getPriceDeals = useCallback(async (steamAppID, options = {}) => {
		try {
			setLoading(true);
			setError(null);
			const deals = await getDealsBySteamAppID(steamAppID, options);
			return deals;
		} catch (err) {
			setError(err.message || "Error getting price deals");
			console.error("Get price deals error:", err);
			return [];
		} finally {
			setLoading(false);
		}
	}, []);

	const getBestPriceData = useCallback(async (steamAppID) => {
		try {
			setError(null);
			const bestPrice = await getBestPrice(steamAppID);
			return bestPrice;
		} catch (err) {
			setError(err.message || "Error getting best price");
			console.error("Get best price error:", err);
			return null;
		}
	}, []);

	const checkIfOnSale = useCallback(async (steamAppID) => {
		try {
			setError(null);
			const onSale = await isGameOnSale(steamAppID);
			return onSale;
		} catch (err) {
			setError(err.message || "Error checking if on sale");
			console.error("Check on sale error:", err);
			return false;
		}
	}, []);

	const fetchDeals = useCallback(async (options = {}) => {
		try {
			setLoading(true);
			setError(null);
			const deals = await getDeals(options);
			return deals;
		} catch (err) {
			setError(err.message || "Error fetching deals");
			console.error("Fetch deals error:", err);
			return [];
		} finally {
			setLoading(false);
		}
	}, []);

	return {
		loading,
		error,
		searchForGames,
		getPriceDeals,
		getBestPriceData,
		checkIfOnSale,
		fetchDeals,
	};
}
