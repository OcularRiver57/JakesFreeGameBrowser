import { Text, View, TouchableOpacity, StyleSheet, Linking } from "react-native";
import { useRouter } from "expo-router";

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#1a1a1a",
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 20,
	},
	header: {
		marginBottom: 40,
		alignItems: "center",
	},
	title: {
		fontSize: 32,
		fontWeight: "bold",
		color: "#fff",
		marginBottom: 8,
	},
	subtitle: {
		fontSize: 16,
		color: "#aaa",
	},
	buttonContainer: {
		width: "100%",
		gap: 16,
	},
	button: {
		backgroundColor: "#007AFF",
		paddingVertical: 16,
		paddingHorizontal: 24,
		borderRadius: 8,
		alignItems: "center",
		justifyContent: "center",
	},
	buttonText: {
		color: "#fff",
		fontSize: 18,
		fontWeight: "600",
	},
	footer: {
		position: "absolute",
		bottom: 16,
		left: 0,
		right: 0,
		alignItems: "center",
		paddingHorizontal: 20,
	},
	attributionText: {
		fontSize: 11,
		color: "#666",
		textAlign: "center",
		lineHeight: 16,
	},
	attributionLink: {
		color: "#0066cc",
		textDecorationLine: "underline",
	},
});

export default function Home() {
	const router = useRouter();

	const handleFreeGames = () => router.push("/(tabs)/free-games");
	const handleGameDeals = () => router.push("/(tabs)/game-deals");
	const handleWishlists = () => router.push("/(tabs)/wishlists");
	const handleOpenGamerPower = () => Linking.openURL("https://www.gamerpower.com");
	const handleOpenCheapShark = () => Linking.openURL("https://www.cheapshark.com");

	return (
		<View style={styles.container}>
			<View style={styles.header}>
			<Text style={styles.title}>Jake&apos;s Free Game Browser</Text>
				<Text style={styles.subtitle}>Find Free Games & Deals</Text>
			</View>

			<View style={styles.buttonContainer}>
				<TouchableOpacity style={styles.button} onPress={handleFreeGames}>
					<Text style={styles.buttonText}>&#127918; Free Games</Text>
				</TouchableOpacity>

				<TouchableOpacity style={styles.button} onPress={handleGameDeals}>
					<Text style={styles.buttonText}>Game Deals</Text>
				</TouchableOpacity>

				<TouchableOpacity style={styles.button} onPress={handleWishlists}>
					<Text style={styles.buttonText}>My Wishlists</Text>
				</TouchableOpacity>
			</View>

			<View style={styles.footer}>
				<Text style={styles.attributionText}>
					Game data provided by{" "}
					<TouchableOpacity onPress={handleOpenGamerPower}>
						<Text style={styles.attributionLink}>GamerPower.com</Text>
				</TouchableOpacity>
				{" "}and{" "}
				<TouchableOpacity onPress={handleOpenCheapShark}>
					<Text style={styles.attributionLink}>CheapShark</Text>
				</TouchableOpacity>
			</Text>
			</View>
		</View>
	);
}
