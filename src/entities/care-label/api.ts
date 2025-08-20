import {
	careLabelAnalysisSchema,
	type CareLabelAnalysis,
} from "@/entities/care-label/model";

export async function getCareLabelAnalysis({
	imageData,
	imageFormat,
	isDev = true,
}: {
	imageData: string;
	imageFormat: "png" | "jpg" | "jpeg";
	isDev?: boolean;
}): Promise<CareLabelAnalysis> {
	const response = await fetch(
		`${import.meta.env.VITE_API_URL}/label-analysis`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				image: {
					format: imageFormat,
					data: imageData,
				},
			],
			tumbleDrying: [],
		},
	};

	// // let labelAnalysis = {
	// // 	materials: ["", ""],
	// // 	color: "",
	// // 	type: "",
	// // 	hasPrintOrTrims: false,
	// // 	additionalInfo: [],
	// // 	laundrySymbols: {
	// // 		waterWashing: [],
	// // 		bleaching: [],
	// // 		ironing: [],
	// // 		dryCleaning: [],
	// // 		wetCleaning: [],
	// // 		wringing: [],
	// // 		naturalDrying: [],
	// // 		tumbleDrying: [],
	// // 	},
	// // };

	if (isDev === false) {
		const response = await fetch(
			`${import.meta.env.VITE_API_URL}/user-api/label-analysis`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					image: {
						format: imageFormat,
						data: imageData,
					},
				}),
			},
		);

		if (response.ok === false) {
			if (response.status === 400) {
				const errorResponse = await response.json();
				throw new CareLabelImageError(errorResponse.error.message);
			}

			if (response.status === 500) {
				const errorResponse = await response.json();
				throw new ServerError(errorResponse.error.message);
			}

			throw new Error(`HTTP error! status: ${response.status}`);
		}

		labelAnalysis = await response.json();
	}

	const { success, error, data } =
		careLabelAnalysisSchema.safeParse(labelAnalysis);
	if (success === false) {
		throw new CareLabelImageError(error.issues[0].message);
	}

	return data;
}

export class CareLabelImageError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "CareLabelImageError";
	}
}

export class ServerError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "ServerError";
	}
}
