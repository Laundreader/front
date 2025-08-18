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
	type: z.string(),
	color: z.string(),
	materials: z.array(z.string()),
	hasPrintOrTrims: z.boolean(),
	laundrySymbols: z.array(laundrySymbolSchema),
	additionalInfo: z.array(z.string()),
	solutions: z.array(solutionSchema),
	image: z.object({
		label: imageSchema,
		clothes: imageSchema.nullable(),
	}),
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
		image: true,
	}),
});

export const laundrySolutionRequestSchema = z.object({
	laundry: laundrySchema.omit({
		id: true,
		solutions: true,
		image: true,
	}),
});
export const laundrySolutionResponseSchema = z.object({
	laundry: z.object({
		solutions: z.array(solutionSchema),
	}),
});

export const hamperSolutionRequestSchema = z.object({
	laundries: z.array(
		laundrySchema.omit({
			image: true,
		}),
	),
});
export const hamperSolutionResponseSchema = z.object({
	groups: z.array(solutionGroupSchema),
});

export type Laundry = z.infer<typeof laundrySchema>;
export type Solution = z.infer<typeof solutionSchema>;
export type SolutionGroup = z.infer<typeof solutionGroupSchema>;
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
export type HamperSolutionRequest = z.infer<typeof hamperSolutionRequestSchema>;
export type HamperSolutionResponse = z.infer<
	typeof hamperSolutionResponseSchema
>;
