import { useRef, useState, useLayoutEffect } from "react";
import { Link, Navigate, createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { overlay } from "overlay-kit";
import ChevronDownIcon from "@/assets/icons/chevron-down.svg?react";
import ChevronLeftIcon from "@/assets/icons/chevron-left.svg?react";
import ChevronUpIcon from "@/assets/icons/chevron-up.svg?react";
import BlueTShirt from "@/assets/images/blue-t-shirt.avif";
import HamperSolutionBgImg from "@/assets/images/hamper-solution-bg.avif";
import { AiBadge } from "@/components/ai-badge";
import { CareGuideDetailSheet } from "@/components/care-guide-detail-sheet";
import { BlueChip } from "@/components/chip";
import { createHamperSolution } from "@/entities/laundry/api";
import { laundryIdsSearchSchema } from "./-schema";

export const Route = createFileRoute("/laundry-basket-analysis-result")({
	validateSearch: laundryIdsSearchSchema,
	errorComponent: () => <Navigate to="/laundry-basket" replace />,
	component: RouteComponent,
});

function RouteComponent() {
	const { laundryIds } = Route.useSearch();

	if (laundryIds.length === 0) {
		return <Navigate to="/laundry-basket" replace />;
	}

	const [isExpanded, setIsExpanded] = useState<boolean>(false);
	const [shouldShowExpandButton, setShouldShowExpandButton] =
		useState<boolean>(false);
	const textRef = useRef<HTMLParagraphElement>(null);

	const { data: solutionGroupsData } = useSuspenseQuery({
		queryKey: ["hamper-solution", laundryIds],
		queryFn: () => createHamperSolution({ laundryIds }),
	});
	const [selectedSolutionGroupId, setSelectedSolutionGroupId] =
		useState<number>(solutionGroupsData[0].id);

	const selectedSolutionGroup = solutionGroupsData.find(
		(group) => group.id === selectedSolutionGroupId,
	)!;

	useLayoutEffect(() => {
		if (textRef.current) {
			const lineHeight = parseInt(
				window.getComputedStyle(textRef.current).lineHeight,
			);
			const maxHeight = lineHeight * 4;
			setShouldShowExpandButton(textRef.current.scrollHeight > maxHeight);
			setIsExpanded(false);
		}
	}, [selectedSolutionGroup.solution]);

	return (
		<div className="h-full bg-white">
			<header
				style={{ backgroundImage: `url(${HamperSolutionBgImg})` }}
				className="relative h-[20vh] min-h-36 bg-cover bg-bottom-right bg-no-repeat p-4"
			>
				<div className="mb-3 flex">
					<Link to="/laundry-basket" className="w-fit">
						<ChevronLeftIcon />
						<span className="sr-only">빨래바구니로 돌아가기</span>
					</Link>
				</div>

				<div className="flex h-full flex-col">
					<h1 className="sr-only">빨래바구니 분석결과 페이지</h1>
					<div className="text-title-2 font-semibold text-black">
						<p>
							내 빨래바구니
							<br /> 분석 완료!
						</p>
					</div>
				</div>
			</header>

			<main className="px-4 pt-6">
				<p className="mb-6 text-title-3 font-semibold text-black-2">
					총{" "}
					<span className="text-main-blue-1">{solutionGroupsData.length}</span>
					가지의 세탁 방법이 있어요!
				</p>

				<ul className="mb-6 flex flex-wrap gap-2">
					{solutionGroupsData.map((group) => {
						return (
							<li key={group.id}>
								<BlueChip
									isActive={group.id === selectedSolutionGroupId}
									onClick={() => setSelectedSolutionGroupId(group.id)}
								>
									{group.name}
								</BlueChip>
							</li>
						);
					})}
				</ul>

				<section className="">
					<h2 className="w-fit rounded-t-xl bg-gray-3 p-4 pb-0 text-body-1 font-semibold text-dark-gray-2">
						<span className="mr-[4px]">{selectedSolutionGroup.name}</span>
						<span className="text-subhead font-semibold text-main-blue-1">
							{selectedSolutionGroup.laundries.length}
						</span>
					</h2>

					<div className="rounded-xlrounded-t-xl rounded-tl-none bg-gray-3 p-4">
						{selectedSolutionGroup.solution && (
							<section className="mb-9">
								<h3 className="mb-4 flex items-center gap-2 text-subhead font-semibold text-black-2">
									빨래바구니 솔루션 <AiBadge />
								</h3>

								<div className="rounded-xl bg-white p-4">
									<div className="relative">
										<p
											ref={textRef}
											className={`text-body-1 font-medium whitespace-pre-line text-dark-gray-1 ${
												!isExpanded && shouldShowExpandButton
													? "line-clamp-4"
													: ""
											}`}
										>
											{selectedSolutionGroup.solution}
										</p>
										{!isExpanded && shouldShowExpandButton && (
											<div className="pointer-events-none absolute right-0 bottom-0 left-0 h-8 bg-gradient-to-t from-white to-transparent" />
										)}
									</div>
									{shouldShowExpandButton && (
										<button
											onClick={() => setIsExpanded((prev) => !prev)}
											className="mt-2 flex w-full items-center justify-center text-black-2 hover:opacity-80"
										>
											{isExpanded ? (
												<ChevronUpIcon className="h-6 w-6" />
											) : (
												<ChevronDownIcon className="h-6 w-6" />
											)}
											<span className="sr-only">
												{isExpanded ? "접기" : "더보기"}
											</span>
										</button>
									)}
								</div>
							</section>
						)}

						<section>
							<h3 className="mb-4 text-subhead font-semibold text-black-2">
								{!selectedSolutionGroup.solution ||
								selectedSolutionGroup.laundries.length === 1
									? "따로 세탁해야 하는 옷"
									: "함께 세탁해도 되는 옷"}
							</h3>

							<ul className="mb-2 grid grid-cols-3 gap-3">
								{selectedSolutionGroup.laundries.map((laundry) => {
									return (
										<li
											key={laundry.id}
											className="aspect-square cursor-pointer overflow-hidden rounded-xl bg-gray-1"
											onClick={() =>
												overlay.open(({ isOpen, close }) => {
													return (
														<CareGuideDetailSheet
															laundryId={laundry.id}
															isOpen={isOpen}
															close={close}
														/>
													);
												})
											}
										>
											<img
												src={laundry.thumbnail ?? BlueTShirt}
												alt="선택한 세탁물 이미지"
												className="h-full w-full object-cover"
											/>
										</li>
									);
								})}
								<li></li>
							</ul>
							<p className="text-caption font-medium text-gray-1">
								누르면 세탁법을 볼 수 있어요
							</p>
						</section>
					</div>
				</section>
			</main>
		</div>
	);
}
