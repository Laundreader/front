import type {
	Laundry,
	LaundryBasketSolutionRequest,
	LaundryBasketSolutionResponse,
	LaundrySolutionRequest,
	LaundrySolutionResponse,
} from "./model";
import { laundryStore } from "@/idb";

const laundry: Laundry = {
	color: "검정색",
	hasPrintOrTrims: true,
	id: 8,
	images: {
		label: {
			format: "png",
			data: "",
		},
		real: {
			format: "jpg",
			data: "",
		},
	},
	laundrySymbols: [
		{
			code: "machineWash30",
			description: "물의 온도 최대 30℃에서 세탁기로 일반 세탁할 수 있다.",
		},
		{
			code: "doNotBleachWithAny",
			description: "염소계 및 산소계 표백제로 표백하면 안 된다.",
		},
	],
	solutions: [
		{
			name: "wash",
			contents:
				"손세탁 또는 드라이클리닝을 선택할 수 있으며, 40℃ 이하의 미지근한 물에서 중성세제를 사용하여 부드럽게 세탁해야 합니다. 염소계나 산소계 표백제는 사용하지 마시고, 세탁 후에는 비틀어 짜지 말고 눌러서 물기를 제거한 다음 그늘에서 자연 건조하세요.",
		},
		{
			name: "dry",
			contents:
				"기계 건조는 피하고 자연 건조를 권장합니다. 건조 시에는 옷걸이에 걸어 그늘진 곳에서 천천히 말려주는 것이 좋습니다. 고온 다림질은 피하고 저온 다림질이 필요할 경우 천을 덮고 다려 주세요.",
		},
		{
			name: "etc",
			contents:
				"보관은 통풍이 잘 되고 습기가 없는 곳에서 하셔야 하며, 옷걸이를 사용하는 것이 좋습니다. 직사광선에 노출되지 않도록 주의하시고, 여름철에는 시원한 장소에 두세요.",
		},
	],
	materials: ["면"],
	type: "상의",
};

export async function getLaundryDetail(
	laundryId: Laundry["id"],
): Promise<Laundry> {
	// const laundry = await laundryStore.get(laundryId);
	// if (!laundry) {
	// 	throw new Error(`Laundry with id ${laundryId} not found`);
	// }

	// return laundry as Laundry;

	console.log(laundryId);
	return Promise.resolve(laundry);
}

export async function getLaundrySolution(
	laundry: LaundrySolutionRequest,
): Promise<LaundrySolutionResponse> {
	// const resposne = await fetch(
	// 	`${import.meta.env.VITE_API_URL}/user-api/laundry-solution/single`,
	// 	{
	// 		method: "POST",
	// 		headers: {
	// 			"Content-Type": "application/json",
	// 		},
	// 		body: JSON.stringify({
	// 			laundry,
	// 		}),
	// 	},
	// );

	// if (!resposne.ok) {
	// 	const text = await resposne.text().catch(() => "");
	// 	throw new Error(
	// 		`Failed to get laundry solution: ${resposne.status} ${text}`,
	// 	);
	// }

	// return (await resposne.json()) as LaundrySolutionResponse;

	console.log(laundry);
	return Promise.resolve({
		additionalInfo: ["연회색 린넨 상의", "Sora 브랜드", "버튼 여밈"], // 추가 입력한 사진으로 update한 추론 정보, 화면에 표시 X, 분석 전용
		solutions: [
			{
				name: "wash",
				contents:
					"손세탁 또는 드라이클리닝을 선택할 수 있으며, 40℃ 이하의 미지근한 물에서 중성세제를 사용하여 부드럽게 세탁해야 합니다. 염소계나 산소계 표백제는 사용하지 마시고, 세탁 후에는 비틀어 짜지 말고 눌러서 물기를 제거한 다음 그늘에서 자연 건조하세요.",
			},
			{
				name: "dry",
				contents:
					"기계 건조는 피하고 자연 건조를 권장합니다. 건조 시에는 옷걸이에 걸어 그늘진 곳에서 천천히 말려주는 것이 좋습니다. 고온 다림질은 피하고 저온 다림질이 필요할 경우 천을 덮고 다려 주세요.",
			},
			{
				name: "etc",
				contents:
					"보관은 통풍이 잘 되고 습기가 없는 곳에서 하셔야 하며, 옷걸이를 사용하는 것이 좋습니다. 직사광선에 노출되지 않도록 주의하시고, 여름철에는 시원한 장소에 두세요.",
			},
		],
	});
}

export function addLaundryToBasket() {}

export async function getLaundryBasket(): Promise<Array<Laundry>> {
	const values = (await laundryStore.values()) as Array<unknown>;
	const withSolutions = values.filter((v): v is Laundry => {
		const lv = v as Partial<Laundry> | undefined;
		if (!lv || !Array.isArray(lv.solutions)) return false;
		if (lv.solutions.length === 0) return false;

		const hasValid = lv.solutions.some((s: any) => {
			const validName =
				s && (s.name === "wash" || s.name === "dry" || s.name === "etc");
			const validContents =
				typeof s?.contents === "string" && s.contents.trim().length > 0;
			return validName && validContents;
		});

		return hasValid;
	});

	return withSolutions;
}

export async function deleteLaundryFromBasket(
	laundryIds: Array<Laundry["id"]>,
): Promise<void> {
	await laundryStore.delmany(laundryIds);
}

export async function getLaundryBasketSolution(
	laundryIds: LaundryBasketSolutionRequest,
): Promise<LaundryBasketSolutionResponse> {
	// const response = await fetch(
	// 	`${import.meta.env.VITE_API_URL}/user-api/laundry-solution/hamper`,
	// 	{
	// 		method: "POST",
	// 		headers: {
	// 			"Content-Type": "application/json",
	// 		},
	// 		body: JSON.stringify(laundryIds),
	// 	},
	// );

	// if (!response.ok) {
	// 	const text = await response.text().catch(() => "");
	// 	throw new Error(
	// 		`Failed to get laundry basket solution: ${response.status} ${text}`,
	// 	);
	// }

	// return (await response.json()) as LaundryBasketSolutionResponse;
	console.log(laundryIds);
	return Promise.resolve({
		groups: [
			{
				id: 1,
				name: "단독 세탁⛔️",
				solution: null, // 단독 세탁은 솔수션 없음
				laundryIds: [1, 2, 6],
			},
			{
				id: 2,
				name: "손세탁💦",
				solution:
					"30~40℃ 미지근한 물에서 중성세제 사용, 강하게 비비지 않기,\n유사 색상끼리 모아 세탁하세요.",
				laundryIds: [3, 4, 5, 8],
			},
			{
				id: 3,
				name: "일반 세탁✨",
				solution:
					"50℃ 이하 또는 30℃ 이하에서 세탁기 섬세한 코스 사용\n표백제 금지, 그늘에서 자연 건조하세요.",
				laundryIds: [7, 9],
			},
		],
	});
}
