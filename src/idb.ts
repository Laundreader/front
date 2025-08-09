import {
	clear,
	createStore,
	del,
	delMany,
	get,
	getMany,
	set,
	values,
} from "idb-keyval";

const _laundryStore = createStore("laundreader", "laundry");

let currId = 1;

export const laundryStore = {
	clear: async () => clear(_laundryStore),
	del: async (id: number) => del(id, _laundryStore),
	get: async (id: number) => get(id, _laundryStore),
	set: async ({ id, value }: { id?: number; value: any }) => {
		if (id === undefined) {
			id = currId++;
		} else if (id >= currId) {
			currId = id + 1;
		}
		// id를 값에 추가
		value.id = id;
		await set(id, value, _laundryStore);

		return id;
	},
	delmany: async (ids: Array<number>) => {
		await delMany(ids, _laundryStore);
	},
	getMany: async (ids: Array<number>) => {
		return await getMany(ids, _laundryStore);
	},
	values: async () => {
		return await values(_laundryStore);
	},
};

// 사용자가 사진을 업로드한 경우
//

// const 라벨_사진 = {
// 	image: {
// 		format: "png", // png, jpg, jpeg 중 하나
// 		data: "lillka;po3plkef....", // base64 문자열 data uri 로 전달
// 	},
// };

// const 라벨분석_응답 = {
// 	materials: ["면"],
// 	color: "검정색",
// 	type: "",
// 	hasPrintOrTrims: true,
// 	additionalInfo: ["장식이 많아 보입니다.", "지퍼가 있습니다."],
// 	laundrySymbols: {
// 		waterWashing: [
// 			{
// 				code: "handWash30",
// 				description:
// 					"물의 온도 최대 30℃에서 손으로 약하게 손세탁할 수 있다(세탁기 사용 불가).",
// 			},
// 		],
// 		bleaching: [
// 			{
// 				code: "doNotBleachAny",
// 				description: "염소계 및 산소계 표백제로 표백하면 안 된다.",
// 			},
// 		],
// 		ironing: [],
// 		dryCleaning: [],
// 		wetCleaning: [],
// 		wringing: [
// 			{
// 				code: "wringMild",
// 				description:
// 					"손으로 짜는 경우에는 약하게 짜고, 원심 탈수기인 경우는 짧은 시간 안에 탈수한다.",
// 			},
// 		],
// 		naturalDrying: [
// 			{
// 				code: "lineDripDryShade",
// 				description: "탈수하지 않고, 옷걸이에 걸어 그늘에서 자연 건조한다.",
// 			},
// 		],
// 		tumbleDrying: [],
// 	},
// };

// const 단일세탁솔루션_요청 = {
// 	materials: ["면"],
// 	color: "검정색",
// 	type: "",
// 	hasPrintOrTrims: true,
// 	additionalInfo: ["물 빠짐 가능성.", "버튼 여밈"],
// 	laundrySymbols: [
// 		{
// 			code: "machineWash30",
// 			description: "물의 온도 최대 30℃에서 세탁기로 일반 세탁할 수 있다.",
// 		},
// 		{
// 			code: "doNotBleachWithAny",
// 			description: "염소계 및 산소계 표백제로 표백하면 안 된다.",
// 		},
// 	],
// 	image: {
// 		// 의류사진
// 		format: "png",
// 		data: "lillka;po3plkef....",
// 	},
// };

// const 단일세탁솔루션_응답 = {
// 	additionalInfo: ["연회색 린넨 상의", "Sora 브랜드", "버튼 여밈"],
// 	solutions: [
// 		{
// 			name: "wash",
// 			contents:
// 				"손세탁 또는 드라이클리닝을 선택할 수 있으며, 40℃ 이하의 미지근한 물에서 중성세제를 사용하여 부드럽게 세탁해야 합니다. 염소계나 산소계 표백제는 사용하지 마시고, 세탁 후에는 비틀어 짜지 말고 눌러서 물기를 제거한 다음 그늘에서 자연 건조하세요.",
// 		},
// 		{
// 			name: "dry",
// 			contents:
// 				"기계 건조는 피하고 자연 건조를 권장합니다. 건조 시에는 옷걸이에 걸어 그늘진 곳에서 천천히 말려주는 것이 좋습니다. 고온 다림질은 피하고 저온 다림질이 필요할 경우 천을 덮고 다려 주세요.",
// 		},
// 		{
// 			name: "etc",
// 			contents:
// 				"보관은 통풍이 잘 되고 습기가 없는 곳에서 하셔야 하며, 옷걸이를 사용하는 것이 좋습니다. 직사광선에 노출되지 않도록 주의하시고, 여름철에는 시원한 장소에 두세요.",
// 		},
// 	],
// };

// const 빨래바구니솔루션_요청 = {
// 	laundry: [
// 		{
// 			id: 1,
// 			materials: ["면"],
// 			color: "검정색",
// 			type: "",
// 			hasPrintOrTrims: true,
// 			laundrySymbols: [
// 				{
// 					code: "machineWash30",
// 					description: "물의 온도 최대 30℃에서 세탁기로 일반 세탁할 수 있다.",
// 				},
// 				{
// 					code: "doNotBleachWithAny",
// 					description: "염소계 및 산소계 표백제로 표백하면 안 된다.",
// 				},
// 			],
// 			additionalInfo: ["연회색 린넨 상의", "Sora 브랜드", "버튼 여밈"],
// 			solutions: [
// 				{
// 					name: "wash",
// 					contents:
// 						"손세탁 또는 드라이클리닝을 선택할 수 있으며, 40℃ 이하의 미지근한 물에서 중성세제를 사용하여 부드럽게 세탁해야 합니다. 염소계나 산소계 표백제는 사용하지 마시고, 세탁 후에는 비틀어 짜지 말고 눌러서 물기를 제거한 다음 그늘에서 자연 건조하세요.",
// 				},
// 				{
// 					name: "dry",
// 					contents:
// 						"기계 건조는 피하고 자연 건조를 권장합니다. 건조 시에는 옷걸이에 걸어 그늘진 곳에서 천천히 말려주는 것이 좋습니다. 고온 다림질은 피하고 저온 다림질이 필요할 경우 천을 덮고 다려 주세요.",
// 				},
// 				{
// 					name: "etc",
// 					contents:
// 						"보관은 통풍이 잘 되고 습기가 없는 곳에서 하셔야 하며, 옷걸이를 사용하는 것이 좋습니다. 직사광선에 노출되지 않도록 주의하시고, 여름철에는 시원한 장소에 두세요.",
// 				},
// 			],
// 		},
// 		{
// 			id: 2,
// 		},
// 	],
// };

// const 빨래바구니솔루션_응답 = {
// 	groups: [
// 		{
// 			id: 1,
// 			name: "단독 세탁⛔️",
// 			solution: null,
// 			laundryIds: [1, 2, 6],
// 		},
// 		{
// 			id: 2,
// 			name: "손세탁💦",
// 			solution:
// 				"30~40℃ 미지근한 물에서 중성세제 사용, 강하게 비비지 않기,\n유사 색상끼리 모아 세탁하세요.",
// 			laundryIds: [3, 4, 5, 8],
// 		},
// 		{
// 			id: 3,
// 			name: "일반 세탁✨",
// 			solution:
// 				"50℃ 이하 또는 30℃ 이하에서 세탁기 섬세한 코스 사용\n표백제 금지, 그늘에서 자연 건조하세요.",
// 			laundryIds: [7, 9],
// 		},
// 	],
// };
