import { http, HttpResponse } from "msw";
import {
	laundrySolutionRequestSchema,
	laundryAnalysisRequestSchema,
	laundryBasketSolutionRequestSchema,
} from "@/entities/laundry/model";
import { mockData } from "../mock-data";

import type {
	LaundrySolutionRequest,
	LaundrySolutionResponse,
	LaundryAnalysisRequest,
	LaundryAnalysisResponse,
	LaundryBasketSolutionRequest,
	LaundryBasketSolutionResponse,
} from "@/entities/laundry/model";
import type { HttpResponseSuccess, HttpResponseError } from "@/shared/api";

const API_URL = import.meta.env.VITE_API_URL;

export const laundryHandlers = [
	http.post<
		never,
		LaundryAnalysisRequest,
		HttpResponseSuccess<LaundryAnalysisResponse> | HttpResponseError
	>(API_URL + "/laundry/analysis", async ({ request }) => {
		let payload: unknown;

		try {
			payload = await request.json();
		} catch {
			return HttpResponse.json<HttpResponseError>(
				{ error: "Invalid JSON body" },
				{ status: 400 },
			);
		}

		const parsed = laundryAnalysisRequestSchema.safeParse(payload);
		if (parsed.success === false) {
			const message = parsed.error.issues[0].message;

			return HttpResponse.json<HttpResponseError>(
				{ error: message },
				{ status: 400 },
			);
		}

		const result: HttpResponseSuccess<LaundryAnalysisResponse> = {
			data: {
				laundry: {
					materials: [mockData.commerce.productMaterial()],
					color: mockData.color.human(),
					type: mockData.commerce.productName(),
					hasPrintOrTrims: mockData.datatype.boolean(),
					additionalInfo: [mockData.lorem.sentence()],
					laundrySymbols: [
						{
							code: "machineWash50",
							description:
								"물의 온도 최대 50℃에서 세탁기로 일반 세탁할 수 있다.",
						},
						{
							code: "doNotBleachOxygen",
							description: "산소계 표백제로 표백하면 안 된다.",
						},
						{ code: "doNotWring", description: "짜면 안 된다." },
					],
				},
			},
		};

		return HttpResponse.json(result);
	}),

	http.post<
		never,
		LaundrySolutionRequest,
		HttpResponseSuccess<LaundrySolutionResponse> | HttpResponseError
	>(API_URL + "/laundry/solution/single", async ({ request }) => {
		let payload: unknown;

		try {
			payload = await request.json();
		} catch {
			return HttpResponse.json<HttpResponseError>(
				{ error: "Invalid JSON body" },
				{ status: 400 },
			);
		}

		const parsed = laundrySolutionRequestSchema.safeParse(payload);
		if (parsed.success === false) {
			const message = parsed.error.issues[0].message;

			return HttpResponse.json<HttpResponseError>(
				{ error: message },
				{ status: 400 },
			);
		}

		const solutions: HttpResponseSuccess<LaundrySolutionResponse>["data"]["laundry"]["solutions"] =
			[
				{
					name: "wash",
					contents: mockData.lorem.sentence(),
				},
				{
					name: "dry",
					contents: mockData.lorem.sentence(),
				},
				{
					name: "etc",
					contents: mockData.lorem.sentence(),
				},
			];

		return HttpResponse.json<HttpResponseSuccess<LaundrySolutionResponse>>({
			data: {
				laundry: { solutions },
			},
		});
	}),

	http.post<
		never,
		LaundryBasketSolutionRequest,
		HttpResponseSuccess<LaundryBasketSolutionResponse> | HttpResponseError
	>(API_URL + "/laundry/solution/hamper", async ({ request }) => {
		let payload: unknown;

		try {
			payload = await request.json();
		} catch {
			return HttpResponse.json<HttpResponseError>(
				{ error: "Invalid JSON body" },
				{ status: 400 },
			);
		}

		const parsed = laundryBasketSolutionRequestSchema.safeParse(payload);
		if (parsed.success === false) {
			const message = parsed.error.issues[0].message;

			return HttpResponse.json<HttpResponseError>(
				{ error: message },
				{ status: 400 },
			);
		}

		const laundries = parsed.data.laundries;
		const baskets: Record<number, number[]> = { 0: [], 1: [], 2: [] };
		for (const laundry of laundries) {
			const basket = (laundry.id % 3) as 0 | 1 | 2;
			baskets[basket].push(laundry.id);
		}

		const groups: LaundryBasketSolutionResponse["groups"] = [
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

		return HttpResponse.json<
			HttpResponseSuccess<LaundryBasketSolutionResponse>
		>({
			data: { groups },
		});
	}),
];
