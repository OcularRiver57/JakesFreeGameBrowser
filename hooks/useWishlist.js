import { useState, useEffect, useCallback } from "react";
import { wishlistStorage } from "./wishlistStorage";

export function useWishlist() {
	const [wishlists, setWishlists] = useState([]);
	const [loading, setLoading] = useState(false);

	// Load wishlists on mount
	useEffect(() => {
		loadWishlists();
	}, [loadWishlists]);

	const loadWishlists = useCallback(async () => {
		try {
			setLoading(true);
			const data = await wishlistStorage.getAllWishlists();
			setWishlists(data);
		} catch (err) {
			console.error("Error loading wishlists:", err);
		} finally {
			setLoading(false);
		}
	}, []);

	const createWishlist = useCallback(async (name, description = "") => {
		try {
			const newWishlist = await wishlistStorage.createWishlist(name, description);
			setWishlists((prev) => [...prev, newWishlist]);
			return newWishlist;
		} catch (err) {
			console.error("Error creating wishlist:", err);
			throw err;
		}
	}, []);

	const deleteWishlist = useCallback(async (id) => {
		try {
			await wishlistStorage.deleteWishlist(id);
			setWishlists((prev) => prev.filter((list) => list.id !== id));
		} catch (err) {
			console.error("Error deleting wishlist:", err);
			throw err;
		}
	}, []);

	const updateWishlistName = useCallback(async (id, name) => {
		try {
			await wishlistStorage.updateWishlistName(id, name);
			setWishlists((prev) =>
				prev.map((list) =>
					list.id === id ? { ...list, name, updatedAt: new Date().toISOString() } : list,
				),
			);
		} catch (err) {
			console.error("Error updating wishlist:", err);
			throw err;
		}
	}, []);

	const addGameToWishlist = useCallback(async (game, wishlistId = null) => {
		try {
			// If no wishlistId specified, create/use default wishlist
			let targetWishlistId = wishlistId;

			if (!targetWishlistId) {
				let defaultWishlist = wishlists.find((list) => list.name === "Default");

				if (!defaultWishlist) {
					defaultWishlist = await createWishlist("Default", "My default wishlist");
				}

				targetWishlistId = defaultWishlist.id;
			}

			await wishlistStorage.addGameToWishlist(targetWishlistId, game);

			// Update local state
			setWishlists((prev) =>
				prev.map((list) =>
					list.id === targetWishlistId
						? {
								...list,
								games: list.games.some((g) => g.id === game.id)
									? list.games
									: [...list.games, game],
								updatedAt: new Date().toISOString(),
							}
						: list,
				),
			);

			return targetWishlistId;
		} catch (err) {
			console.error("Error adding game to wishlist:", err);
			throw err;
		}
	}, [wishlists, createWishlist]);

	const removeGameFromWishlist = useCallback(async (wishlistId, gameId) => {
		try {
			await wishlistStorage.removeGameFromWishlist(wishlistId, gameId);
			setWishlists((prev) =>
				prev.map((list) =>
					list.id === wishlistId
						? {
								...list,
								games: list.games.filter((g) => g.id !== gameId),
								updatedAt: new Date().toISOString(),
							}
						: list,
				),
			);
		} catch (err) {
			console.error("Error removing game from wishlist:", err);
			throw err;
		}
	}, []);

	const getWishlistById = useCallback(
		(id) => {
			return wishlists.find((list) => list.id === id);
		},
		[wishlists],
	);

	const exportWishlist = useCallback(async (id) => {
		try {
			return await wishlistStorage.exportWishlist(id);
		} catch (err) {
			console.error("Error exporting wishlist:", err);
			throw err;
		}
	}, []);

	const importWishlist = useCallback(async (jsonData) => {
		try {
			const imported = await wishlistStorage.importWishlist(jsonData);
			setWishlists((prev) => [...prev, imported]);
			return imported;
		} catch (err) {
			console.error("Error importing wishlist:", err);
			throw err;
		}
	}, []);

	return {
		wishlists,
		loading,
		loadWishlists,
		createWishlist,
		deleteWishlist,
		updateWishlistName,
		addGameToWishlist,
		removeGameFromWishlist,
		getWishlistById,
		exportWishlist,
		importWishlist,
	};
}
