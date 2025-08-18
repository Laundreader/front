import z from "zod";

export const laundryIdSearchSchema = z.object({
	laundryId: z.number().int().positive(),
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
