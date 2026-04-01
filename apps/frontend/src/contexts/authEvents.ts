type UnauthorizedHandler = () => void;

let onUnauthorized: UnauthorizedHandler | null = null;

export const setUnauthorizedHandler = (handler: UnauthorizedHandler | null) => {
	onUnauthorized = handler;
};

export const triggerUnauthorized = () => {
	if (onUnauthorized) onUnauthorized();
};
