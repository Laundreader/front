import type { CareLabelAnalysis } from "@/features/laundry/model";

export async function getCareLabelAnalysis({
	imageData,
	imageFormat,
}: {
	imageData: string;
	imageFormat: "png" | "jpg" | "jpeg";
}): Promise<CareLabelAnalysis> {
	console.log(imageData, imageFormat);
	// const response = await fetch(
	// 	`${import.meta.env.VITE_API_URL}/user-api/label-analysis`,
	// 	{
	// 		method: "POST",
	// 		headers: {
	// 			"Content-Type": "application/json",
	// 		},
	// 		body: JSON.stringify({
	// 			image: {
	// 				format: imageFormat,
	// 				data: imageData,
	// 			},
	// 		}),
	// 	},
	// );

	// if (!response.ok) {
	// 	if (response.status === 400) {
	// 		const errorData = await response.json();
	// 		throw new Error(errorData.messages || "세탁 라벨을 인식할 수 없습니다.");
	// 	}
	// 	throw new Error(`HTTP error! status: ${response.status}`);
	// }

	// return await response.json();

	return Promise.resolve({
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
	});
}
