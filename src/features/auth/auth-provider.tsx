import { createContext, useEffect, useMemo, useState } from "react";
import { authStore } from "@/entities/auth/store";
import { useAuth } from "./use-auth";

import type { ReactNode } from "react";
import type { User } from "@/entities/user/model";

export type AuthContextValue = {
	isAuthenticated: boolean;
	user: User | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [isLoading, setIsLoading] = useState(true);
	const { auth, login } = useAuth();

	useEffect(() => {
		login()
			.catch((err) => {
				console.error("AuthProvider login error:", err);
				authStore.set(null);
			})
			.finally(() => {
				setIsLoading(false);
			});
	}, []);

	const value = useMemo(
		() => ({
			user: auth.user,
			isAuthenticated: auth.isAuthenticated,
		}),
		[auth],
	);

	return (
		isLoading === false && (
			<AuthContext.Provider value={value}>{children}</AuthContext.Provider>
		)
	);
}
