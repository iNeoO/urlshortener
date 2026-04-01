import {
	AuthHeaderPortalProvider,
	useAuthHeaderPortalContainer,
} from "./auth-header.portal";
import { Sidebar } from "./sidebar.layout";

export const AuthLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<AuthHeaderPortalProvider>
			<div className="min-h-screen bg-surface flex items-start gap-4 p-4">
				<Sidebar />
				<main className="flex-1 min-w-0">
					<AuthHeaderSlot />
					{children}
				</main>
			</div>
		</AuthHeaderPortalProvider>
	);
};

function AuthHeaderSlot() {
	const { setContainer } = useAuthHeaderPortalContainer();

	return (
		<div className="px-6 pt-6">
			<header className="mb-4 rounded-2xl border border-(--color-border) bg-(--color-panel) px-6 py-4 shadow-[0_12px_26px_rgba(0,0,0,0.42)] empty:hidden">
				<div ref={setContainer} />
			</header>
		</div>
	);
}
