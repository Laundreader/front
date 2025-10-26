import { IMG_ANAYSIS_STEP } from "@/shared/constant";
import z from "zod";

export const laundryIdSearchSchema = z.object({
	laundryId: z.number().default(0),
});

export const laundryIdsSearchSchema = z.object({
	laundryIds: z.array(z.number().int().positive()).default([]),
});

export const wikiSearchSchema = z.object({
	category: z
		.enum(["careSymbols", "materials"])
		.optional()
		.default("careSymbols"),
});

export const ImgAnalysisStepEnum = z.enum(IMG_ANAYSIS_STEP);
export const imgAnalysisStepSearchSchema = z.object({
	step: ImgAnalysisStepEnum.default("label"),
});
