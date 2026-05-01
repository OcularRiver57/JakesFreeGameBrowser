import { StyleSheet, View, Text, TouchableOpacity, Image } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";

const styles = StyleSheet.create({
	card: {
		backgroundColor: "#2a2a2a",
		borderRadius: 8,
		marginBottom: 12,
		overflow: "hidden",
		shadowColor: "#000",
		shadowOpacity: 0.3,
		shadowRadius: 4,
		elevation: 5,
	},
	cardImage: {
		width: "100%",
		height: 150,
		backgroundColor: "#1a1a1a",
	},
	cardContent: {
		padding: 12,
	},
	cardTitle: {
		fontSize: 16,
		fontWeight: "bold",
		color: "#fff",
		marginBottom: 6,
	},
	cardSubtitle: {
		fontSize: 12,
		color: "#aaa",
		marginBottom: 8,
	},
	cardFooter: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	priceTag: {
		paddingHorizontal: 12,
		paddingVertical: 6,
		backgroundColor: "#007AFF",
		borderRadius: 4,
	},
	priceText: {
		color: "#fff",
		fontWeight: "bold",
		fontSize: 14,
	},
	linkButton: {
		paddingHorizontal: 12,
		paddingVertical: 6,
		backgroundColor: "#444",
		borderRadius: 4,
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
	},
	linkButtonText: {
		color: "#fff",
		fontWeight: "600",
		fontSize: 12,
	},
	tagsContainer: {
		flexDirection: "row",
		gap: 6,
		marginBottom: 8,
		flexWrap: "wrap",
	},
	tag: {
		backgroundColor: "#1a4d80",
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 4,
	},
	tagText: {
		color: "#80c0ff",
		fontSize: 11,
	},
});

export function GameCard({ game, onAddToWishlist, showPrice = true }) {
	const handleOpenLink = async () => {
		if (game.open_giveaway_url) {
			await WebBrowser.openBrowserAsync(game.open_giveaway_url);
		}
	};

	// Format the game image with fallback
	const imageUri = game.image || game.thumbnail;
	const storeLabel = game.store || game.storeName || game.store_name || game.platform || game.platforms;
	const numericSalePrice = Number.parseFloat(String(game.salePrice ?? game.sale_price ?? ""));
	const isFree =
		game.is_free === true ||
		String(game.price ?? "").toLowerCase() === "free" ||
		numericSalePrice === 0 ||
		Boolean(game.open_giveaway_url || game.giveaway_url);
	const displayPrice =
		game.salePrice ?? game.sale_price ?? game.price ?? game.worth ?? game.normalPrice ?? game.normal_price;
	const shouldRenderPrice = showPrice && !isFree && displayPrice !== undefined && displayPrice !== null;

	return (
		<View style={styles.card}>
			{imageUri && (
				<Image
					source={{ uri: imageUri }}
					style={styles.cardImage}
					resizeMode="cover"
					onError={() => {
						// Image will show placeholder color if load fails
					}}
				/>
			)}

			<View style={styles.cardContent}>
				<Text style={styles.cardTitle} numberOfLines={2}>
					{game.title || game.name}
				</Text>

				{game.description && (
					<Text style={styles.cardSubtitle} numberOfLines={2}>
						{game.description}
					</Text>
				)}

				{(game.type || storeLabel) && (
					<View style={styles.tagsContainer}>
						{game.type && (
							<View style={styles.tag}>
								<Text style={styles.tagText}>{game.type}</Text>
							</View>
						)}
						{storeLabel && (
							<View style={styles.tag}>
								<Text style={styles.tagText}>{storeLabel}</Text>
							</View>
						)}
					</View>
				)}

				<View style={styles.cardFooter}>
					{shouldRenderPrice ? (
						<View style={styles.priceTag}>
							<Text style={styles.priceText}>{String(displayPrice)}</Text>
						</View>
					) : (
						<View />
					)}

					<TouchableOpacity style={styles.linkButton} onPress={handleOpenLink}>
						<MaterialCommunityIcons name="open-in-new" size={14} color="#fff" />
						<Text style={styles.linkButtonText}>Visit</Text>
					</TouchableOpacity>

					{onAddToWishlist && (
						<TouchableOpacity onPress={() => onAddToWishlist(game)}>
							<MaterialCommunityIcons name="heart-outline" size={20} color="#ff6b6b" />
						</TouchableOpacity>
					)}
				</View>
			</View>
		</View>
	);
}

export default GameCard;
