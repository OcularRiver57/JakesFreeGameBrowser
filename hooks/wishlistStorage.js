import AsyncStorage from "@react-native-async-storage/async-storage";

const WISHLISTS_STORAGE_KEY = "@JakesFreeGameBrowser:wishlists";

export const wishlistStorage = {
	async getAllWishlists() {
		try {
			const data = await AsyncStorage.getItem(WISHLISTS_STORAGE_KEY);
			return data ? JSON.parse(data) : [];
		} catch (err) {
			console.error("Error reading wishlists:", err);
			return [];
		}
	},

	async getWishlistById(id) {
		try {
			const wishlists = await this.getAllWishlists();
			return wishlists.find((list) => list.id === id);
		} catch (err) {
			console.error("Error getting wishlist:", err);
			return null;
		}
	},

	async createWishlist(name, description = "") {
		try {
			const wishlists = await this.getAllWishlists();
			const newWishlist = {
				id: Date.now().toString(),
				name,
				description,
				games: [],
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};
			wishlists.push(newWishlist);
			await AsyncStorage.setItem(WISHLISTS_STORAGE_KEY, JSON.stringify(wishlists));
			return newWishlist;
		} catch (err) {
			console.error("Error creating wishlist:", err);
			throw err;
		}
	},

	async deleteWishlist(id) {
		try {
			const wishlists = await this.getAllWishlists();
			const filtered = wishlists.filter((list) => list.id !== id);
			await AsyncStorage.setItem(WISHLISTS_STORAGE_KEY, JSON.stringify(filtered));
		} catch (err) {
			console.error("Error deleting wishlist:", err);
			throw err;
		}
	},

	async updateWishlistName(id, name) {
		try {
			const wishlists = await this.getAllWishlists();
			const wishlist = wishlists.find((list) => list.id === id);
			if (wishlist) {
				wishlist.name = name;
				wishlist.updatedAt = new Date().toISOString();
				await AsyncStorage.setItem(WISHLISTS_STORAGE_KEY, JSON.stringify(wishlists));
			}
		} catch (err) {
			console.error("Error updating wishlist name:", err);
			throw err;
		}
	},

	async addGameToWishlist(wishlistId, game) {
		try {
			const wishlists = await this.getAllWishlists();
			const wishlist = wishlists.find((list) => list.id === wishlistId);
			if (wishlist) {
				// Check if game already exists
				const gameExists = wishlist.games.some((g) => g.id === game.id);
				if (!gameExists) {
					wishlist.games.push(game);
					wishlist.updatedAt = new Date().toISOString();
					await AsyncStorage.setItem(WISHLISTS_STORAGE_KEY, JSON.stringify(wishlists));
				}
			}
		} catch (err) {
			console.error("Error adding game to wishlist:", err);
			throw err;
		}
	},

	async removeGameFromWishlist(wishlistId, gameId) {
		try {
			const wishlists = await this.getAllWishlists();
			const wishlist = wishlists.find((list) => list.id === wishlistId);
			if (wishlist) {
				wishlist.games = wishlist.games.filter((g) => g.id !== gameId);
				wishlist.updatedAt = new Date().toISOString();
				await AsyncStorage.setItem(WISHLISTS_STORAGE_KEY, JSON.stringify(wishlists));
			}
		} catch (err) {
			console.error("Error removing game from wishlist:", err);
			throw err;
		}
	},

	async exportWishlist(id) {
		try {
			const wishlist = await this.getWishlistById(id);
			if (!wishlist) throw new Error("Wishlist not found");
			return JSON.stringify(wishlist, null, 2);
		} catch (err) {
			console.error("Error exporting wishlist:", err);
			throw err;
		}
	},

	async importWishlist(jsonData) {
		try {
			const imported = JSON.parse(jsonData);
			const wishlists = await this.getAllWishlists();

			// Generate new ID for imported wishlist
			const newWishlist = {
				...imported,
				id: Date.now().toString(),
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};

			wishlists.push(newWishlist);
			await AsyncStorage.setItem(WISHLISTS_STORAGE_KEY, JSON.stringify(wishlists));
			return newWishlist;
		} catch (err) {
			console.error("Error importing wishlist:", err);
			throw err;
		}
	},
};
