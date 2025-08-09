export const CARE_LABEL_SYMBOLS = {
	laundrySymbol: {
		waterWashing: [
			{
				code: "machineWash95",
				description: "물의 온도 최대 95℃에서 세탁기로 일반 세탁할 수 있다.",
			},
			{
				code: "machineWash70",
				description: "물의 온도 최대 70℃에서 세탁기로 일반 세탁할 수 있다.",
			},
			{
				code: "machineWash60",
				description: "물의 온도 최대 60℃에서 세탁기로 일반 세탁할 수 있다.",
			},
			{
				code: "machineWash60Mild",
				description: "물의 온도 최대 60℃에서 세탁기로 약하게 세탁할 수 있다.",
			},
			{
				code: "machineWash50",
				description: "물의 온도 최대 50℃에서 세탁기로 일반 세탁할 수 있다.",
			},
			{
				code: "machineWash50Mild",
				description: "물의 온도 최대 50℃에서 세탁기로 약하게 세탁할 수 있다.",
			},
			{
				code: "machineWash40",
				description: "물의 온도 최대 40℃에서 세탁기로 일반 세탁할 수 있다.",
			},
			{
				code: "machineWash40Mild",
				description: "물의 온도 최대 40℃에서 세탁기로 약하게 세탁할 수 있다.",
			},
			{
				code: "machineWash40VeryMild",
				description:
					"물의 온도 최대 40℃에서 세탁기로 매우 약하게 세탁할 수 있다.",
			},
			{
				code: "machineWash30",
				description: "물의 온도 최대 30℃에서 세탁기로 일반 세탁할 수 있다.",
			},
			{
				code: "machineWash30Mild",
				description: "물의 온도 최대 30℃에서 세탁기로 약하게 세탁할 수 있다.",
			},
			{
				code: "machineWash30VeryMild",
				description:
					"물의 온도 최대 30℃에서 세탁기로 매우 약하게 세탁할 수 있다.",
			},
			{
				code: "machineWash30NeutralMild",
				description:
					"물의 온도 최대 30℃에서 세탁기로 약하게 세탁할 수 있다. 세제 종류는 중성 세제를 사용한다.",
			},
			{
				code: "handWash40",
				description:
					"물의 온도 최대 40℃에서 손으로 약하게 손세탁할 수 있다(세탁기 사용 불가).",
			},
			{
				code: "handWash40NeutralMild",
				description:
					"물의 온도 최대 40℃에서 손으로 매우 약하게 손세탁할 수 있다(세탁기 사용 불가). 세제 종류는 중성 세제를 사용한다.",
			},
			{
				code: "handWash30",
				description:
					"물의 온도 최대 30℃에서 손으로 약하게 손세탁할 수 있다(세탁기 사용 불가).",
			},
			{
				code: "handWash30NeutralMild",
				description:
					"물의 온도 최대 30℃에서 손으로 매우 약하게 손세탁할 수 있다(세탁기 사용 불가). 세제 종류는 중성 세제를 사용한다.",
			},
			{ code: "doNotWash", description: "물세탁을 하면 안 된다." },
		],
		bleaching: [
			{
				code: "bleachChlorine",
				description: "염소계 표백제로만 표백할 수 있다.",
			},
			{
				code: "doNotBleachChlorine",
				description: "염소계 표백제로 표백하면 안 된다.",
			},
			{
				code: "bleachOxygen",
				description: "산소계 표백제로만 표백할 수 있다.",
			},
			{
				code: "doNotBleachOxygen",
				description: "산소계 표백제로 표백하면 안 된다.",
			},
			{
				code: "bleachAny",
				description: "염소계 또는 산소계 표백제로 표백할 수 있다.",
			},
			{
				code: "doNotBleachAny",
				description: "염소계 및 산소계 표백제로 표백하면 안 된다.",
			},
		],
		ironing: [
			{
				code: "iron210",
				description: "다리미 온도 최대 210℃로 다림질할 수 있다.",
			},
			{
				code: "iron210PressingCloth",
				description: "다리미 온도 최대 210℃로 헝겊을 덮고 다림질할 수 있다.",
			},
			{
				code: "iron160",
				description: "다리미 온도 최대 160℃로 다림질할 수 있다.",
			},
			{
				code: "iron160PressingCloth",
				description: "다리미 온도 최대 160℃로 헝겊을 덮고 다림질할 수 있다.",
			},
			{
				code: "iron120",
				description: "다리미 온도 최대 120℃로 다림질할 수 있다.",
			},
			{
				code: "iron120PressingCloth",
				description: "다리미 온도 최대 120℃로 헝겊을 덮고 다림질할 수 있다.",
			},
			{
				code: "iron120NoSteam",
				description:
					"다리미 온도 최대 120℃로 스팀을 가하지 않고 다림질할 수 있다. 스팀 다림질은 되돌릴 수 없는 손상을 일으킬 수 있다.",
			},
			{ code: "doNotIron", description: "다림질을 하면 안 된다." },
		],
		dryCleaning: [
			{
				code: "dryCleanAny",
				description:
					"테트라클로로에텐(퍼클로로에틸렌), 석유계 및 실리콘계 용제 등 적합한 용제로 일반 드라이클리닝할 수 있다.",
			},
			{
				code: "dryCleanAnyMild",
				description:
					"테트라클로로에텐(퍼클로로에틸렌), 석유계 및 실리콘계 용제 등 적합한 용제로 약하게 드라이클리닝할 수 있다.",
			},
			{
				code: "dryCleanPetroleum",
				description: "탄화수소(석유계) 용제로 일반 드라이클리닝할 수 있다.",
			},
			{
				code: "dryCleanPetroleumMild",
				description: "탄화수소(석유계) 용제로 약하게 드라이클리닝할 수 있다.",
			},
			{
				code: "dryCleanMethane",
				description:
					"다이부톡시메테인(메텐계) 용제로 일반 드라이클리닝할 수 있다.",
			},
			{
				code: "dryCleanMethaneMild",
				description:
					"다이부톡시메테인(메텐계) 용제로 약하게 드라이클리닝할 수 있다.",
			},
			{
				code: "dryCleanSilicone",
				description:
					"데카메틸사이클로펜타실록세인(실리콘계) 용제로 일반 드라이클리닝할 수 있다.",
			},
			{
				code: "dryCleanSiliconeMild",
				description:
					"데카메틸사이클로펜타실록세인(실리콘계) 용제로 약하게 드라이클리닝할 수 있다.",
			},
			{
				code: "dryCleanSpecialist",
				description:
					"드라이클리닝을 특수 전문점에서만 할 수 있다. 특수 전문점이란 취급하기 어려운 가죽, 모피, 헤어 등의 제품을 전문적으로 취급하는 업소를 말한다.",
			},
			{ code: "doNotDryClean", description: "드라이클리닝을 하면 안 된다." },
		],
		wetCleaning: [
			{
				code: "wetClean",
				description: "웻클리닝 전문점에서 일반 웻클리닝할 수 있다.",
			},
			{
				code: "wetCleanMild",
				description: "웻클리닝 전문점에서 약하게 웻클리닝할 수 있다.",
			},
			{
				code: "wetCleanVeryMild",
				description: "웻클리닝 전문점에서 매우 약하게 웻클리닝할 수 있다.",
			},
			{ code: "doNotWetClean", description: "웻클리닝을 하면 안 된다." },
		],
		wringing: [
			{
				code: "wringMild",
				description:
					"손으로 짜는 경우에는 약하게 짜고, 원심 탈수기인 경우는 짧은 시간 안에 탈수한다.",
			},
			{ code: "doNotWring", description: "짜면 안 된다." },
		],
		naturalDrying: [
			{
				code: "lineDrySunlight",
				description: "옷걸이에 걸어 햇볕에서 자연 건조한다.",
			},
			{
				code: "lineDryShade",
				description: "옷걸이에 걸어 그늘에서 자연 건조한다.",
			},
			{
				code: "lineDripDrySunlight",
				description: "탈수하지 않고, 옷걸이에 걸어 햇볕에서 자연 건조한다.",
			},
			{
				code: "lineDripDryShade",
				description: "탈수하지 않고, 옷걸이에 걸어 그늘에서 자연 건조한다.",
			},
			{
				code: "flatDrySunlight",
				description: "뉘어서 햇볕에서 자연 건조한다.",
			},
			{ code: "flatDryShade", description: "뉘어서 그늘에서 자연 건조한다." },
			{
				code: "flatDripDrySunlight",
				description: "탈수하지 않고, 뉘어서 햇볕에서 자연 건조한다.",
			},
			{
				code: "flatDripDryShade",
				description: "탈수하지 않고, 뉘어서 그늘에서 자연 건조한다.",
			},
		],
		tumbleDrying: [
			{
				code: "tumbleDry80",
				description: "80℃를 초과하지 않는 온도에서 기계건조할 수 있다.",
			},
			{
				code: "tumbleDry60",
				description: "60℃를 초과하지 않는 온도에서 기계건조할 수 있다.",
			},
			{ code: "doNotTumbleDry", description: "기계건조하면 안 된다." },
		],
	},
};

export type CareLabelCategory = keyof typeof CARE_LABEL_SYMBOLS.laundrySymbol;
