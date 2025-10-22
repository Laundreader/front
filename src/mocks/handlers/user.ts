import { http, HttpResponse } from "msw";
import { API_URL } from "@/shared/api";
import { mockData } from "../mock-data";
import { withAuth } from "../utils";

export const userHandlers = [
	// MARK: 내 정보 조회
	http.get(
		API_URL + "/user/me",
		withAuth(() => {
			// if (cookies.accessToken === "") {
			// 	return HttpResponse.json(
			// 		{
			// 			status: 401,
			// 			error: "Unauthorized",
			// 		},
			// 		{ status: 401 },
			// 	);
			// }

			return HttpResponse.json({
				status: 200,
				data: {
					id: mockData.number.int(),
					nickname: mockData.person.fullName(),
					email: mockData.internet.email(),
				},
			});
		}),
	),

	// MARK: 탈퇴
	http.delete(
		API_URL + "/user",
		withAuth(() => {
			// if (cookies.accessToken === "") {
			// 	return HttpResponse.json(
			// 		{
			// 			status: 401,
			// 			error: "Unauthorized",
			// 		},
			// 		{ status: 401 },
			// 	);
			// }

			return new HttpResponse(null, { status: 200 });
		}),
	),
];
