const handlers = {};

export function on(eventName, handler) {
	if (!handlers[eventName]) handlers[eventName] = new Set();
	handlers[eventName].add(handler);
	return () => off(eventName, handler);
}

export function off(eventName, handler) {
	if (!handlers[eventName]) return;
	handlers[eventName].delete(handler);
	if (handlers[eventName].size === 0) delete handlers[eventName];
}

export function emit(eventName, payload) {
	if (!handlers[eventName]) return;
	for (const h of Array.from(handlers[eventName])) {
		try {
			h(payload);
		} catch (e) {
			console.error(`Error in event handler for ${eventName}:`, e);
		}
	}
}
