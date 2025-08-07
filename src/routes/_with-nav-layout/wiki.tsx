import { useState, Suspense } from "react";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import ChevronLeftIcon from "@/assets/icons/chevron-left.svg?react";
import WikiBgImg from "@/assets/images/wiki-bg.png";
import { Chip } from "@/components/chip";
import { cn } from "@/lib/utils";

const laundryWikiQueryOptions = queryOptions({
	queryKey: ["wikiInfo"],
	queryFn: fetchLaundryWiki,
	gcTime: 0,
	staleTime: 0,
});

async function fetchLaundryWiki(): Promise<LaundryWiki> {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve(laundryWiki);
		}, 1000);
	});
}

export const Route = createFileRoute("/_with-nav-layout/wiki")({
	component: RouteComponent,
});

const laundrySymbolCategoryMap = {
	waterWashing: "세탁",
	bleaching: "표백",
	ironing: "다림질",
	dryCleaning: "드라이클리닝",
	wetCleaning: "웻클리닝",
	wringing: "짜기",
	naturalDrying: "자연건조",
	tumbleDrying: "기계건조",
};

interface LaundrySymbol {
	code: string;
	description: string;
}

interface CareGuideByMaterial {
	material: string;
	careGuide: string;
}

interface LaundryWiki {
	laundrySymbols: {
		[key in keyof typeof laundrySymbolCategoryMap]: Array<LaundrySymbol>;
	};
	careGuideByMaterial: Array<CareGuideByMaterial>;
}

const laundryWiki: LaundryWiki = {
	laundrySymbols: {
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
	careGuideByMaterial: [
		{
			material: "면",
			careGuide: "면은 물세탁이 가능하며, 고온에서 세탁할 수 있습니다.",
		},
		{
			material: "울",
			careGuide: "울은 손세탁을 권장하며, 고온에서 세탁하면 안 됩니다.",
		},
		{
			material: "합성섬유",
			careGuide:
				"합성섬유는 일반적으로 물세탁이 가능하지만, 온도에 주의해야 합니다.",
		},
		// 추가적인 소재별 세탁법을 여기에 작성할 수 있습니다.
	],
};

const laundryWikiFields = Object.keys(laundryWiki) as Array<keyof LaundryWiki>;

function RouteComponent() {
	return (
		<div>
			<header className="relative">
				<img src={WikiBgImg} role="presentation" className="h-auto w-full" />
				<div className="absolute inset-0 flex flex-col px-[16px] pt-[54px]">
					<div className="flex">
						<Link to=".." className="w-fit">
							<ChevronLeftIcon />
							<span className="sr-only">뒤로가기</span>
						</Link>
					</div>
					<div className="flex h-full flex-col justify-center">
						<h1 className="sr-only">세탁백과 페이지</h1>
						<div className="flex flex-col text-title-2 font-semibold text-black">
							<span>세탁 백과에서</span>
							<span>손쉬운 세탁</span>
						</div>
					</div>
				</div>
			</header>

			<Suspense fallback={<div>로딩 중...</div>}>
				<WikiContent />
			</Suspense>
		</div>
	);
}

function WikiContent() {
	const [tab, setTab] = useState<"laundrySymbols" | "careGuideByMaterial">(
		"laundrySymbols",
	);
	const [category, setCategory] =
		useState<keyof typeof laundrySymbolCategoryMap>("waterWashing");

	const { data: wikiInfo } = useSuspenseQuery(laundryWikiQueryOptions);

	return (
		<>
			<section className="pt-[24px] pb-[90px]">
				{/* 세탁기호 or 소재별 세탁법 */}
				<div className="flex justify-center px-[16px]">
					<ul className="flex w-fit rounded-[8px] bg-gray-bluegray-2 p-[4px]">
						{laundryWikiFields.map((tabName) => (
							<li key={tabName} className="shrink-0">
								<button
									onClick={() => setTab(tabName)}
									className={cn(
										"flex h-[36px] w-[131px] cursor-pointer items-center justify-center px-4 py-2 text-subhead font-medium text-gray-1",
										tab === tabName
											? "rounded-[4px] bg-white text-darkgray-1"
											: "",
									)}
								>
									{tabName === "laundrySymbols" ? "세탁기호" : "소재별 세탁법"}
								</button>
							</li>
						))}
					</ul>
				</div>

				{tab === "laundrySymbols" && (
					<>
						{/* 카테고리 칩스 */}
						<ul className="mt-[24px] scrollbar-hidden flex max-w-max gap-2 overflow-x-scroll">
							{Object.entries(laundrySymbolCategoryMap).map(
								([categoryKey, categoryName]) => (
									<li key={categoryKey} className="shrink-0">
										<Chip
											isActive={category === categoryKey}
											onClick={() =>
												setCategory(
													categoryKey as keyof typeof laundrySymbolCategoryMap,
												)
											}
										>
											{categoryName}
										</Chip>
									</li>
								),
							)}
						</ul>

						{/* 세탁 기호 목록 */}
						<ul className="grid grid-cols-3 gap-[16px] p-[16px]">
							{wikiInfo.laundrySymbols[category].map((symbol) => (
								<li key={symbol.code}>
									<div className="aspect-square cursor-pointer rounded-2xl bg-gray-1">
										<img src={`${symbol.code}.png`} />
									</div>
								</li>
							))}
						</ul>
					</>
				)}

				{tab === "careGuideByMaterial" && (
					// 소재 목록
					<ul className="mt-[8px] grid grid-cols-2 gap-[16px] p-[16px]">
						{wikiInfo.careGuideByMaterial.map((material) => (
							<li key={material.material}>
								<div className="aspect-square cursor-pointer rounded-2xl bg-gray-1">
									<img src={`${material.material}.png`} />
									{material.material}
								</div>
							</li>
						))}
					</ul>
				)}
			</section>
		</>
	);
}
