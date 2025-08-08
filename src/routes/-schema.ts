import z from "zod";

export const laundryIdsSearchSchema = z.object({
	laundryIds: z.array(z.number().int().positive()),
});
