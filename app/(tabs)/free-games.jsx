import { StyleSheet, View, FlatList, ActivityIndicator, Text } from "react-native";
import { useState, useEffect, useCallback } from "react";
import { GameCard } from "../../components/GameCard";
import { getGamerPowerGiveaways } from "../../APIs/getSaleAPIs";
import { useWishlist } from "../../hooks/useWishlist";

function isFreeGame(game) {
	if (!game || typeof game !== "object") {
		return false;
	}

	const numericSalePrice = Number.parseFloat(String(game.salePrice ?? game.sale_price ?? ""));

	if (Number.isFinite(numericSalePrice)) {
		return numericSalePrice === 0;
	}

	if (game.is_free === true || String(game.price ?? "").toLowerCase() === "free") {
		return true;
	}

	// GamerPower giveaway entries are free by definition.
	return Boolean(game.open_giveaway_url || game.giveaway_url);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#1a1a1a",
		paddingHorizontal: 12,
		paddingTop: 12,
	},
	listContent: {
		paddingBottom: 20,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	errorContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 20,
	},
	errorText: {
		color: "#ff6b6b",
		fontSize: 16,
		textAlign: "center",
		marginBottom: 16,
	},
	emptyContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 20,
	},
	emptyText: {
		color: "#aaa",
		fontSize: 16,
		textAlign: "center",
	},
});

export default function FreeGamesScreen() {
	const [games, setGames] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const { addGameToWishlist } = useWishlist();

	const loadFreeGames = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);

			// Fetch free games (type=game filters for games, not loot)
			const freeGames = await getGamerPowerGiveaways({
				type: "game",
				sortBy: "date",
				order: "desc",
			});

			setGames(freeGames.filter(isFreeGame));
		} catch (e) {
			console.error("Error loading free games:", e);
			setError(e.message || "Failed to load free games");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadFreeGames();
	}, [loadFreeGames]);

	const handleAddToWishlist = (game) => {
		addGameToWishlist({
			id: game.id || Math.random().toString(),
			title: game.title,
			image: game.image,
			url: game.open_giveaway_url,
			worth: game.worth,
			type: game.type,
			platform: game.platform || game.platforms,
			store: game.store || game.storeName || game.store_name,
			source: "GamerPower",
			addedAt: new Date().toISOString(),
		});
	};

	if (loading) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="large" color="#007AFF" />
			</View>
		);
	}

	if (error) {
		return (
			<View style={styles.errorContainer}>
				<Text style={styles.errorText}>❌ {error}</Text>
				<Text style={styles.emptyText}>Try again in a moment</Text>
			</View>
		);
	}

	if (games.length === 0) {
		return (
			<View style={styles.emptyContainer}>
				<Text style={styles.emptyText}>No free games available right now</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<FlatList
				data={games}
				renderItem={({ item }) => (
					<GameCard game={item} onAddToWishlist={handleAddToWishlist} showPrice={false} />
				)}
				keyExtractor={(item) => item.id.toString()}
				contentContainerStyle={styles.listContent}
				scrollIndicatorInsets={{ right: 1 }}
			/>
		</View>
	);
}
