import {
	StyleSheet,
	View,
	FlatList,
	Text,
	TouchableOpacity,
	Modal,
	Alert,
	Share,
	ActivityIndicator,
	TextInput,
	Pressable,
	StatusBar,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { GameCard } from "../../components/GameCard";
import { PriceComparison } from "../../components/PriceComparison";
import { useWishlist } from "../../hooks/useWishlist";
import { wishlistStorage } from "../../hooks/wishlistStorage";

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#1a1a1a",
		paddingHorizontal: 12,
	},
	headerShell: {
		marginBottom: 16,
		paddingBottom: 12,
		borderBottomColor: "#333",
		borderBottomWidth: 1,
	},
	topBar: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: 12,
	},
	topBarActions: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	topIconButton: {
		width: 38,
		height: 38,
		borderRadius: 19,
		backgroundColor: "#2a2a2a",
		alignItems: "center",
		justifyContent: "center",
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
	menuOverlay: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.7)",
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 20,
	},
	menuCard: {
		width: "100%",
		maxWidth: 380,
		backgroundColor: "#2a2a2a",
		borderRadius: 12,
		padding: 16,
	},
	menuTitle: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#fff",
		marginBottom: 12,
	},
	menuItem: {
		paddingVertical: 12,
		paddingHorizontal: 12,
		borderRadius: 8,
		backgroundColor: "#1a1a1a",
		marginBottom: 10,
	},
	menuItemDisabled: {
		opacity: 0.6,
	},
	menuItemText: {
		color: "#fff",
		fontSize: 15,
		fontWeight: "600",
	},
	menuItemSubtext: {
		color: "#999",
		fontSize: 12,
		marginTop: 4,
	},
	renameInput: {
		backgroundColor: "#1a1a1a",
		color: "#fff",
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#444",
		paddingHorizontal: 12,
		paddingVertical: 10,
		marginBottom: 12,
	},
	menuButtons: {
		flexDirection: "row",
		gap: 10,
	},
	menuButton: {
		flex: 1,
		paddingVertical: 12,
		borderRadius: 8,
		alignItems: "center",
		justifyContent: "center",
	},
	menuButtonPrimary: {
		backgroundColor: "#007AFF",
	},
	menuButtonSecondary: {
		backgroundColor: "#444",
	},
	menuButtonText: {
		color: "#fff",
		fontWeight: "600",
	},
	gameCard: {
		marginBottom: 12,
	},
});

export default function WishlistDetailScreen() {
	const { id } = useLocalSearchParams();
	const router = useRouter();
	const { removeGameFromWishlist, exportWishlist, updateWishlistName } = useWishlist();
	const [wishlist, setWishlist] = useState(null);
	const [loading, setLoading] = useState(true);
	const [showMenu, setShowMenu] = useState(false);
	const [showRenameModal, setShowRenameModal] = useState(false);
	const [wishlistNameDraft, setWishlistNameDraft] = useState("");
	const [savingName, setSavingName] = useState(false);
	const wishlistId = Array.isArray(id) ? id[0] : id;
	const topPadding = (StatusBar.currentHeight || 0) + 12;

	const loadWishlistCallback = useCallback(async () => {
		try {
			setLoading(true);
			const data = await wishlistStorage.getWishlistById(wishlistId);
			if (data) {
				setWishlist(data);
				setWishlistNameDraft(data.name);
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
	}, [router, wishlistId]);

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
						await removeGameFromWishlist(wishlistId, gameId);
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
			const jsonData = await exportWishlist(wishlistId);
			await Share.share({
				message: `Check out my wishlist: ${wishlist.name}\n\n${jsonData}`,
				title: `Export: ${wishlist.name}`,
			});
		} catch (_err) {
			Alert.alert("Error", "Failed to export wishlist");
		}
	};

	const handleRenameWishlist = async () => {
		const nextName = wishlistNameDraft.trim();

		if (!nextName) {
			Alert.alert("Error", "Please enter a wishlist name");
			return;
		}

		try {
			setSavingName(true);
			await updateWishlistName(wishlistId, nextName);
			setWishlist((prev) => (prev ? { ...prev, name: nextName } : prev));
			setShowRenameModal(false);
			setShowMenu(false);
		} catch (_err) {
			Alert.alert("Error", "Failed to update wishlist name");
		} finally {
			setSavingName(false);
		}
	};

	const renderHeader = (subtitle) => (
		<View style={styles.headerShell}>
			<View style={styles.topBar}>
				<View style={{ flex: 1, paddingRight: 12 }}>
					<Text style={styles.headerTitle} numberOfLines={1}>
						{wishlist.name}
					</Text>
					<Text style={styles.headerSubtitle}>{subtitle}</Text>
				</View>
				<View style={styles.topBarActions}>
					<TouchableOpacity style={styles.topIconButton} onPress={() => router.back()}>
						<MaterialCommunityIcons name="arrow-left" size={20} color="#fff" />
					</TouchableOpacity>
					<TouchableOpacity style={styles.topIconButton} onPress={() => setShowMenu(true)}>
						<MaterialCommunityIcons name="dots-vertical" size={20} color="#fff" />
					</TouchableOpacity>
				</View>
			</View>
			<View style={styles.actions}>
				<TouchableOpacity style={styles.actionButton} onPress={handleExport}>
					<MaterialCommunityIcons name="share-variant" size={16} color="#fff" />
					<Text style={styles.actionButtonText}>Export</Text>
				</TouchableOpacity>
			</View>
		</View>
	);

	if (loading) {
		return (
			<View style={[styles.container, { paddingTop: topPadding }]}>
				<ActivityIndicator size="large" color="#007AFF" />
			</View>
		);
	}

	if (!wishlist) {
		return (
			<View style={[styles.container, { paddingTop: topPadding }]}>
				<View style={styles.emptyContainer}>
					<Text style={styles.emptyText}>Wishlist not found</Text>
				</View>
			</View>
		);
	}

	if (wishlist.games.length === 0) {
		return (
			<View style={[styles.container, { paddingTop: topPadding }]}>
				{renderHeader("No games added yet")}
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

	const getSteamAppID = (game) =>
		game.steamAppID || game.steamAppId || game.steam_app_id || game.appID || null;

	return (
		<View style={[styles.container, { paddingTop: topPadding }]}>
			{renderHeader(
				`${wishlist.games.length} game${wishlist.games.length !== 1 ? "s" : ""} • Total Value: $${totalWorth.toFixed(2)}`,
			)}

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
						{getSteamAppID(item) && <PriceComparison steamAppID={getSteamAppID(item)} />}
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

			<Modal visible={showMenu} transparent animationType="fade" onRequestClose={() => setShowMenu(false)}>
				<Pressable style={styles.menuOverlay} onPress={() => setShowMenu(false)}>
					<Pressable style={styles.menuCard} onPress={() => {}}>
						<Text style={styles.menuTitle}>Wishlist Menu</Text>
						<TouchableOpacity
							style={styles.menuItem}
							onPress={() => {
								setWishlistNameDraft(wishlist.name);
								setShowMenu(false);
								setShowRenameModal(true);
							}}
						>
							<Text style={styles.menuItemText}>Edit list name</Text>
							<Text style={styles.menuItemSubtext}>Change the wishlist title</Text>
						</TouchableOpacity>
						<View style={[styles.menuItem, styles.menuItemDisabled]}>
							<Text style={styles.menuItemText}>More options coming soon</Text>
							<Text style={styles.menuItemSubtext}>Future actions will live here</Text>
						</View>
						<TouchableOpacity style={[styles.menuButton, styles.menuButtonSecondary]} onPress={() => setShowMenu(false)}>
							<Text style={styles.menuButtonText}>Close</Text>
						</TouchableOpacity>
					</Pressable>
				</Pressable>
			</Modal>

			<Modal
				visible={showRenameModal}
				transparent
				animationType="fade"
				onRequestClose={() => setShowRenameModal(false)}
			>
				<Pressable style={styles.menuOverlay} onPress={() => setShowRenameModal(false)}>
					<Pressable style={styles.menuCard} onPress={() => {}}>
						<Text style={styles.menuTitle}>Edit list name</Text>
						<TextInput
							style={styles.renameInput}
							value={wishlistNameDraft}
							onChangeText={setWishlistNameDraft}
							placeholder="Wishlist name"
							placeholderTextColor="#666"
							maxLength={50}
						/>
						<View style={styles.menuButtons}>
							<TouchableOpacity
								style={[styles.menuButton, styles.menuButtonSecondary]}
								onPress={() => setShowRenameModal(false)}
								disabled={savingName}
							>
								<Text style={styles.menuButtonText}>Cancel</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={[styles.menuButton, styles.menuButtonPrimary]}
								onPress={handleRenameWishlist}
								disabled={savingName}
							>
								<Text style={styles.menuButtonText}>{savingName ? "Saving..." : "Save"}</Text>
							</TouchableOpacity>
						</View>
					</Pressable>
				</Pressable>
			</Modal>
		</View>
	);
}
