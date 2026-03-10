import { useQueryClient } from "@tanstack/react-query";
import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { useLogin, useLogout } from "../hooks/query/auth.hook";
import type { User } from "../hooks/query/profile.hook";
import { checkAuth } from "../libs/api/auth.api";
import { client } from "../libs/hc";
import { router } from "../libs/router";
import { setUnauthorizedHandler } from "./authEvents";

type PostLoginParams = { email: string; password: string };

export type AuthState = {
	isAuthenticated: boolean;
	isLoading: boolean;
	user: User | null;
	login: (params: PostLoginParams) => Promise<void>;
	refreshProfile: () => Promise<void>;
	logout: () => Promise<void>;
	disconnect: () => void;
};

export const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const loginMutation = useLogin();
	const logoutMutation = useLogout();
	const queryClient = useQueryClient();

	const handleUnauthorized = useCallback(() => {
		setUser(null);
		setIsAuthenticated(false);
		queryClient.removeQueries({ queryKey: ["profile"] });
		router.navigate({
			to: "/login",
			search: { redirect: window.location.pathname },
		});
	}, [queryClient]);

	const fetchProfile = useCallback(async () => {
		const response = await queryClient.fetchQuery({
			queryKey: ["profile"],
			queryFn: async () => {
				const res = await client.profile.me.$get();
				const status = res.status as number;
				if (status === 401) {
					handleUnauthorized();
					throw new Error("Unauthorized");
				}
				if (!res.ok) throw new Error("Failed to fetch profile");
				return await res.json();
			},
		});

		return response;
	}, [queryClient, handleUnauthorized]);

	useEffect(() => {
		setUnauthorizedHandler(handleUnauthorized);
		return () => setUnauthorizedHandler(null);
	}, [handleUnauthorized]);

	useEffect(() => {
		(async () => {
			setIsLoading(true);
			try {
				const authenticated = await checkAuth();
				if (!authenticated) {
					setIsAuthenticated(false);
					setUser(null);
					queryClient.removeQueries({ queryKey: ["profile"] });
					return;
				}
				const response = await fetchProfile();
				setUser(response.data);
				setIsAuthenticated(true);
			} catch (error) {
				setIsAuthenticated(false);
				setUser(null);
				queryClient.removeQueries({ queryKey: ["profile"] });
				console.error("Error fetching profile:", error);
			} finally {
				setIsLoading(false);
			}
		})();
	}, [queryClient, fetchProfile]);

	const refreshProfile = useCallback(async () => {
		if (!isAuthenticated) return;
		try {
			const response = await fetchProfile();
			setUser(response.data);
		} catch (error) {
			setIsAuthenticated(false);
			setUser(null);
			queryClient.removeQueries({ queryKey: ["profile"] });
			console.error("Error fetching profile:", error);
		}
	}, [isAuthenticated, fetchProfile, queryClient]);

	const login = useCallback(
		async ({ email, password }: PostLoginParams) => {
			await loginMutation.mutateAsync({ email, password });
			const response = await fetchProfile();
			queryClient.setQueryData(["profile"], response);
			setUser(response.data);
			setIsAuthenticated(true);
		},
		[loginMutation, fetchProfile, queryClient],
	);

	const logout = useCallback(async () => {
		await logoutMutation.mutateAsync();
		setUser(null);
		setIsAuthenticated(false);
		queryClient.removeQueries({ queryKey: ["profile"] });
	}, [logoutMutation, queryClient]);

	const disconnect = useCallback(() => {
		setUser(null);
		setIsAuthenticated(false);
		queryClient.removeQueries({ queryKey: ["profile"] });
	}, [queryClient]);

	const authValue = useMemo(
		() => ({
			isAuthenticated,
			isLoading,
			user,
			login,
			refreshProfile,
			logout,
			disconnect,
		}),
		[
			isAuthenticated,
			isLoading,
			user,
			login,
			refreshProfile,
			logout,
			disconnect,
		],
	);

	return (
		<AuthContext.Provider value={authValue}>
			{isLoading ? <div>Loading...</div> : children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
