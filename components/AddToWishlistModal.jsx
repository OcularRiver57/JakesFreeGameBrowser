import { StyleSheet, View, Modal, Text, TouchableOpacity, ScrollView, TextInput, Alert, Pressable } from "react-native";
import { useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const styles = StyleSheet.create({
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
		fontSize: 18,
		fontWeight: "bold",
		color: "#fff",
		marginBottom: 16,
	},
	wishlistOption: {
		backgroundColor: "#1a1a1a",
		borderRadius: 8,
		paddingHorizontal: 14,
		paddingVertical: 12,
		marginBottom: 10,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	wishlistOptionText: {
		color: "#fff",
		fontSize: 14,
		flex: 1,
	},
	wishlistOptionCount: {
		color: "#999",
		fontSize: 12,
		marginLeft: 8,
	},
	createNewSection: {
		marginTop: 16,
		paddingTop: 16,
		borderTopColor: "#444",
		borderTopWidth: 1,
	},
	input: {
		backgroundColor: "#1a1a1a",
		color: "#fff",
		borderRadius: 6,
		paddingHorizontal: 12,
		paddingVertical: 10,
		marginBottom: 12,
		borderColor: "#444",
		borderWidth: 1,
	},
	buttonGroup: {
		flexDirection: "row",
		gap: 10,
	},
	cancelButton: {
		flex: 1,
		backgroundColor: "#444",
		paddingVertical: 10,
		borderRadius: 6,
		alignItems: "center",
	},
	createButton: {
		flex: 1,
		backgroundColor: "#007AFF",
		paddingVertical: 10,
		borderRadius: 6,
		alignItems: "center",
	},
	buttonText: {
		color: "#fff",
		fontWeight: "600",
	},
	emptyMessage: {
		color: "#999",
		fontSize: 12,
		textAlign: "center",
		paddingVertical: 16,
	},
	scrollContainer: {
		maxHeight: 300,
	},
});

export function AddToWishlistModal({
	visible,
	wishlists,
	onSelectWishlist,
	onCreateNew,
	onCancel,
}) {
	const [showCreateNew, setShowCreateNew] = useState(false);
	const [newWishlistName, setNewWishlistName] = useState("");

	const handleCreateNew = async () => {
		if (!newWishlistName.trim()) {
			Alert.alert("Error", "Please enter a wishlist name");
			return;
		}

		try {
			await onCreateNew(newWishlistName);
			setNewWishlistName("");
			setShowCreateNew(false);
		} catch (err) {
			Alert.alert("Error", err.message || "Failed to create wishlist");
		}
	};

	const handleSelectWishlist = (wishlistId) => {
		onSelectWishlist(wishlistId);
		setShowCreateNew(false);
		setNewWishlistName("");
	};

	return (
		<Modal
			visible={visible}
			transparent
			animationType="fade"
			onRequestClose={onCancel}
		>
			<Pressable style={styles.modalOverlay} onPress={onCancel}>
				<Pressable style={styles.modal} onPress={() => {}}>
					<Text style={styles.modalTitle}>Save to Wishlist</Text>

					{showCreateNew ? (
						<View>
							<TextInput
								style={styles.input}
								placeholder="Enter wishlist name"
								placeholderTextColor="#666"
								value={newWishlistName}
								onChangeText={setNewWishlistName}
								maxLength={50}
							/>
							<View style={styles.buttonGroup}>
								<TouchableOpacity
									style={styles.cancelButton}
									onPress={() => {
										setShowCreateNew(false);
										setNewWishlistName("");
									}}
								>
									<Text style={styles.buttonText}>Back</Text>
								</TouchableOpacity>
								<TouchableOpacity
									style={styles.createButton}
									onPress={handleCreateNew}
								>
									<Text style={styles.buttonText}>Create</Text>
								</TouchableOpacity>
							</View>
						</View>
					) : (
						<>
							<ScrollView style={styles.scrollContainer}>
								{wishlists && wishlists.length > 0 ? (
									wishlists.map((wishlist) => (
										<TouchableOpacity
											key={wishlist.id}
											style={styles.wishlistOption}
											onPress={() => handleSelectWishlist(wishlist.id)}
										>
											<View>
												<Text style={styles.wishlistOptionText}>
													{wishlist.name}
												</Text>
												<Text style={styles.wishlistOptionCount}>
													{wishlist.games?.length || 0} game
													{wishlist.games?.length !== 1 ? "s" : ""}
												</Text>
											</View>
											<MaterialCommunityIcons
												name="chevron-right"
												size={24}
												color="#007AFF"
											/>
										</TouchableOpacity>
									))
								) : (
									<Text style={styles.emptyMessage}>
										No wishlists yet. Create one below.
									</Text>
								)}
							</ScrollView>

							<View style={styles.createNewSection}>
								<TouchableOpacity
									onPress={() => setShowCreateNew(true)}
									style={styles.wishlistOption}
								>
									<Text style={styles.wishlistOptionText}>
										<MaterialCommunityIcons
											name="plus"
											size={16}
											color="#007AFF"
										/>{" "}
										Create New Wishlist
									</Text>
								</TouchableOpacity>
							</View>

							<TouchableOpacity
								style={styles.cancelButton}
								onPress={onCancel}
							>
								<Text style={styles.buttonText}>Cancel</Text>
							</TouchableOpacity>
						</>
					)}
					</Pressable>
				</Pressable>
		</Modal>
	);
}
