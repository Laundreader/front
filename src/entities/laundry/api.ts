import type {
	Laundry,
	LaundryBasketSolutionRequest,
	LaundryBasketSolutionResponse,
	LaundrySolutionRequest,
	LaundrySolutionResponse,
} from "./model";
import { laundryStore } from "@/idb";

export async function getLaundryDetail(
	laundryId: Laundry["id"],
): Promise<Laundry> {
	// return await laundryStore.get(laundryId);
	const laundry = laundryBasket.find((l) => l.id === laundryId);
	if (!laundry) {
		throw new Error(`Laundry with id ${laundryId} not found`);
	}
	return laundry;
}

export async function getLaundrySolution(
	laundry: LaundrySolutionRequest,
): Promise<LaundrySolutionResponse> {
	console.log(laundry);
	// const resposne = await fetch(
	// 	`${import.meta.env.VITE_API_URL}/user-api/laundry-solution/single`,
	// 	{
	// 		method: "POST",
	// 		body: JSON.stringify({
	// 			laundry,
	// 		}),
	// 	},
	// );

	// return await resposne.json();
	return Promise.resolve({
		additionalInfo: ["연회색 린넨 상의", "Sora 브랜드", "버튼 여밈"],
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
	// return await laundryStore.values();
	return Promise.resolve(laundryBasket);
}

export async function deleteLaundryFromBasket(
	laundryIds: Array<Laundry["id"]>,
): Promise<void> {
	await laundryStore.delmany(laundryIds);
}

export async function getLaundryBasketSolution(
	laundryIds: LaundryBasketSolutionRequest,
): Promise<LaundryBasketSolutionResponse> {
	console.log(laundryIds);
	await new Promise((resolve) => setTimeout(resolve, 3000));
	// const response = await fetch(
	// 	`${import.meta.env.VITE_API_URL}/user-api/laundry-solution/hamper`,
	// 	{
	// 		method: "POST",
	// 		body: JSON.stringify(laundryIds),
	// 	},
	// );
	if (Math.random() > 0.5) {
		throw new Error("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
	}

	// return await response.json();
	return Promise.resolve({
		groups: [
			{
				id: 1,
				name: "단독 세탁⛔️",
				solution: null,
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
			label: {
				format: "png",
				data: "https://picsum.photos/300/200?random=2",
			},
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
			real: {
				format: "jpg",
				data: "https://picsum.photos/400/300?random=3",
			},
			label: {
				format: "jpg",
				data: "https://picsum.photos/300/200?random=4",
			},
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
			label: {
				format: "jpg",
				data: "https://picsum.photos/300/200?random=6",
			},
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
			real: {
				format: "jpg",
				data: "https://picsum.photos/400/300?random=7",
			},
			label: {
				format: "jpg",
				data: "https://picsum.photos/300/200?random=8",
			},
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
			real: {
				format: "jpg",
				data: "https://picsum.photos/400/300?random=9",
			},
			label: {
				format: "jpg",
				data: "https://picsum.photos/300/200?random=10",
			},
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
			real: {
				format: "jpg",
				data: "https://picsum.photos/400/300?random=11",
			},
			label: {
				format: "jpg",
				data: "https://picsum.photos/300/200?random=12",
			},
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
			real: {
				format: "jpg",
				data: "https://picsum.photos/400/300?random=13",
			},
			label: {
				format: "jpg",
				data: "https://picsum.photos/300/200?random=14",
			},
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
			real: {
				format: "jpg",
				data: "https://picsum.photos/400/300?random=15",
			},
			label: {
				format: "jpg",
				data: "https://picsum.photos/300/200?random=16",
			},
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
			real: {
				format: "jpg",
				data: "https://picsum.photos/400/300?random=17",
			},
			label: {
				format: "jpg",
				data: "https://picsum.photos/300/200?random=18",
			},
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
			real: {
				format: "jpg",
				data: "https://picsum.photos/400/300?random=19",
			},
			label: {
				format: "jpg",
				data: "https://picsum.photos/300/200?random=20",
			},
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
			real: {
				format: "png",
				data: "https://picsum.photos/400/300?random=21",
			},
			label: {
				format: "jpg",
				data: "https://picsum.photos/300/200?random=22",
			},
		},
	},
];
