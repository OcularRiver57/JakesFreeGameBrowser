import {
	StyleSheet,
	View,
	FlatList,
	Text,
	TouchableOpacity,
	Modal,
	TextInput,
	Alert,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
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
		marginBottom: 16,
	},
	createButton: {
		backgroundColor: "#007AFF",
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderRadius: 6,
	},
	createButtonText: {
		color: "#fff",
		fontWeight: "600",
		fontSize: 14,
	},
	wishlistCard: {
		backgroundColor: "#2a2a2a",
		borderRadius: 8,
		marginBottom: 12,
		padding: 16,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	wishlistInfo: {
		flex: 1,
	},
	wishlistName: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#fff",
		marginBottom: 4,
	},
	wishlistStats: {
		fontSize: 12,
		color: "#999",
	},
	wishlistActions: {
		flexDirection: "row",
		gap: 12,
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.7)",
		justifyContent: "center",
		alignItems: "center",
	},
	modal: {
		backgroundColor: "#2a2a2a",
		borderRadius: 12,
		padding: 20,
		width: "85%",
		maxWidth: 400,
	},
	modalTitle: {
		fontSize: 20,
		fontWeight: "bold",
		color: "#fff",
		marginBottom: 16,
	},
	input: {
		backgroundColor: "#1a1a1a",
		color: "#fff",
		borderRadius: 6,
		paddingHorizontal: 12,
		paddingVertical: 10,
		marginBottom: 16,
		fontSize: 16,
		borderColor: "#444",
		borderWidth: 1,
	},
	modalButtons: {
		flexDirection: "row",
		gap: 12,
	},
	cancelButton: {
		flex: 1,
		backgroundColor: "#444",
		paddingVertical: 12,
		borderRadius: 6,
		alignItems: "center",
	},
	submitButton: {
		flex: 1,
		backgroundColor: "#007AFF",
		paddingVertical: 12,
		borderRadius: 6,
		alignItems: "center",
	},
	buttonText: {
		color: "#fff",
		fontWeight: "600",
	},
});

export default function WishlistsScreen() {
	const router = useRouter();
	const { wishlists, createWishlist, deleteWishlist } = useWishlist();
	const [showModal, setShowModal] = useState(false);
	const [newListName, setNewListName] = useState("");

	const handleCreateWishlist = async () => {
		if (!newListName.trim()) {
			Alert.alert("Error", "Please enter a wishlist name");
			return;
		}

		try {
			await createWishlist(newListName);
			setNewListName("");
			setShowModal(false);
		} catch (_err) {
			Alert.alert("Error", "Failed to create wishlist");
		}
	};

	const handleDeleteWishlist = (id) => {
		Alert.alert("Delete Wishlist", "Are you sure? This action cannot be undone.", [
			{ text: "Cancel", style: "cancel" },
			{
				text: "Delete",
				style: "destructive",
				onPress: async () => {
					try {
						await deleteWishlist(id);
					} catch (_err) {
						Alert.alert("Error", "Failed to delete wishlist");
					}
				},
			},
		]);
	};

	const handleOpenWishlist = (id) => {
		router.push({
			pathname: "/wishlist/[id]",
			params: { id },
		});
	};

	if (wishlists.length === 0 && !showModal) {
		return (
			<View style={styles.container}>
				<View style={styles.emptyContainer}>
					<Text style={styles.emptyText}>📚 No wishlists yet</Text>
					<Text style={styles.emptyText}>Create your first wishlist to start saving games!</Text>
					<TouchableOpacity style={styles.createButton} onPress={() => setShowModal(true)}>
						<Text style={styles.createButtonText}>+ Create Wishlist</Text>
					</TouchableOpacity>
				</View>

				<Modal
					visible={showModal}
					transparent
					animationType="fade"
					onRequestClose={() => setShowModal(false)}
				>
					<View style={styles.modalOverlay}>
						<View style={styles.modal}>
							<Text style={styles.modalTitle}>New Wishlist</Text>
							<TextInput
								style={styles.input}
								placeholder="Wishlist name"
								placeholderTextColor="#666"
								value={newListName}
								onChangeText={setNewListName}
								onSubmitEditing={handleCreateWishlist}
							/>
							<View style={styles.modalButtons}>
								<TouchableOpacity
									style={styles.cancelButton}
									onPress={() => {
										setShowModal(false);
										setNewListName("");
									}}
								>
									<Text style={styles.buttonText}>Cancel</Text>
								</TouchableOpacity>
								<TouchableOpacity style={styles.submitButton} onPress={handleCreateWishlist}>
									<Text style={styles.buttonText}>Create</Text>
								</TouchableOpacity>
							</View>
						</View>
					</View>
				</Modal>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<View style={{ flexDirection: "row", justifyContent: "flex-end", marginBottom: 12 }}>
				<TouchableOpacity style={styles.createButton} onPress={() => setShowModal(true)}>
					<Text style={styles.createButtonText}>+ New</Text>
				</TouchableOpacity>
			</View>

			<FlatList
				data={wishlists}
				renderItem={({ item }) => (
					<TouchableOpacity
						style={styles.wishlistCard}
						onPress={() => handleOpenWishlist(item.id)}
						activeOpacity={0.7}
					>
						<View style={styles.wishlistInfo}>
							<Text style={styles.wishlistName}>{item.name}</Text>
							<Text style={styles.wishlistStats}>
								{item.games.length} game{item.games.length !== 1 ? "s" : ""} •{" "}
								{new Date(item.updatedAt).toLocaleDateString()}
							</Text>
						</View>
						<View style={styles.wishlistActions}>
							<TouchableOpacity
								onPress={() => handleDeleteWishlist(item.id)}
								hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
							>
								<MaterialCommunityIcons name="delete" size={20} color="#ff6b6b" />
							</TouchableOpacity>
							<MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
						</View>
					</TouchableOpacity>
				)}
				keyExtractor={(item) => item.id}
				contentContainerStyle={styles.listContent}
				scrollIndicatorInsets={{ right: 1 }}
			/>

			<Modal
				visible={showModal}
				transparent
				animationType="fade"
				onRequestClose={() => setShowModal(false)}
			>
				<View style={styles.modalOverlay}>
					<View style={styles.modal}>
						<Text style={styles.modalTitle}>New Wishlist</Text>
						<TextInput
							style={styles.input}
							placeholder="Wishlist name"
							placeholderTextColor="#666"
							value={newListName}
							onChangeText={setNewListName}
							onSubmitEditing={handleCreateWishlist}
						/>
						<View style={styles.modalButtons}>
							<TouchableOpacity
								style={styles.cancelButton}
								onPress={() => {
									setShowModal(false);
									setNewListName("");
								}}
							>
								<Text style={styles.buttonText}>Cancel</Text>
							</TouchableOpacity>
							<TouchableOpacity style={styles.submitButton} onPress={handleCreateWishlist}>
								<Text style={styles.buttonText}>Create</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
		</View>
	);
}
