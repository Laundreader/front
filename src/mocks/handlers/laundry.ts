import { http, HttpResponse } from "msw";
import z from "zod";
import {
	laundrySolutionRequestSchema,
	laundryAnalysisRequestSchema,
} from "@/entities/laundry/model";
import { API_URL, API_URL_PUBLIC } from "@/shared/api";
import { laundryDb } from "../laundry-db";
import { mockData } from "../mock-data";

import type {
	LaundrySolutionRequest,
	LaundrySolutionResponse,
	LaundryAnalysisRequest,
	LaundryAnalysisResponse,
	Laundry,
} from "@/entities/laundry/model";
import type { HttpResponseSuccess, HttpResponseError } from "@/shared/api";
import { withAuth } from "../utils";

const newLaundrySchema = z.object({
	label: z.file().mime("image/jpeg").optional(),
	clothes: z.file().mime("image/jpeg").optional(),
	laundry: z.preprocess(
		(val) => {
			if (typeof val === "string") {
				try {
					return JSON.parse(val);
				} catch {
					return null;
				}
			}
			return null;
		},
		z.object({
			type: z.string().nonempty(),
			color: z.string().nonempty(),
			materials: z.string().array().nonempty(),
			hasPrintOrTrims: z.coerce.boolean(),
			additionalInfo: z.string().array(),
			laundrySymbols: z
				.object({
					code: z.string(),
					description: z.string(),
				})
				.array(),
			solutions: z
				.object({
					name: z.enum(["wash", "dry", "etc"]),
					contents: z.string().nonempty(),
				})
				.array(),
		}),
	),
});

export const laundryHandlers = [
	// MARK: 빨래 저장
	http.post<
		never,
		FormData,
		HttpResponseSuccess<Laundry["id"]> | HttpResponseError
	>(
		API_URL + "/laundry",
		withAuth(async ({ request }) => {
			const formData = await request.clone().formData();
			const formDataObj = Object.fromEntries(formData.entries());
			const parsed = newLaundrySchema.safeParse(formDataObj);
			if (parsed.success === false) {
				const { path, message } = parsed.error.issues[0];

				return HttpResponse.json<HttpResponseError>(
					{ error: `path: [${path.join(", ")}], message: ${message}` },
					{ status: 400 },
				);
			}

			const { laundry, label, clothes } = parsed.data;

			const laundryId = laundryDb.create({
				...laundry,
				image: {
					label: label ? { format: "jpeg", data: createMockImage() } : null,
					clothes: clothes ? { format: "jpeg", data: createMockImage() } : null,
				},
			});

			return HttpResponse.json<HttpResponseSuccess<Laundry["id"]>>({
				data: laundryId,
			});
		}),
	),

	// MARK: 빨래 조회
	http.get<{ id: string }>(API_URL + "/laundry/:id", async ({ params }) => {
		const { id: laundryId } = params;

		const found = laundryDb.findById(Number(laundryId));
		if (found === undefined) {
			return HttpResponse.json<HttpResponseError>(
				{ error: `Laundry with id ${laundryId} not found` },
				{ status: 404 },
			);
		}

		const laundry: Laundry = {
			...found,
			image: {
				label: found.image.label?.data ?? null,
				clothes: found.image.clothes?.data ?? null,
			},
		};

		return HttpResponse.json<HttpResponseSuccess<Laundry>>({
			data: laundry,
		});
	}),

	// MARK: 빨래 삭제
	http.post<{ id: string }>(API_URL + "/laundry/:id", async ({ params }) => {
		const id = Number(params.id);
		const laundry = laundryDb.findById(Number(id));
		if (laundry === undefined) {
			return HttpResponse.json<HttpResponseError>(
				{ error: `Laundry with id ${id} not found` },
				{ status: 404 },
			);
		}

		laundryDb.deleteById(id);

		return new HttpResponse(null, { status: 204 });
	}),

	// MARK: 빨래 분석
	http.post<
		never,
		LaundryAnalysisRequest,
		HttpResponseSuccess<LaundryAnalysisResponse> | HttpResponseError
	>(API_URL_PUBLIC + "/laundry/analysis", async ({ request }) => {
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

	// MARK: 빨래 솔루션
	http.post<
		never,
		LaundrySolutionRequest,
		HttpResponseSuccess<LaundrySolutionResponse> | HttpResponseError
	>(API_URL_PUBLIC + "/laundry/solution", async ({ request }) => {
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
			const { path, message } = parsed.error.issues[0];

			return HttpResponse.json<HttpResponseError>(
				{ error: `path: [${path.join(", ")}], message: ${message}` },
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

	http.post("/lkjsdkjf", async () => {
		let a = true;
		let b = false;
		if (a) {
			return HttpResponse.json({ firstname: "hello" });
		} else if (b) {
			return HttpResponse.error();
		}
		return new HttpResponse(null, { status: 204 });
	}),
];

function createMockImage() {
	return mockData.image.urlPicsumPhotos({ width: 200, height: 200 });
}
