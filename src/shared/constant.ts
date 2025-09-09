export const IMG_TYPE = ["label", "clothes"] as const;
export const IMG_FORMAT = ["jpg", "jpeg", "png"] as const;
export const SOLUTION_NAME = ["wash", "dry", "etc"] as const;
export const IMG_ANAYSIS_STEP = [
	"label",
	"clothes",
	"analysis",
	"analysing",
	"error",
] as const;
export const LAUNDRY_TIPS = [
	"🧂 이염 방지에는 '굵은 소금' 한 스푼!",
	"🍚 구김 심한 옷, '식초' 몇 방울이면 끝",
	"👕 티셔츠 목 늘어남 방지 = 세탁망 + 뒤집기",
	"🧦 양말은 짝지어 묶어서 세탁망에",
	"🌀 세탁기 냄새 잡는 비밀병기 = 베이킹소다 + 구연산",
];
export const QUZZES = [
	{
		question: "이염 방지에 '굵은 소금' 한 스푼이 도움이 된다.",
		answer: true,
		reason: "이염 방지에 '굵은 소금' 한 스푼이 도움이 됩니다.",
	},
	{
		question: "흰색 옷에 생긴 커피 얼룩은 뜨거운 물로 바로 헹구면 잘 빠진다.",
		answer: false,
		reason: "뜨거운 물은 얼룩을 고착시킬 수 있어 찬물로 먼저 헹궈야 합니다.",
	},
	{
		question: "울 소재 옷은 중성세제를 사용해야 한다.",
		answer: true,
		reason: "알칼리성 세제는 섬유 손상을 유발할 수 있습니다.",
	},
	{
		question: "데님 바지는 세탁기 강한 코스로 돌리는 것이 오래 입는 데 좋다.",
		answer: false,
		reason:
			"강한 코스는 색 빠짐 및 수축 위험이 있어 약한 코스나 손세탁을 권장합니다.",
	},
	{
		question: "세탁기 섬유유연제는 빨래 마지막 헹굼 단계에서 넣어야 한다.",
		answer: true,
		reason:
			"섬유유연제는 세제 성분이 먼저 제거된 후에 사용해야 효과가 높습니다.",
	},
	{
		question: "드라이클리닝 표시가 있는 옷은 반드시 드라이클리닝을 해야 한다.",
		answer: false,
		reason:
			"일부는 가정에서도 손세탁이 가능합니다. 단, 라벨 상세 지침 확인 필요해요.",
	},
	{
		question: "타월은 세탁망에 넣지 않고 단독 세탁하는 것이 좋다.",
		answer: true,
		reason: "세탁망에 넣으면 세탁력이 떨어지고, 보풀 제거 효과가 감소됩니다.",
	},
	{
		question: "빨래를 건조기에 넣기 전, 탈수 시간을 길게 하는 것이 좋다.",
		answer: false,
		reason: "탈수 과다 시 섬유 손상 및 주름이 심화되어 적정 탈수를 권장합니다.",
	},
	{
		question: "흰 셔츠의 땀 얼룩은 세탁 전에 베이킹소다로 문지르면 효과적이다.",
		answer: true,
		reason: "중탄산 나트륨이 단백질 성분 얼룩 제거에 도움이 됩니다.",
	},
	{
		question: "면 소재는 표백제를 사용해도 안전하다.",
		answer: false,
		reason:
			"염색 면은 색 빠짐 우려가 있으니, 표백제 사용 시 반드시 라벨 확인하세요.",
	},
	{
		question: "세탁기 필터는 한 달에 한 번 청소하는 게 적당하다.",
		answer: true,
		reason: "필터에 먼지나 이물질이 쌓이면 세탁력이 저하됩니다.",
	},
	{
		question: "의류 건조는 항상 직사광선에서 하는 게 좋다.",
		answer: false,
		reason:
			"색상·섬유가 변형될 수 있으니 특히 유색, 울, 실크는 그늘 건조를 권장합니다.",
	},
	{
		question: "이불 세탁 시 세탁기 용량의 80% 이상을 채워야 효율적이다.",
		answer: false,
		reason:
			"과도한 적재는 세탁 효율을 저하시킬 수 있어, 용량의 60~70%를 권장합니다.",
	},
];
