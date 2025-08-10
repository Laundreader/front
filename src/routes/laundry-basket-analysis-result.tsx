import { useState } from "react";
import { Link, Navigate, createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { overlay } from "overlay-kit";
import { laundryIdsSearchSchema } from "./-schema";
import ChevronLeftIcon from "@/assets/icons/chevron-left.svg?react";
import LaundryBasketAnalysisResultBgImg from "@/assets/images/laundry-basket-analysis-result-bg.png";
import { AiBadge } from "@/components/ai-badge";
import { CareGuideDetailSheet } from "@/components/care-guide-detail-sheet";
import { BlueChip } from "@/components/chip";
import {
	laundryBasketQueryOptions,
	laundryBasketSolutionQueryOptions,
} from "@/features/laundry/api";
import BlueTShirt from "@/assets/images/blue-t-shirt.png";

export const Route = createFileRoute("/laundry-basket-analysis-result")({
	validateSearch: laundryIdsSearchSchema,
	errorComponent: () => <Navigate to="/laundry-basket" replace />,
	component: RouteComponent,
});

function RouteComponent() {
	const { laundryIds } = Route.useSearch();
	const { data: laundryBasketSolution } = useSuspenseQuery(
		laundryBasketSolutionQueryOptions(laundryIds),
	);
	const { data: basketLaundries } = useSuspenseQuery(laundryBasketQueryOptions);
	const [selectedSolutionGroupId, setSelectedSolutionGroupId] =
		useState<number>(laundryBasketSolution.groups[0].id);

	const solutionGroups = laundryBasketSolution.groups;
	const selectedSolutionGroup = solutionGroups.find(
		(group) => group.id === selectedSolutionGroupId,
	)!;

	const laundryById = new Map(basketLaundries.map((l) => [l.id, l]));

	return (
		<div className="h-full bg-white">
			<header className="relative">
				<img
					src={LaundryBasketAnalysisResultBgImg}
					role="presentation"
					className="h-auto w-full"
				/>
				<div className="absolute inset-0 flex flex-col px-[16px] pt-[54px]">
					<div className="mb-[12px] flex">
						<Link to="/laundry-basket" className="w-fit">
							<ChevronLeftIcon />
							<span className="sr-only">빨래바구니로 돌아가기</span>
						</Link>
					</div>

					<div className="flex h-full flex-col">
						<h1 className="sr-only">빨래바구니 분석결과 페이지</h1>
						<div className="text-title-2 font-semibold text-black">
							<p>내 빨래바구니 분석 완료!</p>
						</div>
					</div>
				</div>
			</header>

			<main className="px-[16px] pt-[24px]">
				<p className="mb-[24px] text-title-3 font-semibold text-black-2">
					총 <span className="text-main-blue-1">{solutionGroups.length}</span>
					가지의 세탁 방법이 있어요!
				</p>

				<div className="mb-[24px] flex flex-wrap gap-[8px]">
					{solutionGroups.map((group) => {
						return (
							<BlueChip
								key={group.id}
								isActive={group.id === selectedSolutionGroupId}
								onClick={() => setSelectedSolutionGroupId(group.id)}
							>
								{group.name}
							</BlueChip>
						);
					})}
				</div>

				<section className="">
					<h2 className="w-fit rounded-t-[12px] bg-gray-3 p-[16px] pb-0 text-body-1 font-semibold text-dark-gray-2">
						<span className="mr-[4px]">{selectedSolutionGroup.name}</span>
						<span className="text-subhead font-semibold text-main-blue-1">
							{selectedSolutionGroup.laundryIds.length}
						</span>
					</h2>

					<div className="rounded-[12px] rounded-tl-none bg-gray-3 p-[16px]">
						{selectedSolutionGroup.solution && (
							<section className="mb-[36px]">
								<h3 className="mb-[18px] flex items-center gap-[8px] text-subhead font-semibold text-black-2">
									"빨래바구니 솔루션" <AiBadge />
								</h3>

								<p className="rounded-[12px] bg-white p-[16px] text-body-1 font-medium text-dark-gray-1">
									{selectedSolutionGroup.solution}
								</p>
							</section>
						)}

						<section>
							<h3 className="mb-[18px] text-subhead font-semibold text-black-2">
								{!selectedSolutionGroup.solution ||
								selectedSolutionGroup.laundryIds.length === 1
									? "따로 세탁해야 하는 옷"
									: "함께 세탁해도 되는 옷"}
							</h3>
							<ul className="grid grid-cols-3 gap-[14px]">
								{selectedSolutionGroup.laundryIds.map((laundryId) => {
									const laundry = laundryById.get(laundryId);
									const imgSrc =
										laundry?.images.real?.data ??
										laundry?.images.label.data ??
										BlueTShirt;

									return (
										<li
											key={laundryId}
											className="aspect-square cursor-pointer overflow-hidden rounded-[12px] bg-gray-1"
											onClick={() =>
												overlay.open(({ isOpen, close }) => {
													return (
														<CareGuideDetailSheet
															laundryId={laundryId}
															isOpen={isOpen}
															close={close}
														/>
													);
												})
											}
										>
											<img
												src={imgSrc}
												alt="선택한 세탁물 이미지"
												className="h-full w-full object-cover"
											/>
										</li>
									);
								})}
								<li></li>
							</ul>
						</section>
					</div>
				</section>
			</main>
		</div>
	);
}
