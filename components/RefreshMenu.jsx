import { StyleSheet, View, Modal, Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import { emit, on as onEvent, off as offEvent } from "../APIs/eventBus";
import { isDebugMode, toggleDebugMode } from "../APIs/debugMode";
import { useEffect } from "react";

const styles = StyleSheet.create({
	menuButton: {
		padding: 8,
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.7)",
		justifyContent: "flex-start",
		alignItems: "flex-end",
	},
	menu: {
		backgroundColor: "#2a2a2a",
		borderRadius: 8,
		marginTop: 40,
		marginRight: 12,
		minWidth: 150,
		overflow: "hidden",
	},
	menuItem: {
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderBottomColor: "#444",
		borderBottomWidth: 1,
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},
	menuItemLast: {
		borderBottomWidth: 0,
	},
	menuItemText: {
		color: "#fff",
		fontSize: 14,
		fontWeight: "500",
	},
	icon: {
		color: "#007AFF",
	},
});

export function RefreshMenu({ onRefresh, eventName = null, isLoading = false }) {
	const [visible, setVisible] = useState(false);
	const [debugEnabled, setDebugEnabled] = useState(isDebugMode());

	useEffect(() => {
		const unsub = onEvent("debug_mode_changed", (val) => {
			setDebugEnabled(Boolean(val));
		});
		return () => unsub && unsub();
	}, []);

	const handleRefresh = async () => {
		setVisible(false);
		if (eventName) {
			emit(eventName);
			return;
		}

		if (typeof onRefresh === "function") {
			await onRefresh();
		}
	};

	const handleToggleDebug = () => {
		setVisible(false);
		toggleDebugMode();
	};

	return (
		<>
			<TouchableOpacity
				style={styles.menuButton}
				onPress={() => setVisible(true)}
				disabled={isLoading}
			>
				<MaterialCommunityIcons
					name="dots-vertical"
					size={24}
					color="#007AFF"
				/>
			</TouchableOpacity>

			<Modal
				visible={visible}
				transparent={true}
				animationType="fade"
				onRequestClose={() => setVisible(false)}
			>
				<TouchableOpacity
					style={styles.modalOverlay}
					activeOpacity={1}
					onPress={() => setVisible(false)}
				>
					<View style={styles.menu}>
						<TouchableOpacity
							style={styles.menuItem}
							onPress={handleToggleDebug}
						>
							<MaterialCommunityIcons name="bug" size={18} style={styles.icon} />
							<Text style={styles.menuItemText}>
								{debugEnabled ? "Disable Debug Mode" : "Enable Debug Mode"}
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={[styles.menuItem, styles.menuItemLast]}
							onPress={handleRefresh}
							disabled={isLoading}
						>
							<MaterialCommunityIcons
								name="refresh"
								size={18}
								style={styles.icon}
							/>
							<Text style={styles.menuItemText}>
								{isLoading ? "Refreshing..." : "Refresh Data"}
							</Text>
						</TouchableOpacity>
					</View>
				</TouchableOpacity>
			</Modal>
		</>
	);
}
