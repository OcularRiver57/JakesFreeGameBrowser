import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { useCheapShark } from "../hooks/useCheapShark";
import { buildGameStoreUrl } from "../APIs/getCheapSharkAPIs";

const styles = StyleSheet.create({
	container: {
		backgroundColor: "#1a2a1a",
		borderRadius: 8,
		padding: 12,
		marginVertical: 8,
		borderLeftColor: "#4CAF50",
		borderLeftWidth: 3,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 8,
		justifyContent: "space-between",
	},
	headerText: {
		color: "#fff",
		fontWeight: "600",
		fontSize: 14,
		flexDirection: "row",
		alignItems: "center",
	},
	priceRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 6,
	},
	priceLabel: {
		color: "#aaa",
		fontSize: 12,
	},
	priceValue: {
		color: "#fff",
		fontWeight: "bold",
		fontSize: 14,
	},
	bestPrice: {
		color: "#4CAF50",
		fontSize: 14,
	},
	savingsText: {
		color: "#FFC107",
		fontSize: 12,
		fontWeight: "600",
	},
	storeName: {
		color: "#999",
		fontSize: 11,
		marginTop: 4,
	},
	buyButton: {
		backgroundColor: "#4CAF50",
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 6,
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
	},
	buyButtonText: {
		color: "#fff",
		fontWeight: "600",
		fontSize: 12,
	},
	loadingContainer: {
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 12,
	},
	errorText: {
		color: "#ff6b6b",
		fontSize: 12,
		textAlign: "center",
	},
	noDataText: {
		color: "#999",
		fontSize: 12,
		textAlign: "center",
		fontStyle: "italic",
	},
});

const STORE_NAMES = {
	1: "Steam",
	2: "GamersGate",
	3: "GOG",
	4: "Humble Bundle",
	5: "UPlay",
	6: "GMG",
	7: "Direct2Drive",
	8: "Green Man Gaming",
	9: "PlayFireWorks",
	10: "Origin",
	11: "Ubisoft",
	12: "MacGameStore",
	13: "Windows Store",
	14: "Twitch",
	15: "Gamesrocket",
	16: "WinGameStore",
	17: "KalymbWord",
	18: "Epic",
	19: "Itch",
	20: "Indiegala",
	21: "GreenManGaming",
	22: "Fanatical",
	23: "Fanatical",
	24: "SteamGifts",
	25: "SteamGifts",
	26: "FalloutWebber",
	27: "GameDeals",
	28: "GameDeals",
	29: "GamePlanet",
	30: "Humble",
	31: "GOG",
	32: "itch",
	33: "GamersGate",
	34: "GOG",
	35: "GamesPlanet",
	36: "GamersGate",
	37: "2Game",
	38: "IndieGala",
	39: "WinGameStore",
	40: "Gamesplanet",
};

export function PriceComparison({ steamAppID, currentPrice, onOpenLink }) {
	const { loading, error, getPriceDeals } = useCheapShark();
	const [deals, setDeals] = useState([]);
	const [bestDeal, setBestDeal] = useState(null);

	useEffect(() => {
		if (!steamAppID) return;

		const fetchPriceData = async () => {
			const priceDeals = await getPriceDeals(steamAppID);
			setDeals(priceDeals);

			if (priceDeals.length > 0) {
				// Find the best (lowest) price
				const best = priceDeals.reduce((lowest, current) => {
					const currentPrice = Number(current.salePrice);
					const lowestPrice = Number(lowest.salePrice);
					return currentPrice < lowestPrice ? current : lowest;
				});

				setBestDeal(best);
			}
		};

		fetchPriceData();
	}, [steamAppID, getPriceDeals]);

	const handleBuyClick = async () => {
		if (!bestDeal) return;

		const gameUrl = buildGameStoreUrl(bestDeal);
		if (!gameUrl) return;

		try {
			await WebBrowser.openBrowserAsync(gameUrl);
		} catch (err) {
			console.error("Error opening browser:", err);
		}
	};

	if (loading) {
		return (
			<View style={styles.container}>
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="small" color="#4CAF50" />
					<Text style={styles.priceLabel}>Checking prices...</Text>
				</View>
			</View>
		);
	}

	if (error || deals.length === 0) {
		return null;
	}

	if (!bestDeal) {
		return null;
	}

	const savings = Number(bestDeal.savings) || 0;
	const hasSavings = savings > 0;
	const storeName = STORE_NAMES[bestDeal.storeID] || `Store ${bestDeal.storeID}`;

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.headerText}>
					<MaterialCommunityIcons name="tag-check" size={14} color="#4CAF50" /> Best Price
				</Text>
				{hasSavings && (
					<View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
						<Text style={styles.savingsText}>
							Save {savings.toFixed(0)}%
						</Text>
					</View>
				)}
			</View>

			<View style={styles.priceRow}>
				<Text style={styles.priceLabel}>Best Price:</Text>
				<Text style={[styles.priceValue, styles.bestPrice]}>
					${Number(bestDeal.salePrice).toFixed(2)}
				</Text>
			</View>

			{hasSavings && (
				<View style={styles.priceRow}>
					<Text style={styles.priceLabel}>Regular Price:</Text>
					<Text
						style={[
							styles.priceValue,
							{
								textDecorationLine: "line-through",
								color: "#999",
							},
						]}
					>
						${Number(bestDeal.normalPrice).toFixed(2)}
					</Text>
				</View>
			)}

			<Text style={styles.storeName}>Available at {storeName}</Text>

			{deals.length > 1 && (
				<Text style={[styles.storeName, { marginTop: 8, color: "#666" }]}>
					{deals.length} store{deals.length !== 1 ? "s" : ""} with this game
				</Text>
			)}

			<TouchableOpacity style={styles.buyButton} onPress={handleBuyClick}>
				<MaterialCommunityIcons name="cart" size={14} color="#fff" />
				<Text style={styles.buyButtonText}>Check Deal</Text>
			</TouchableOpacity>
		</View>
	);
}

export default PriceComparison;
