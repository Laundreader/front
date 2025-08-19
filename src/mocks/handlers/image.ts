import { http, HttpResponse } from "msw";
import { imageValidationRequestSchema } from "@/entities/image/model";
import { mockData } from "../mock-data";

import type {
	ImageValidationRequest,
	ImageValidationResponse,
} from "@/entities/image/model";
import {
	type HttpResponseSuccess,
	type HttpResponseError,
	API_URL,
} from "@/shared/api";

export const imageHandlers = [
	http.post<
		never,
		ImageValidationRequest,
		HttpResponseSuccess<ImageValidationResponse> | HttpResponseError
	>(API_URL + "/image/validation", async ({ request }) => {
		let payload: unknown;

		try {
			payload = await request.json();
		} catch {
			return HttpResponse.json<HttpResponseError>(
				{ error: "Invalid JSON body" },
				{ status: 400 },
			);
		}

		const { success, error } = imageValidationRequestSchema.safeParse(payload);
		if (success === false) {
			const message = error.issues[0].message;

			return HttpResponse.json<HttpResponseError>(
				{ error: message },
				{ status: 400 },
			);
		}

		const isValid = mockData.datatype.boolean();

		return HttpResponse.json<HttpResponseSuccess<ImageValidationResponse>>({
			data: { image: { isValid } },
		});
	}),
];
