import { Sidebar } from "./sidebar.layout";

export const AuthLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<div className="min-h-screen flex items-start gap-4 p-4">
			<Sidebar />
			<main className="flex-1 min-w-0 min-h-[calc(100vh-2rem)] flex flex-col">
				{children}
			</main>
		</div>
	);
};
