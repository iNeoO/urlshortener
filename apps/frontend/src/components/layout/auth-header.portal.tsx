import {
	createContext,
	type ReactNode,
	useContext,
	useMemo,
	useState,
} from "react";
import { createPortal } from "react-dom";

type AuthHeaderPortalContextValue = {
	container: HTMLDivElement | null;
	setContainer: (container: HTMLDivElement | null) => void;
};

const AuthHeaderPortalContext = createContext<
	AuthHeaderPortalContextValue | undefined
>(undefined);

export function AuthHeaderPortalProvider({
	children,
}: {
	children: ReactNode;
}) {
	const [container, setContainer] = useState<HTMLDivElement | null>(null);
	const value = useMemo(
		() => ({
			container,
			setContainer,
		}),
		[container],
	);

	return (
		<AuthHeaderPortalContext.Provider value={value}>
			{children}
		</AuthHeaderPortalContext.Provider>
	);
}

export function AuthHeaderPortal({ children }: { children: ReactNode }) {
	const context = useContext(AuthHeaderPortalContext);
	if (!context) {
		throw new Error(
			"AuthHeaderPortal must be used within AuthHeaderPortalProvider",
		);
	}

	if (!context.container) {
		return null;
	}

	return createPortal(children, context.container);
}

export function useAuthHeaderPortalContainer() {
	const context = useContext(AuthHeaderPortalContext);
	if (!context) {
		throw new Error(
			"useAuthHeaderPortalContainer must be used within AuthHeaderPortalProvider",
		);
	}
	return context;
}
