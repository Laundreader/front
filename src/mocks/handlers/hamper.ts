import { http, HttpResponse } from "msw";
import { hamperSolutionRequestSchema } from "@/entities/laundry/model";
import { API_URL } from "@/shared/api";
import { laundryDb } from "../laundry-db";

import type {
	HamperSolutionRequest,
	HamperSolutionResponse,
	Laundry,
} from "@/entities/laundry/model";
import type { HttpResponseError, HttpResponseSuccess } from "@/shared/api";
import { withAuth } from "../utils";

export const hamperHandlers = [
	// MARK: 빨래 바구니 조회
	http.get(
		API_URL + "/hamper",
		withAuth(async () => {
			const laundries = laundryDb.findAll();
			const hamper = laundries.map((laundry) => ({
				id: laundry.id,
				thumbnail:
					laundry.image.clothes?.data ?? laundry.image.label?.data ?? null,
			}));

			return HttpResponse.json<
				HttpResponseSuccess<{
					hamper: Array<{ id: Laundry["id"]; thumbnail: string | null }>;
				}>
			>({
				data: { hamper },
			});
		}),
	),

	// MARK: 빨래 바구니 솔루션
	http.post<
		never,
		HamperSolutionRequest,
		HttpResponseSuccess<HamperSolutionResponse> | HttpResponseError
	>(
		API_URL + "/hamper/solution",
		withAuth(async ({ request }) => {
			let payload: unknown;

			try {
				payload = await request.json();
			} catch {
				return HttpResponse.json<HttpResponseError>(
					{ error: "Invalid JSON body" },
					{ status: 400 },
				);
			}

			const parsed = hamperSolutionRequestSchema.safeParse(payload);
			if (parsed.success === false) {
				const message = parsed.error.issues[0].message;

				return HttpResponse.json<HttpResponseError>(
					{ error: message },
					{ status: 400 },
				);
			}

			const laundryIds = parsed.data.laundryIds;
			const baskets: Record<number, number[]> = { 0: [], 1: [], 2: [] };
			for (const laundryId of laundryIds) {
				const basket = (laundryId % 3) as 0 | 1 | 2;
				baskets[basket].push(laundryId);
			}

			const groups = [
				{
					id: 1,
					name: "단독 세탁⛔️",
					solution: null,
					laundries: [
						{
							id: 12,
							thumbnail: null,
						},
						{
							id: 14,
							thumbnail: null,
						},
					],
				},
				{
					id: 2,
					name: "손세탁💦",
					solution:
						"- 울과 나일론 혼방이므로 30℃ 이하 온도에서 세탁기 사용 가능하나\n손세탁 또는 드라이클리닝을 우선 권장합니다.\n- 중성세제 사용, 표백제는 절대 사용하지 마세요.\n- 세탁 후 비틀어 짜지 말고 눌러서 물기 제거 후 그늘에서 자연 건조하세요.",
					laundries: [
						{
							id: 12,
							thumbnail: null,
						},
						{
							id: 14,
							thumbnail: null,
						},
					],
				},
				{
					id: 3,
					name: "일반 세탁✨",
					solution:
						"- 울과 나일론 혼방이므로 30℃ 이하 온도에서 세탁기 사용 가능하나\n손세탁 또는 드라이클리닝을 우선 권장합니다.\n- 중성세제 사용, 표백제는 절대 사용하지 마세요.\n- 세탁 후 비틀어 짜지 말고 눌러서 물기 제거 후 그늘에서 자연 건조하세요.",
					laundries: [
						{
							id: 12,
							thumbnail: null,
						},
						{
							id: 14,
							thumbnail: null,
						},
					],
				},
			].filter((group) => group.laundries.length > 0);

			return HttpResponse.json<HttpResponseSuccess<HamperSolutionResponse>>({
				data: { groups },
			});
		}),
	),
];
