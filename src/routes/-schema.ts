import z from "zod";

export const laundryIdsSearchSchema = z.object({
	laundryIds: z.array(z.number().int().positive()),
});

export const wikiSearchSchema = z.object({
	category: z.enum(["symbols", "materials"]).optional().default("symbols"),
});
