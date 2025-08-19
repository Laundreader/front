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
	// throw new ServerError("Not implemented in this environment");

	let labelAnalysis = {
		materials: ["면"],
		color: "검정색",
		type: "",
		hasPrintOrTrims: true,
		additionalInfo: ["장식이 많아 보입니다.", "지퍼가 있습니다."],
		laundrySymbols: {
			waterWashing: [
				{
					code: "handWash30",
					description:
						"물의 온도 최대 30℃에서 손으로 약하게 손세탁할 수 있다(세탁기 사용 불가).",
				},
			],
			bleaching: [
				{
					code: "doNotBleachAny",
					description: "염소계 및 산소계 표백제로 표백하면 안 된다.",
				},
			],
			ironing: [],
			dryCleaning: [],
			wetCleaning: [],
			wringing: [
				{
					code: "wringMild",
					description:
						"손으로 짜는 경우에는 약하게 짜고, 원심 탈수기인 경우는 짧은 시간 안에 탈수한다.",
				},
			],
			naturalDrying: [
				{
					code: "lineDripDryShade",
					description: "탈수하지 않고, 옷걸이에 걸어 그늘에서 자연 건조한다.",
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
