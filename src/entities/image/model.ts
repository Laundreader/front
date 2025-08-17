import z from "zod";
import { IMG_TYPE, IMG_FORMAT } from "@/shared/constant";

export const imageSchema = z.object({
	type: z.enum(IMG_TYPE),
	format: z.enum(IMG_FORMAT),
	data: z.string(), // data uri 형식의 base64 문자열
});

export const imageValidationRequestSchema = z.object({
	image: imageSchema,
});
export const imageValidationResponseSchema = z.object({
	image: z.object({
		isValid: z.boolean(),
	}),
});

export type ImageValidationRequest = z.infer<
	typeof imageValidationRequestSchema
>;
export type ImageValidationResponse = z.infer<
	typeof imageValidationResponseSchema
>;
