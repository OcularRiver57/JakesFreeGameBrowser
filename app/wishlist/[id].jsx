import {
	StyleSheet,
	View,
	FlatList,
	Text,
	TouchableOpacity,
	Alert,
	Share,
	ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { GameCard } from "../../components/GameCard";
import { useWishlist } from "../../hooks/useWishlist";

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
	header: {
		marginBottom: 16,
		paddingBottom: 12,
		borderBottomColor: "#333",
		borderBottomWidth: 1,
	},
	headerTitle: {
		fontSize: 24,
		fontWeight: "bold",
		color: "#fff",
		marginBottom: 4,
	},
	headerSubtitle: {
		fontSize: 12,
		color: "#999",
		marginBottom: 12,
	},
	actions: {
		flexDirection: "row",
		gap: 8,
	},
	actionButton: {
		flex: 1,
		backgroundColor: "#444",
		paddingVertical: 10,
		borderRadius: 6,
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		gap: 6,
	},
	actionButtonText: {
		color: "#fff",
		fontWeight: "600",
		fontSize: 12,
	},
	gameCard: {
		marginBottom: 12,
	},
});

export default function WishlistDetailScreen() {
	const { id } = useLocalSearchParams();
	const router = useRouter();
	const { getWishlistById, removeGameFromWishlist, exportWishlist } = useWishlist();
	const [wishlist, setWishlist] = useState(null);
	const [loading, setLoading] = useState(true);

	const loadWishlistCallback = useCallback(() => {
		try {
			setLoading(true);
			const data = getWishlistById(id);
			if (data) {
				setWishlist(data);
			} else {
				Alert.alert("Error", "Wishlist not found");
				router.back();
			}
		} catch (_err) {
			Alert.alert("Error", "Failed to load wishlist");
			router.back();
		} finally {
			setLoading(false);
		}
	}, [id, getWishlistById, router]);

	useEffect(() => {
		loadWishlistCallback();
	}, [loadWishlistCallback]);



	const handleRemoveGame = (gameId) => {
		Alert.alert("Remove Game", "Remove this game from your wishlist?", [
			{ text: "Cancel", style: "cancel" },
			{
				text: "Remove",
				style: "destructive",
				onPress: async () => {
					try {
						await removeGameFromWishlist(id, gameId);
						// Update local state
						setWishlist((prev) => ({
							...prev,
							games: prev.games.filter((g) => g.id !== gameId),
						}));
					} catch (_err) {
						Alert.alert("Error", "Failed to remove game");
					}
				},
			},
		]);
	};

	const handleExport = async () => {
		try {
			const jsonData = await exportWishlist(id);
			await Share.share({
				message: `Check out my wishlist: ${wishlist.name}\n\n${jsonData}`,
				title: `Export: ${wishlist.name}`,
			});
		} catch (_err) {
			Alert.alert("Error", "Failed to export wishlist");
		}
	};

	if (loading) {
		return (
			<View style={styles.container}>
				<ActivityIndicator size="large" color="#007AFF" />
			</View>
		);
	}

	if (!wishlist) {
		return (
			<View style={styles.container}>
				<View style={styles.emptyContainer}>
					<Text style={styles.emptyText}>Wishlist not found</Text>
				</View>
			</View>
		);
	}

	if (wishlist.games.length === 0) {
		return (
			<View style={styles.container}>
				<View style={styles.header}>
					<Text style={styles.headerTitle}>{wishlist.name}</Text>
					<Text style={styles.headerSubtitle}>No games added yet</Text>
				</View>
				<View style={styles.emptyContainer}>
					<Text style={styles.emptyText}>📚 Your wishlist is empty</Text>
					<Text style={styles.emptyText}>Browse Free Games or Game Deals to add some!</Text>
				</View>
			</View>
		);
	}

	const totalWorth = wishlist.games.reduce((sum, game) => {
		const worth = parseFloat(String(game.worth || 0).replace(/[^0-9.-]/g, "")) || 0;
		return sum + worth;
	}, 0);

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.headerTitle}>{wishlist.name}</Text>
				<Text style={styles.headerSubtitle}>
					{wishlist.games.length} game{wishlist.games.length !== 1 ? "s" : ""} • Total Value: $
					{totalWorth.toFixed(2)}
				</Text>
				<View style={styles.actions}>
					<TouchableOpacity style={styles.actionButton} onPress={handleExport}>
						<MaterialCommunityIcons name="share-variant" size={16} color="#fff" />
						<Text style={styles.actionButtonText}>Export</Text>
					</TouchableOpacity>
				</View>
			</View>

			<FlatList
				data={wishlist.games}
				renderItem={({ item }) => (
					<View style={styles.gameCard}>
						<GameCard
							game={item}
							onAddToWishlist={() => {
								// Game already in wishlist, show remove option instead
								handleRemoveGame(item.id);
							}}
						/>
						<TouchableOpacity
							onPress={() => handleRemoveGame(item.id)}
							style={{
								padding: 8,
								backgroundColor: "#1a1a1a",
								marginTop: -8,
								borderRadius: 4,
								alignItems: "center",
							}}
						>
							<Text style={{ color: "#ff6b6b", fontWeight: "600" }}>Remove from Wishlist</Text>
						</TouchableOpacity>
					</View>
				)}
				keyExtractor={(item) => item.id}
				contentContainerStyle={styles.listContent}
				scrollIndicatorInsets={{ right: 1 }}
			/>
		</View>
	);
}
