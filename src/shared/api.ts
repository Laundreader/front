import ky, { HTTPError } from "ky";

export type HttpResponseSuccess<T> = {
	data: T;
};
export type HttpResponseError = {
	error: string;
};

export const API_URL = import.meta.env.VITE_API_URL;
export const API_URL_PUBLIC = API_URL + "/public";

export const http = ky.create({
	prefixUrl: API_URL,
	retry: {
		limit: 1,
		statusCodes: [401],
		methods: [
			"get",
			"post",
			"put",
			"patch",
			"delete",
			"head",
			"options",
			"trace",
		],
	},
	timeout: false,
	credentials: "include",
	hooks: {
		beforeRetry: [
			async ({ error }) => {
				// 401 에러 시 token 재발급
				if (error instanceof HTTPError && error.response.status === 401) {
					try {
						// reissueToken 요청 (별도 ky 인스턴스 사용)
						const reissueResponse = await ky.post(`${API_URL}/auth/reissue`, {
							credentials: "include",
							timeout: false,
						});

						if (reissueResponse.ok === false) {
							// 재발급 실패하면 재시도 중단
							throw new Error("Token reissue failed");
						}
					} catch (reissueError) {
						// reissueToken 실패하면 재시도 중단
						throw reissueError;
					}
				}
			},
		],
	},
});
export const httpPublic = ky.create({
	prefixUrl: API_URL_PUBLIC,
	retry: 0,
	timeout: false,
});
