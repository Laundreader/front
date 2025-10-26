import z from "zod";
import { SOLUTION_NAME } from "@/shared/constant";
import { imageSchema } from "../image/model";

export const laundrySymbolSchema = z.object({
	code: z.string(),
	description: z.string(),
});
export const solutionSchema = z.object({
	name: z.enum(SOLUTION_NAME),
	contents: z.string(),
});
export const laundrySchemaLocal = z.object({
	id: z.number(),
	type: z.string(),
	color: z.string(),
	materials: z.array(z.string()),
	hasPrintOrTrims: z.boolean(),
	laundrySymbols: z.array(laundrySymbolSchema),
	additionalInfo: z.array(z.string()),
	solutions: z.array(solutionSchema),
	image: z.object({
		label: imageSchema.nullable(),
		clothes: imageSchema.nullable(),
	}),
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
		label: z.string().nullable(),
		clothes: z.string().nullable(),
	}),
});

export const solutionGroupSchema = z.object({
	id: z.number(),
	name: z.string(),
	solution: z.string().nullable(),
	laundries: z.array(
		z.object({ id: z.number(), thumbnail: z.string().nullable() }),
	),
});

export const laundryAnalysisRequestSchema = z.object({
	label: imageSchema.nullable(),
	clothes: imageSchema.nullable(),
});
export const laundryAnalysisResponseSchema = z.object({
	laundry: laundrySchemaLocal.omit({
		id: true,
		solutions: true,
		image: true,
	}),
});

export const laundrySolutionRequestSchema = z.object({
	laundry: laundrySchemaLocal.omit({
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
	laundryIds: z.array(z.number()),
});
export const hamperSolutionResponseSchema = z.object({
	groups: z.array(solutionGroupSchema),
});
export const laundryPreviewSchema = z.object({
	id: z.number(),
	thumbnail: z.string().nullable(),
});
export const addLaundryToHamperRequestSchema = laundrySchema.omit({
	id: true,
});

export type Laundry = z.infer<typeof laundrySchema>;
export type LaundryLocal = z.infer<typeof laundrySchemaLocal>;
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
export type LaundryPreview = z.infer<typeof laundryPreviewSchema>;
export type AddLaundryToHamperRequest = z.infer<
	typeof addLaundryToHamperRequestSchema
>;
