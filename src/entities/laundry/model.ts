import z from "zod";
import { SOLUTION_NAME } from "@/shared/constant";
import { imageSchema } from "../image/model";

export type LaundryBeforeAnalysis = Omit<Laundry, "id" | "solutions">;
export type LaundryAfterAnalysis = Omit<Laundry, "solutions">;

export const laundrySymbolSchema = z.object({
	code: z.string(),
	description: z.string(),
});
export const solutionSchema = z.object({
	name: z.enum(SOLUTION_NAME),
	contents: z.string(),
});
export const laundrySchema = z.object({
	id: z.number(),
	materials: z.array(z.string()),
	color: z.string(),
	type: z.string(),
	hasPrintOrTrims: z.boolean(),
	laundrySymbols: z.array(laundrySymbolSchema),
	additionalInfo: z.array(z.string()).optional(),
	solutions: z.array(solutionSchema),
	images: z.array(imageSchema),
});

export const solutionGroupSchema = z.object({
	id: z.number(),
	name: z.string(),
	solution: z.string().nullable(),
	laundryIds: z.array(z.number()),
});

export const laundryAnalysisRequestSchema = z.object({
	labelImage: imageSchema,
	clothesImage: imageSchema.optional(),
});
export const laundryAnalysisResponseSchema = z.object({
	laundry: laundrySchema.omit({
		id: true,
		solutions: true,
		images: true,
	}),
});

export const laundrySolutionRequestSchema = z.object({
	laundry: laundrySchema.omit({
		id: true,
		solutions: true,
		images: true,
	}),
});
export const laundrySolutionResponseSchema = z.object({
	laundry: z.object({
		solutions: z.array(solutionSchema),
	}),
});

export const laundryBasketSolutionRequestSchema = z.object({
	laundries: z.array(
		laundrySchema.omit({
			images: true, // images는 제외
		}),
	),
});
export const laundryBasketSolutionResponseSchema = z.object({
	groups: z.array(solutionGroupSchema),
});

export type Laundry = z.infer<typeof laundrySchema>;
export type LaundryAnalysisRequest = z.infer<
	typeof laundryAnalysisRequestSchema
>;
export type LaundryAnalysisResponse = z.infer<
	typeof laundryAnalysisResponseSchema
>;
export type LaundrySolutionRequest = z.infer<
	typeof laundrySolutionRequestSchema
>;
export type LaundrySolutionResponse = z.infer<
	typeof laundrySolutionResponseSchema
>;
export type LaundryBasketSolutionRequest = z.infer<
	typeof laundryBasketSolutionRequestSchema
>;
export type LaundryBasketSolutionResponse = z.infer<
	typeof laundryBasketSolutionResponseSchema
>;
