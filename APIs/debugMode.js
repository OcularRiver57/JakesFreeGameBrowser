import { emit } from "./eventBus";

let DEBUG_MODE = false;

export function isDebugMode() {
    return DEBUG_MODE;
}

export function setDebugMode(value) {
    DEBUG_MODE = Boolean(value);
    try {
        emit("debug_mode_changed", DEBUG_MODE);
    } catch (e) {
        console.error("Failed to emit debug_mode_changed", e);
    }
}

export function toggleDebugMode() {
    setDebugMode(!DEBUG_MODE);
}

export default {
    isDebugMode,
    setDebugMode,
    toggleDebugMode,
};
