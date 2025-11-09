import { useCallback, useSyncExternalStore } from "react";
import { authApi } from "@/entities/auth/api";
import { authStore } from "@/entities/auth/store";
import { userApi } from "@/entities/user/api";

export function useAuth() {
	const auth = useSyncExternalStore(authStore.subscribe, authStore.get);

	const login = useCallback(async () => {
		const user = await userApi.getUser().catch(() => null);
		authStore.set(user);
	}, []);

	const logout = useCallback(async () => {
		await authApi.logout();
		authStore.clear();
	}, []);

	const clear = useCallback(() => {
		authStore.clear();
	}, []);

	return { auth, login, logout, clear } as const;
}
