import { Suspense, useState } from "react";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import ChevronLeftIcon from "@/assets/icons/chevron-left.svg?react";
import WikiBgImg from "@/assets/images/wiki-bg.png";
import { Chip } from "@/components/chip";
import { cn, symbolUrl } from "@/lib/utils";
import { wikiSearchSchema } from "../-schema";
import { overlay } from "overlay-kit";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import CloseIcon from "@/assets/icons/close.svg?react";

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

	const json = (await response.json()) as { wiki: Wiki };

	return json.wiki;
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

type CareSymbolCategory = keyof Wiki["careSymbols"]; // 'washing' | 'bleaching' | 'drying' | 'professional'
type MaterialCategory = keyof Wiki["materials"]; // 'natural' | 'artificial' | 'mixed' | 'functional'

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

const wikiTabs = ["careSymbols", "materials"] as const;

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
						{wikiTabs.map((tabName) => (
							<li key={tabName} className="shrink-0">
								<button
									onClick={() => setTab(tabName)}
									className={cn(
										"flex h-[36px] w-[131px] cursor-pointer items-center justify-center px-4 py-2 text-subhead font-medium text-gray-1",
										tab === tabName
											? "text-darkgray-1 rounded-[4px] bg-white"
											: "",
									)}
								>
									{tabName === "careSymbols" ? "세탁기호" : "소재별 세탁법"}
								</button>
							</li>
						))}
					</ul>
				</div>

				{/* 카테고리 칩스 */}
				{tab === "careSymbols" ? (
					<>
						<ul className="mt-[24px] scrollbar-hidden flex max-w-max gap-2 overflow-x-scroll">
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
									<div className="flex aspect-square cursor-pointer items-center justify-center rounded-[12px] border border-gray-2 bg-white">
										<img src={symbolUrl(`${symbol.code}.png`)} />
									</div>
								</li>
							))}
						</ul>
					</>
				) : (
					<>
						<ul className="mt-[24px] scrollbar-hidden flex max-w-max gap-2 overflow-x-scroll">
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

function MaterialDetailDialog({
	material,
	isOpen,
	close,
}: {
	material: Material;
	isOpen: boolean;
	close: () => void;
}) {
	return (
		<Dialog open={isOpen} onOpenChange={close}>
			<DialogContent className="w-[calc(100vw-32px)] max-w-[480px] rounded-[16px] p-[16px]">
				<div className="flex items-start justify-between gap-2">
					<DialogHeader className="text-left">
						<DialogTitle className="text-title-2 text-black-2">
							{material.name}
						</DialogTitle>
						<DialogDescription className="mt-[8px] text-body-1 text-dark-gray-1">
							{material.description}
						</DialogDescription>
					</DialogHeader>
					<button
						aria-label="닫기"
						onClick={close}
						className="rounded-[8px] p-1 text-gray-1 hover:bg-gray-bluegray-1"
					>
						<CloseIcon />
					</button>
				</div>

				<div className="mt-[16px] rounded-[12px] bg-gray-bluegray-1 p-[12px]">
					<h3 className="mb-[8px] text-subhead font-semibold text-black-2">
						관리 방법
					</h3>
					<ul className="space-y-[10px] text-body-1 text-dark-gray-1">
						<li>
							<p className="font-medium text-black-2">세탁</p>
							<p className="mt-[4px] whitespace-pre-wrap">
								{material.careInstructions.washing}
							</p>
						</li>
						<li>
							<p className="font-medium text-black-2">건조</p>
							<p className="mt-[4px] whitespace-pre-wrap">
								{material.careInstructions.drying}
							</p>
						</li>
						<li>
							<p className="font-medium text-black-2">기타</p>
							<p className="mt-[4px] whitespace-pre-wrap">
								{material.careInstructions.other}
							</p>
						</li>
					</ul>
				</div>
			</DialogContent>
		</Dialog>
	);
}
