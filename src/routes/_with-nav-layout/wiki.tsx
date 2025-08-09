import { Suspense, useState } from "react";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { overlay } from "overlay-kit";
import { wikiSearchSchema } from "../-schema";
import ChevronLeftIcon from "@/assets/icons/chevron-left.svg?react";
import WikiBgImg from "@/assets/images/wiki-bg.png";
import { Chip } from "@/components/chip";
import { cn, symbolUrl } from "@/lib/utils";
import { CareSymbolDetailDialog } from "@/components/care-symbol-detail-dialog";
import { MaterialDetailDialog } from "@/components/material-detail-dialog";

const laundryWikiQueryOptions = queryOptions({
	queryKey: ["wiki"],
	queryFn: fetchWiki,
	staleTime: Number.POSITIVE_INFINITY,
	gcTime: Number.POSITIVE_INFINITY,
});

async function fetchWiki(): Promise<Wiki> {
	const response = await fetch("/wiki.json");
	if (!response.ok) {
		throw new Error("Failed to fetch laundry wiki data");
	}

	return response.json();
}

export const Route = createFileRoute("/_with-nav-layout/wiki")({
	validateSearch: wikiSearchSchema,
	component: RouteComponent,
});

type Wiki = {
	careSymbols: {
		washing: Array<CareSymbol>;
		bleaching: Array<CareSymbol>;
		drying: Array<CareSymbol>;
		professional: Array<CareSymbol>;
	};
	materials: {
		natural: Array<Material>;
		artificial: Array<Material>;
		mixed: Array<Material>;
		functional: Array<Material>;
	};
};

type Category = keyof Wiki; // 'careSymbols' | 'materials'
type CareSymbolCategory = keyof Wiki["careSymbols"]; // 'washing' | 'bleaching' | 'drying' | 'professional'
type MaterialCategory = keyof Wiki["materials"]; // 'natural' | 'artificial' | 'mixed' | 'functional'

const categoryFieldKorMap: Record<Category, string> = {
	careSymbols: "세탁 기호",
	materials: "소재별 세탁법",
};

const careSymbolsFieldKorMap: Record<CareSymbolCategory, string> = {
	washing: "세탁",
	bleaching: "표백",
	drying: "건조",
	professional: "전문세탁",
};

const materialsFieldKorMap: Record<MaterialCategory, string> = {
	natural: "천연",
	artificial: "인조",
	mixed: "혼방",
	functional: "기능성",
};

type CareSymbol = {
	code: string;
	description: string;
};

type Material = {
	name: string;
	description: string;
	careInstructions: {
		washing: string;
		drying: string;
		other: string;
	};
};

const categories = ["careSymbols", "materials"] as const;

function RouteComponent() {
	const { category } = Route.useSearch();

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
				<WikiContent initialCategory={category} />
			</Suspense>
		</div>
	);
}

interface WikiContentProps {
	initialCategory: "careSymbols" | "materials";
}

function WikiContent({ initialCategory = "careSymbols" }: WikiContentProps) {
	const [tab, setTab] = useState<"careSymbols" | "materials">(initialCategory);
	const [careCategory, setCareCategory] =
		useState<CareSymbolCategory>("washing");
	const [materialCategory, setMaterialCategory] =
		useState<MaterialCategory>("natural");

	const { data: wiki } = useSuspenseQuery(laundryWikiQueryOptions);

	return (
		<>
			<section className="pt-[24px] pb-[90px]">
				{/* 세탁기호 or 소재별 세탁법 */}
				<div className="flex justify-center px-[16px]">
					<ul className="flex w-fit rounded-[8px] bg-gray-bluegray-2 p-[4px]">
						{categories.map((tabName) => (
							<li key={tabName} className="shrink-0">
								<button
									onClick={() => setTab(tabName)}
									className={cn(
										"flex h-[36px] w-[131px] cursor-pointer items-center justify-center px-4 py-2 text-subhead font-medium text-gray-1",
										tab === tabName && "text-darkgray-1 rounded-[4px] bg-white",
									)}
								>
									{categoryFieldKorMap[tabName]}
								</button>
							</li>
						))}
					</ul>
				</div>

				{/* 카테고리 칩스 */}
				{tab === "careSymbols" ? (
					<>
						<ul className="mt-[24px] scrollbar-hidden flex max-w-max gap-2 overflow-x-scroll px-[16px]">
							{Object.entries(careSymbolsFieldKorMap).map(
								([categoryKey, categoryName]) => (
									<li key={categoryKey} className="shrink-0">
										<Chip
											isActive={careCategory === categoryKey}
											onClick={() =>
												setCareCategory(categoryKey as CareSymbolCategory)
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
							{wiki.careSymbols[careCategory].map((symbol) => (
								<li key={symbol.code}>
									<div
										onClick={() =>
											overlay.open(({ isOpen, close }) => (
												<CareSymbolDetailDialog
													isOpen={isOpen}
													close={close}
													category={careSymbolsFieldKorMap[careCategory]}
													symbol={symbol}
												/>
											))
										}
										className="flex aspect-square cursor-pointer items-center justify-center rounded-[12px] border border-gray-2 bg-white"
									>
										<img
											src={symbolUrl(`${symbol.code}.png`)}
											className="w-4/6"
										/>
									</div>
								</li>
							))}
						</ul>
					</>
				) : (
					<>
						<ul className="mt-[24px] scrollbar-hidden flex max-w-max gap-2 overflow-x-scroll px-[16px]">
							{Object.entries(materialsFieldKorMap).map(
								([categoryKey, categoryName]) => (
									<li key={categoryKey} className="shrink-0">
										<Chip
											isActive={materialCategory === categoryKey}
											onClick={() =>
												setMaterialCategory(categoryKey as MaterialCategory)
											}
										>
											{categoryName}
										</Chip>
									</li>
								),
							)}
						</ul>

						{/* 소재 목록 */}
						<ul className="mt-[8px] grid grid-cols-2 gap-[16px] p-[16px]">
							{wiki.materials[materialCategory].map((material) => (
								<li key={material.name}>
									<div
										onClick={() =>
											overlay.open(({ isOpen, close }) => (
												<MaterialDetailDialog
													material={material}
													category={materialsFieldKorMap[materialCategory]}
													isOpen={isOpen}
													close={close}
												/>
											))
										}
										className="flex aspect-[2/1] cursor-pointer items-center justify-center rounded-[12px] border-[2px] border-[#ffeecd] bg-label-yellow text-body-1 font-medium text-dark-gray-1"
									>
										{material.name}
									</div>
								</li>
							))}
						</ul>
					</>
				)}
			</section>
		</>
	);
}
