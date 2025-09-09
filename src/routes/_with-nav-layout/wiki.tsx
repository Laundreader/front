import { useState } from "react";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { overlay } from "overlay-kit";
import { wikiSearchSchema } from "../-schema";
import ChevronLeftIcon from "@/assets/icons/chevron-left.svg?react";
import WikiBgImg from "@/assets/images/wiki-bg.avif";
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
		<div className="flex min-h-dvh flex-col">
			<header className="relative">
				<img src={WikiBgImg} role="presentation" className="h-auto w-full" />
				<div className="absolute inset-0 flex flex-col px-4 pt-17">
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

			<section className="grow bg-white pt-6 pb-22">
				<WikiContent initialCategory={category} />
			</section>
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
			{/* 세탁기호 or 소재별 세탁법 */}
			<div className="flex justify-center px-4">
				<ul className="flex w-fit rounded-lg bg-gray-bluegray-2 p-1">
					{categories.map((tabName) => (
						<li key={tabName} className="shrink-0">
							<button
								onClick={() => setTab(tabName)}
								className={cn(
									"flex h-9 w-33 cursor-pointer items-center justify-center px-4 py-2 text-subhead font-medium text-gray-1",
									tab === tabName && "text-darkgray-1 rounded-sm bg-white",
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
					<ul className="mt-6 scrollbar-hidden flex max-w-max gap-2 overflow-x-scroll px-4">
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
					<ul className="grid grid-cols-3 gap-4 p-4">
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
									className="flex aspect-square cursor-pointer items-center justify-center rounded-xl border border-gray-2 bg-white"
								>
									<img src={symbolUrl(symbol.code)} className="w-4/6" />
								</div>
							</li>
						))}
					</ul>
				</>
			) : (
				<>
					<ul className="mt-6 scrollbar-hidden flex max-w-max gap-2 overflow-x-scroll px-4">
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
					<ul className="mt-2 grid grid-cols-2 gap-4 p-4">
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
									className="flex aspect-2/1 cursor-pointer items-center justify-center rounded-xl border-2 border-[#ffeecd] bg-label-yellow text-body-1 font-medium text-dark-gray-1"
								>
									{material.name}
								</div>
							</li>
						))}
					</ul>
				</>
			)}
		</>
	);
}
