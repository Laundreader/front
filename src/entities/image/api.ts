import { http } from "@/shared/api";

import type { Options } from "ky";
import type { HttpResponseSuccess } from "@/shared/api";
import type { ImageValidationRequest, ImageValidationResponse } from "./model";

export async function validateImage(
	imageValidationRequest: ImageValidationRequest,
	options?: Options,
): Promise<boolean> {
	const response = await http
		.post<HttpResponseSuccess<ImageValidationResponse>>("image/validation", {
			...options,
			json: imageValidationRequest,
		})
		.json();

	return response.data.image.valid;
}
