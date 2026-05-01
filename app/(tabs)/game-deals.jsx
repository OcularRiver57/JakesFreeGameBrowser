import { StyleSheet, View, FlatList, ActivityIndicator, Text } from "react-native";
import { useState, useEffect, useCallback } from "react";
import { GameCard } from "../../components/GameCard";
import { getGamerPowerGiveaways } from "../../APIs/getSaleAPIs";
import { useWishlist } from "../../hooks/useWishlist";

function isFreeGame(game) {
	if (!game || typeof game !== "object") {
		return false;
	}

	const salePrice = Number.parseFloat(String(game.salePrice ?? game.sale_price ?? ""));

	if (Number.isFinite(salePrice) && salePrice === 0) {
		return true;
	}

	const rawPrice = String(game.price ?? "").trim().toLowerCase();
	if (rawPrice === "free" || rawPrice === "$0" || rawPrice === "0" || rawPrice === "0.00") {
		return true;
	}

	if (game.is_free === true) {
		return true;
	}

	// GamerPower giveaway links indicate the entry is a free giveaway.
	if (game.open_giveaway_url || game.giveaway_url) {
		return true;
	}

	return false;
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
	infoText: {
		color: "#999",
		fontSize: 12,
		marginTop: 8,
		textAlign: "center",
	},
});

export default function GameDealsScreen() {
	const [games, setGames] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const { addGameToWishlist } = useWishlist();

	const loadGameDeals = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);

			// Fetch all giveaways and sort by value (best deals first)
			const deals = await getGamerPowerGiveaways({
				sortBy: "value",
				order: "desc",
			});

			setGames(deals.filter((game) => !isFreeGame(game)));
		} catch (e) {
			console.error("Error loading game deals:", e);
			setError(e.message || "Failed to load game deals");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadGameDeals();
	}, [loadGameDeals]);

	const handleAddToWishlist = (game) => {
		addGameToWishlist({
			id: game.id || Math.random().toString(),
			title: game.title,
			image: game.image,
			url: game.open_giveaway_url,
			worth: game.worth,
			type: game.type,
			platform: game.platform,
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
				<Text style={styles.emptyText}>No paid game deals available right now</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<FlatList
				data={games}
				renderItem={({ item }) => (
					<GameCard game={item} onAddToWishlist={handleAddToWishlist} />
				)}
				keyExtractor={(item) => item.id.toString()}
				contentContainerStyle={styles.listContent}
				scrollIndicatorInsets={{ right: 1 }}
			/>
		</View>
	);
}
