import z from "zod";
import { IMG_FORMAT, IMG_TYPE } from "@/shared/constant";

export const imageSchema = z.object({
	format: z.enum(IMG_FORMAT),
	data: z.string(), // data uri 형식의 base64 문자열
});

export const imageValidationRequestSchema = z.object({
	type: z.enum(IMG_TYPE),
	image: imageSchema,
});
export const imageValidationResponseSchema = z.object({
	image: z.object({
		valid: z.boolean(),
	}),
});

export type Image = z.infer<typeof imageSchema>;
export type ImageValidationRequest = z.infer<
	typeof imageValidationRequestSchema
>;
export type ImageValidationResponse = z.infer<
	typeof imageValidationResponseSchema
>;
