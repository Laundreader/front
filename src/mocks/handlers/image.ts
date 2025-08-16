import { http, HttpResponse } from "msw";
import { imageValidationRequestSchema } from "@/entities/image/model";

import type {
	ImageValidationRequest,
	ImageValidationResponse,
} from "@/entities/image/model";
import type { HttpResponseSuccess, HttpResponseError } from "@/shared/api";

export const imageHandlers = [
	http.post<
		never,
		ImageValidationRequest,
		HttpResponseSuccess<ImageValidationResponse> | HttpResponseError
	>("/image/validation", async ({ request }) => {
		let payload: unknown;

		try {
			payload = await request.json();
		} catch {
			return HttpResponse.json<HttpResponseError>(
				{ error: "Invalid JSON body" },
				{ status: 400 },
			);
		}

		const { success, data, error } =
			imageValidationRequestSchema.safeParse(payload);

		if (success === false) {
			const message = error.issues[0].message;

			return HttpResponse.json<HttpResponseError>(
				{ error: message },
				{ status: 400 },
			);
		}

		const isValid = data.image.data.startsWith("data:image/");

		return HttpResponse.json<HttpResponseSuccess<ImageValidationResponse>>({
			data: { image: { isValid } },
		});
	}),
];
