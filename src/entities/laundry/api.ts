import type {
	Laundry,
	LaundryBasketSolutionRequest,
	LaundryBasketSolutionResponse,
} from "./model";

export async function getLaundryDetail(
	laundryId: Laundry["id"],
): Promise<Laundry> {
	const laundry = laundryBasket.find((item) => item.id === laundryId);
	if (!laundry) {
		throw new Error(`Laundry with id ${laundryId} not found`);
	}

	return laundry;
}

export function addLaundryToBasket() {}

export async function getLaundryBasket(): Promise<Array<Laundry>> {
	return await new Promise((resolve) => resolve(laundryBasket));
}

export async function deleteLaundryFromBasket(
	laundryIds: Array<Laundry["id"]>,
): Promise<void> {
	for (const laundryId of laundryIds) {
		const index = laundryBasket.findIndex((item) => item.id === laundryId);
		laundryBasket.splice(index, 1);
	}
}

export async function getLaundryBasketSolution(
	laundryIds: LaundryBasketSolutionRequest,
): Promise<LaundryBasketSolutionResponse> {
	await new Promise((resolve) => setTimeout(resolve, 5000));

	if (Math.random() < 0.6) {
		throw new Error("Network error: Unable to fetch laundry solution");
	}

	// IDB에서 laundryIds에 해당하는 세탁물들의 정보 가져오기
	console.log(laundryIds);

	return {
		groups: [
			{
				id: 1,
				name: "단독 세탁⛔️",
				solution: null, // 단독 세탁은 솔루션 없음
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
	};
}

const laundryBasket: Array<Laundry> = [
	{
		id: 1,
		materials: ["면"],
		color: "검정색",
		type: "티셔츠",
		hasPrintOrTrims: true,
		laundrySymbols: [
			{
				code: "machineWash30",
				description: "물의 온도 최대 30℃에서 세탁기로 일반 세탁할 수 있다.",
			},
			{
				code: "doNotBleachWithAny",
				description: "염소계 및 산소계 표백제로 표백하면 안 된다.",
			},
			{
				code: "tumbleDry60",
				description: "60℃를 초과하지 않는 온도에서 기계건조할 수 있다.",
			},
			{
				code: "iron120WithPressingCloth",
				description: "다리미 온도 최대 120℃로 헝겊을 덮고 다림질할 수 있다.",
			},
			{
				code: "dryCleanWithSpecialist",
				description:
					"드라이클리닝을 특수 전문점에서만 할 수 있다.\n특수 전문점이란 취급하기 어려운 가죽, 모피, 헤어 등의 제품을 전문적으로 취급하는 업소를 말한다.",
			},
		],
		additionalInfo: ["티셔츠입니다.", "장식이 많이 달려있습니다."],
		solutions: [
			{
				name: "wash",
				contents: "30℃ 이하의 찬물에서 중성세제를 사용하여 세탁하세요. 🧺",
			},
		],
		images: {
			label: "https://picsum.photos/300/200?random=2",
		},
	},
	{
		id: 2,
		materials: ["면"],
		color: "검정색",
		type: "셔츠",
		hasPrintOrTrims: false,
		laundrySymbols: [
			{
				code: "machineWash30",
				description: "물의 온도 최대 30℃에서 세탁기로 일반 세탁할 수 있다.",
			},
			{
				code: "doNotBleachWithAny",
				description: "염소계 및 산소계 표백제로 표백하면 안 된다.",
			},
			{
				code: "tumbleDry60",
				description: "60℃를 초과하지 않는 온도에서 기계건조할 수 있다.",
			},
			{
				code: "iron120WithPressingCloth",
				description: "다리미 온도 최대 120℃로 헝겊을 덮고 다림질할 수 있다.",
			},
			{
				code: "dryCleanWithSpecialist",
				description:
					"드라이클리닝을 특수 전문점에서만 할 수 있다.\n특수 전문점이란 취급하기 어려운 가죽, 모피, 헤어 등의 제품을 전문적으로 취급하는 업소를 말한다.",
			},
		],
		additionalInfo: ["티셔츠입니다.", "장식이 많이 달려있습니다."],
		solutions: [
			{
				name: "dry",
				contents: "찬물 세탁 후 자연건조를 권장합니다. ✨",
			},
		],
		images: {
			real: "https://picsum.photos/400/300?random=3",
			label: "https://picsum.photos/300/200?random=4",
		},
	},
	{
		id: 3,
		materials: ["면"],
		color: "검정색",
		type: "바지",
		hasPrintOrTrims: true,
		laundrySymbols: [
			{
				code: "machineWash30",
				description: "물의 온도 최대 30℃에서 세탁기로 일반 세탁할 수 있다.",
			},
			{
				code: "doNotBleachWithAny",
				description: "염소계 및 산소계 표백제로 표백하면 안 된다.",
			},
			{
				code: "tumbleDry60",
				description: "60℃를 초과하지 않는 온도에서 기계건조할 수 있다.",
			},
			{
				code: "iron120WithPressingCloth",
				description: "다리미 온도 최대 120℃로 헝겊을 덮고 다림질할 수 있다.",
			},
			{
				code: "dryCleanWithSpecialist",
				description:
					"드라이클리닝을 특수 전문점에서만 할 수 있다.\n특수 전문점이란 취급하기 어려운 가죽, 모피, 헤어 등의 제품을 전문적으로 취급하는 업소를 말한다.",
			},
		],
		additionalInfo: ["티셔츠입니다.", "장식이 많이 달려있습니다."],
		solutions: [
			{
				name: "wash",
				contents: "뒤집어서 세탁하고 그늘에서 건조하세요. 🌙",
			},
		],
		images: {
			label: "https://picsum.photos/300/200?random=6",
		},
	},
	{
		id: 4,
		materials: ["면"],
		color: "검정색",
		type: "원피스",
		hasPrintOrTrims: false,
		laundrySymbols: [
			{
				code: "machineWash30",
				description: "물의 온도 최대 30℃에서 세탁기로 일반 세탁할 수 있다.",
			},
			{
				code: "doNotBleachWithAny",
				description: "염소계 및 산소계 표백제로 표백하면 안 된다.",
			},
			{
				code: "tumbleDry60",
				description: "60℃를 초과하지 않는 온도에서 기계건조할 수 있다.",
			},
			{
				code: "iron120WithPressingCloth",
				description: "다리미 온도 최대 120℃로 헝겊을 덮고 다림질할 수 있다.",
			},
			{
				code: "dryCleanWithSpecialist",
				description:
					"드라이클리닝을 특수 전문점에서만 할 수 있다.\n특수 전문점이란 취급하기 어려운 가죽, 모피, 헤어 등의 제품을 전문적으로 취급하는 업소를 말한다.",
			},
		],
		additionalInfo: ["티셔츠입니다.", "장식이 많이 달려있습니다."],
		solutions: [
			{
				name: "wash",
				contents: "섬세한 소재이므로 손세탁을 권장합니다. 💧",
			},
		],
		images: {
			real: "https://picsum.photos/400/300?random=7",
			label: "https://picsum.photos/300/200?random=8",
		},
	},
	{
		id: 5,
		materials: ["면"],
		color: "검정색",
		type: "스웨터",
		hasPrintOrTrims: true,
		laundrySymbols: [
			{
				code: "machineWash30",
				description: "물의 온도 최대 30℃에서 세탁기로 일반 세탁할 수 있다.",
			},
			{
				code: "doNotBleachWithAny",
				description: "염소계 및 산소계 표백제로 표백하면 안 된다.",
			},
			{
				code: "tumbleDry60",
				description: "60℃를 초과하지 않는 온도에서 기계건조할 수 있다.",
			},
			{
				code: "iron120WithPressingCloth",
				description: "다리미 온도 최대 120℃로 헝겊을 덮고 다림질할 수 있다.",
			},
			{
				code: "dryCleanWithSpecialist",
				description:
					"드라이클리닝을 특수 전문점에서만 할 수 있다.\n특수 전문점이란 취급하기 어려운 가죽, 모피, 헤어 등의 제품을 전문적으로 취급하는 업소를 말한다.",
			},
		],
		additionalInfo: ["티셔츠입니다.", "장식이 많이 달려있습니다."],
		solutions: [
			{
				name: "dry",
				contents: "평평하게 눕혀서 건조하고 보관하세요. 🧶",
			},
		],
		images: {
			real: "https://picsum.photos/400/300?random=9",
			label: "https://picsum.photos/300/200?random=10",
		},
	},
	{
		id: 6,
		materials: ["면"],
		color: "검정색",
		type: "재킷",
		hasPrintOrTrims: false,
		laundrySymbols: [
			{
				code: "machineWash30",
				description: "물의 온도 최대 30℃에서 세탁기로 일반 세탁할 수 있다.",
			},
			{
				code: "doNotBleachWithAny",
				description: "염소계 및 산소계 표백제로 표백하면 안 된다.",
			},
			{
				code: "tumbleDry60",
				description: "60℃를 초과하지 않는 온도에서 기계건조할 수 있다.",
			},
			{
				code: "iron120WithPressingCloth",
				description: "다리미 온도 최대 120℃로 헝겊을 덮고 다림질할 수 있다.",
			},
			{
				code: "dryCleanWithSpecialist",
				description:
					"드라이클리닝을 특수 전문점에서만 할 수 있다.\n특수 전문점이란 취급하기 어려운 가죽, 모피, 헤어 등의 제품을 전문적으로 취급하는 업소를 말한다.",
			},
		],
		additionalInfo: ["티셔츠입니다.", "장식이 많이 달려있습니다."],
		solutions: [
			{
				name: "wash",
				contents: "전문 드라이클리닝점에서 관리하세요. 🏷️",
			},
		],
		images: {
			real: "https://picsum.photos/400/300?random=11",
			label: "https://picsum.photos/300/200?random=12",
		},
	},
	{
		id: 7,
		materials: ["면"],
		color: "검정색",
		type: "스커트",
		hasPrintOrTrims: true,
		laundrySymbols: [
			{
				code: "machineWash30",
				description: "물의 온도 최대 30℃에서 세탁기로 일반 세탁할 수 있다.",
			},
			{
				code: "doNotBleachWithAny",
				description: "염소계 및 산소계 표백제로 표백하면 안 된다.",
			},
			{
				code: "tumbleDry60",
				description: "60℃를 초과하지 않는 온도에서 기계건조할 수 있다.",
			},
			{
				code: "iron120WithPressingCloth",
				description: "다리미 온도 최대 120℃로 헝겊을 덮고 다림질할 수 있다.",
			},
			{
				code: "dryCleanWithSpecialist",
				description:
					"드라이클리닝을 특수 전문점에서만 할 수 있다.\n특수 전문점이란 취급하기 어려운 가죽, 모피, 헤어 등의 제품을 전문적으로 취급하는 업소를 말한다.",
			},
		],
		additionalInfo: ["티셔츠입니다.", "장식이 많이 달려있습니다."],
		solutions: [
			{
				name: "etc",
				contents: "중온에서 헝겊을 덮고 다림질하세요. 🔥",
			},
		],
		images: {
			real: "https://picsum.photos/400/300?random=13",
			label: "https://picsum.photos/300/200?random=14",
		},
	},
	{
		id: 8,
		materials: ["면"],
		color: "검정색",
		type: "블라우스",
		hasPrintOrTrims: false,
		laundrySymbols: [
			{
				code: "machineWash30",
				description: "물의 온도 최대 30℃에서 세탁기로 일반 세탁할 수 있다.",
			},
			{
				code: "doNotBleachWithAny",
				description: "염소계 및 산소계 표백제로 표백하면 안 된다.",
			},
			{
				code: "tumbleDry60",
				description: "60℃를 초과하지 않는 온도에서 기계건조할 수 있다.",
			},
			{
				code: "iron120WithPressingCloth",
				description: "다리미 온도 최대 120℃로 헝겊을 덮고 다림질할 수 있다.",
			},
			{
				code: "dryCleanWithSpecialist",
				description:
					"드라이클리닝을 특수 전문점에서만 할 수 있다.\n특수 전문점이란 취급하기 어려운 가죽, 모피, 헤어 등의 제품을 전문적으로 취급하는 업소를 말한다.",
			},
		],
		additionalInfo: ["티셔츠입니다.", "장식이 많이 달려있습니다."],
		solutions: [
			{
				name: "etc",
				contents: "형태 변형 방지를 위해 세탁망에 넣어 세탁하세요. 🧳",
			},
		],
		images: {
			real: "https://picsum.photos/400/300?random=15",
			label: "https://picsum.photos/300/200?random=16",
		},
	},
	{
		id: 9,
		materials: ["면"],
		color: "검정색",
		type: "조끼",
		hasPrintOrTrims: true,
		laundrySymbols: [
			{
				code: "machineWash30",
				description: "물의 온도 최대 30℃에서 세탁기로 일반 세탁할 수 있다.",
			},
			{
				code: "doNotBleachWithAny",
				description: "염소계 및 산소계 표백제로 표백하면 안 된다.",
			},
			{
				code: "tumbleDry60",
				description: "60℃를 초과하지 않는 온도에서 기계건조할 수 있다.",
			},
			{
				code: "iron120WithPressingCloth",
				description: "다리미 온도 최대 120℃로 헝겊을 덮고 다림질할 수 있다.",
			},
			{
				code: "dryCleanWithSpecialist",
				description:
					"드라이클리닝을 특수 전문점에서만 할 수 있다.\n특수 전문점이란 취급하기 어려운 가죽, 모피, 헤어 등의 제품을 전문적으로 취급하는 업소를 말한다.",
			},
		],
		additionalInfo: ["티셔츠입니다.", "장식이 많이 달려있습니다."],
		solutions: [
			{
				name: "dry",
				contents: "통풍이 잘 되는 곳에서 자연건조하세요. 🌬️",
			},
		],
		images: {
			real: "https://picsum.photos/400/300?random=17",
			label: "https://picsum.photos/300/200?random=18",
		},
	},
	{
		id: 10,
		materials: ["면"],
		color: "검정색",
		type: "코트",
		hasPrintOrTrims: false,
		laundrySymbols: [
			{
				code: "machineWash30",
				description: "물의 온도 최대 30℃에서 세탁기로 일반 세탁할 수 있다.",
			},
			{
				code: "doNotBleachWithAny",
				description: "염소계 및 산소계 표백제로 표백하면 안 된다.",
			},
			{
				code: "tumbleDry60",
				description: "60℃를 초과하지 않는 온도에서 기계건조할 수 있다.",
			},
			{
				code: "iron120WithPressingCloth",
				description: "다리미 온도 최대 120℃로 헝겊을 덮고 다림질할 수 있다.",
			},
			{
				code: "dryCleanWithSpecialist",
				description:
					"드라이클리닝을 특수 전문점에서만 할 수 있다.\n특수 전문점이란 취급하기 어려운 가죽, 모피, 헤어 등의 제품을 전문적으로 취급하는 업소를 말한다.",
			},
		],
		additionalInfo: ["티셔츠입니다.", "장식이 많이 달려있습니다."],
		solutions: [
			{
				name: "etc",
				contents: "시즌 후에는 깨끗하게 세탁 후 보관하세요. ❄️",
			},
		],
		images: {
			real: "https://picsum.photos/400/300?random=19",
			label: "https://picsum.photos/300/200?random=20",
		},
	},
	{
		id: 11,
		materials: ["면"],
		color: "검정색",
		type: "후드티",
		hasPrintOrTrims: true,
		laundrySymbols: [
			{
				code: "machineWash30",
				description: "물의 온도 최대 30℃에서 세탁기로 일반 세탁할 수 있다.",
			},
			{
				code: "doNotBleachWithAny",
				description: "염소계 및 산소계 표백제로 표백하면 안 된다.",
			},
			{
				code: "tumbleDry60",
				description: "60℃를 초과하지 않는 온도에서 기계건조할 수 있다.",
			},
			{
				code: "iron120WithPressingCloth",
				description: "다리미 온도 최대 120℃로 헝겊을 덮고 다림질할 수 있다.",
			},
			{
				code: "dryCleanWithSpecialist",
				description:
					"드라이클리닝을 특수 전문점에서만 할 수 있다.\n특수 전문점이란 취급하기 어려운 가죽, 모피, 헤어 등의 제품을 전문적으로 취급하는 업소를 말한다.",
			},
		],
		additionalInfo: ["티셔츠입니다.", "장식이 많이 달려있습니다."],
		solutions: [
			{
				name: "dry",
				contents: "후드 부분이 늘어나지 않도록 평평하게 건조하세요. 👕",
			},
		],
		images: {
			real: "https://picsum.photos/400/300?random=21",
			label: "https://picsum.photos/300/200?random=22",
		},
	},
];
