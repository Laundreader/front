import { API_URL } from "@/shared/api";
import { http, HttpResponse } from "msw";

export const authHandlers = [
	// MARK: OAuth 로그인
	http.get(API_URL + "/oauth2/authorization/:provider", ({ params }) => {
		const { provider } = params;
		if (provider !== "naver") {
			return HttpResponse.json(
				{ error: "Unsupported OAuth provider" },
				{ status: 400 },
			);
		}

		let success = true;

		if (success) {
			const headers = new Headers();
			headers.append(
				"Set-Cookie",
				"accessToken=mocked-access-token; Secure; Path=/",
			);
			headers.append(
				"Set-Cookie",
				"refreshToken=mocked-refresh-token; Secure; Path=/",
			);
			headers.append(
				"Location",
				"/auth/callback?success=true&nickname=MockUser&firstLogin=false",
			);

			return new HttpResponse(null, {
				status: 302,
				headers,
			});
		}

		return new HttpResponse(null, {
			status: 302,
			headers: {
				location: "/auth/callback?success=false&code=409&message=CONFLICT",
			},
		});
	}),

	http.get(API_URL + "/auth/callback", () => {
		const headers = new Headers();
		headers.append(
			"Set-Cookie",
			"accessToken=mocked-access-token; Secure; Path=/",
		);
		headers.append(
			"Set-Cookie",
			"refreshToken=mocked-refresh-token; Secure; Path=/",
		);
		headers.append(
			"Location",
			"/auth/callback?success=true&nickname=MockUser&firstLogin=false",
		);
		return HttpResponse.json(
			{
				success: true,
				message: "로그인에 성공했습니다!",
			},
			{
				status: 200,
				headers,
			},
		);
	}),

	// MARK: 토큰 재발급
	http.post(API_URL + "/auth/reissue", () => {
		const headers = new Headers();
		headers.append(
			"Set-Cookie",
			"accessToken=mocked-access-token; Secure; Path=/",
		);
		headers.append(
			"Set-Cookie",
			"refreshToken=mocked-refresh-token; Secure; Path=/",
		);

		return new HttpResponse(null, {
			status: 200,
			headers,
		});
	}),

	// MARK: 로그아웃
	http.post(API_URL + "/auth/logout", () => {
		const headers = new Headers();
		headers.append("Set-Cookie", "accessToken=; maxAge=0; Secure; Path=/");
		headers.append("Set-Cookie", "refreshToken=; maxAge=0; Secure; Path=/");

		return new HttpResponse(null, {
			status: 204,
			headers,
		});
	}),
];
