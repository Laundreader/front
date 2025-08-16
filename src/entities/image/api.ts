import { http } from "@/shared/api";

import type { HttpResponseSuccess } from "@/shared/api";
import type { ImageValidationRequest, ImageValidationResponse } from "./model";

export async function validateImage(
	imageValidationRequest: ImageValidationRequest,
): Promise<boolean> {
	const response = await http
		.post<HttpResponseSuccess<ImageValidationResponse>>("image/validation", {
			json: imageValidationRequest,
		})
		.json();

	return response.data.image.isValid;
}
