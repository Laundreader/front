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

			const groups: HamperSolutionResponse["groups"] = [
				{
					id: 1,
					name: "단독 세탁⛔️",
					solution: null,
					laundryIds: baskets[0],
				},
				{
					id: 2,
					name: "손세탁💦",
					solution: "30~40℃ 미지근한 물에서 중성세제 사용, 유사 색상끼리 세탁.",
					laundryIds: baskets[1],
				},
				{
					id: 3,
					name: "일반 세탁✨",
					solution: "세탁기 섬세 코스, 표백제 금지, 그늘 건조.",
					laundryIds: baskets[2],
				},
			].filter((group) => group.laundryIds.length > 0);

			return HttpResponse.json<HttpResponseSuccess<HamperSolutionResponse>>({
				data: { groups },
			});
		}),
	),
];
