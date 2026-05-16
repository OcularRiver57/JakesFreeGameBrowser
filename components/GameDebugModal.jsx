import React from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.7)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    container: {
        backgroundColor: "#2a2a2a",
        width: "100%",
        maxWidth: 800,
        borderRadius: 10,
        padding: 12,
        maxHeight: "80%",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    title: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
    closeBtn: {
        padding: 6,
    },
    body: {
        backgroundColor: "#1a1a1a",
        borderRadius: 6,
        padding: 10,
    },
    jsonText: {
        color: "#ddd",
        fontFamily: "monospace",
        fontSize: 12,
    },
});

export default function GameDebugModal({ visible, onClose, data, title = "Game Data" }) {
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.title}>{title}</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Text style={{ color: "#fff" }}>Close</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: 20 }}>
                        <Text style={styles.jsonText} selectable>
                            {JSON.stringify(data, null, 2)}
                        </Text>
                    </ScrollView>

                    <View style={styles.linkBox}>
                        <Text style={styles.linkLabel}>Full Link used by Visit button</Text>
                        <Text style={styles.linkText} selectable>
                            {data && (data.link || data.storeLink || data.open_giveaway_url || data.giveaway_url || data.url || "")}
                        </Text>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
