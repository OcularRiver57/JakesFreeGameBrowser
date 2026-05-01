import React from "react";
import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function TabsLayout() {
	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: "#007AFF",
				tabBarInactiveTintColor: "#666",
				tabBarStyle: {
					backgroundColor: "#1a1a1a",
					borderTopColor: "#333",
					paddingBottom: 8,
				},
				headerShown: true,
				headerStyle: {
					backgroundColor: "#1a1a1a",
					borderBottomColor: "#333",
				},
				headerTintColor: "#fff",
				headerTitleStyle: {
					fontWeight: "bold",
					fontSize: 18,
				},
			}}
		>
			<Tabs.Screen
				name="free-games"
				options={{
					title: "Free Games",
					tabBarLabel: "Free Games",
					tabBarIcon: ({ color, size }) => (
						<MaterialCommunityIcons name="gift" color={color} size={size} />
					),
					headerTitle: "Free Games",
				}}
			/>

			<Tabs.Screen
				name="game-deals"
				options={{
					title: "Game Deals",
					tabBarLabel: "Deals",
					tabBarIcon: ({ color, size }) => (
						<MaterialCommunityIcons name="tag-multiple" color={color} size={size} />
					),
					headerTitle: "Game Deals",
				}}
			/>

			<Tabs.Screen
				name="wishlists"
				options={{
					title: "My Wishlists",
					tabBarLabel: "Wishlists",
					tabBarIcon: ({ color, size }) => (
						<MaterialCommunityIcons name="bookmark" color={color} size={size} />
					),
					headerTitle: "My Wishlists",
				}}
			/>
		</Tabs>
	);
}
