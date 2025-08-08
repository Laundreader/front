import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import ChevronLeftIcon from "@/assets/icons/chevron-left.svg?react";
import LaundryBasketAnalysisResultBgImg from "@/assets/images/laundry-basket-analysis-result-bg.png";
import { AiBadge } from "@/components/ai-badge";
import { overlay } from "overlay-kit";
import { CareGuideDetailSheet } from "@/components/care-guide-detail-sheet";
import { BlueChip } from "@/components/chip";

export const Route = createFileRoute("/laundry-basket-analysis-result")({
	component: RouteComponent,
});

function RouteComponent() {
	const [selectedGroup, setSelectedGroup] = useState<string>("");

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
						<Link to=".." className="w-fit">
							<ChevronLeftIcon />
							<span className="sr-only">뒤로가기</span>
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
					총 <span className="text-main-blue-1">3</span>가지의 세탁 방법이
					있어요!
				</p>

				<div className="mb-[24px] flex flex-wrap gap-[8px]">
					{[
						"저온/부드러운 세탁 필요",
						"일반 세탁 가능",
						"손세탁/울코스 권장",
						"단독 세탁 권장",
					].map((group) => {
						return (
							<BlueChip
								key={group}
								isActive={group === selectedGroup}
								onClick={() => setSelectedGroup(group)}
							>
								{group}
							</BlueChip>
						);
					})}
				</div>

				<section className="">
					<h2 className="w-fit rounded-t-[12px] bg-gray-3 p-[16px] pb-0 text-body-1 font-semibold text-dark-gray-2">
						<span className="mr-[4px]">저온/부드러운 세탁 필요</span>
						<span className="text-subhead font-semibold text-main-blue-1">
							4
						</span>
					</h2>

					<div className="rounded-[12px] rounded-tl-none bg-gray-3 p-[16px]">
						<section className="mb-[36px]">
							<h3 className="mb-[18px] flex items-center gap-[8px] text-subhead font-semibold text-black-2">
								빨래바구니 솔루션 <AiBadge />
							</h3>

							<p className="rounded-[12px] bg-white p-[16px] text-body-1 font-medium text-dark-gray-1">
								세탁 30℃ 를 추천해요 그늘에서 자연 건조해요 표백은 안돼요 연약한
								소재에요
							</p>
						</section>

						<section>
							<h3 className="mb-[18px] text-subhead font-semibold text-black-2">
								함께 세탁해도 되는 옷
							</h3>
							<ul className="grid grid-cols-3 gap-[14px]">
								{["", "", ""].map((laundry) => {
									return (
										<li
											className="aspect-square cursor-pointer rounded-[12px] bg-gray-1"
											onClick={() =>
												overlay.open(({ isOpen, close }) => {
													return (
														<CareGuideDetailSheet
															isOpen={isOpen}
															close={close}
														/>
													);
												})
											}
										>
											<img src={laundry} className="object-cover" />
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
