import z from "zod";

export const laundrySynbolSchema = z.object({
	code: z.string(),
	description: z.string(),
});

export const careLabelAnalysisSchema = z
	.object({
		materials: z.array(z.string()),
		color: z.string(),
		type: z.string(),
		hasPrintOrTrims: z.boolean(),
		additionalInfo: z.array(z.string()),
		laundrySymbols: z.object({
			waterWashing: z.array(laundrySynbolSchema),
			bleaching: z.array(laundrySynbolSchema),
			ironing: z.array(laundrySynbolSchema),
			dryCleaning: z.array(laundrySynbolSchema),
			wetCleaning: z.array(laundrySynbolSchema),
			wringing: z.array(laundrySynbolSchema),
			naturalDrying: z.array(laundrySynbolSchema),
			tumbleDrying: z.array(laundrySynbolSchema),
		}),
	})
	.check((ctx) => {
		const { materials, color, type, additionalInfo, laundrySymbols } =
			ctx.value;

		const emptyMaterial = materials.every((material) => material.length === 0);
		const emptyColor = color.length === 0;
		const emptyType = type.length === 0;
		const emptyAdditionalInfo = additionalInfo.every(
			(info) => info.length === 0,
		);
		const emptySymbols = Object.values(laundrySymbols).every(
			(symbols) => symbols.length === 0,
		);

		if (
			emptyMaterial &&
			emptyColor &&
			emptyType &&
			emptyAdditionalInfo &&
			emptySymbols
		) {
			ctx.issues.push({
				code: "custom",
				message: "Not a valid care label analysis",
				input: ctx.value,
			});
		}
	});

export type CareLabelAnalysis = z.infer<typeof careLabelAnalysisSchema>;
export type LaundrySymbol = z.infer<typeof laundrySynbolSchema>;
