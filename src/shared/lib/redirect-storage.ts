const REDIRECT_KEY = "redirect-after-login";
const REDIRECT_FALLBACK = "/";

/**
 * 로그인 후 리디렉션 경로를 세션 스토리지에 저장하고 가져오는 저장소
 */
export const redirectStorage = {
	get: () => {
		return sessionStorage.getItem(REDIRECT_KEY) ?? REDIRECT_FALLBACK;
	},
	set: (path: string) => {
		sessionStorage.setItem(REDIRECT_KEY, path);
	},
	clear: () => {
		sessionStorage.removeItem(REDIRECT_KEY);
	},
	fallback: REDIRECT_FALLBACK,
};
