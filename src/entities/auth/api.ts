import { API_URL, http } from "@/shared/api";
import { oAuthProviderSchema } from "./model";

import type { OAuthProvider } from "./model";

async function login(provider: OAuthProvider) {
	const parsed = oAuthProviderSchema.safeParse(provider);
	if (parsed.error) {
		throw new Error('지원하지 않는 OAuth 제공자입니다.("naver"만 가능)');
	}

	window.location.href = `${API_URL}/oauth2/authorization/${parsed.data}`;
}

async function reissueToken(): Promise<void> {
	await http.post("auth/reissue").catch(() => {
		throw new Error("토큰 재발급에 실패했습니다.");
	});
}

async function logout(): Promise<void> {
	await http.post("auth/logout");
}

export const authApi = {
	login,
	logout,
	reissueToken,
};
