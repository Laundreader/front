import { useState } from "react";
import { overlay } from "overlay-kit";
import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import CheckIcon from "@/assets/icons/check.svg?react";
import PlusIcon from "@/assets/icons/plus.svg?react";
import BlueTShirtImg from "@/assets/images/blue-t-shirt.png";
import MascortSideImg from "@/assets/images/laundreader-mascort-side.png";
import { EmptyLaundryBasket } from "@/components/empty-laundry-basket";
import { LaundryBasket } from "@/components/laundry-basket";
import { getLaundryBasket } from "@/entities/laundry/api";
import { CareGuideDetailSheet } from "@/components/care-guide-detail-sheet";
import { ConfirmDialog } from "@/components/confirm-dialog";

import type { Laundry } from "@/entities/laundry/model";

export const Route = createFileRoute("/_with-nav-layout/laundry-basket")({
	component: RouteComponent,
});

const laundryBasketQueryOptions = {
	queryKey: ["laundryBasket"],
	queryFn: getLaundryBasket,
};

function RouteComponent() {
	const { data: laundryList } = useSuspenseQuery(laundryBasketQueryOptions);

	const [isSelecting, setIsSelecting] = useState(false);
	const [selectedLaundrySet, setSelectedLaundrySet] = useState<
		Set<Laundry["id"]>
	>(new Set());

	const hasSelectedLaundry = selectedLaundrySet.size > 0;
	const canAnalyse =
		2 <= selectedLaundrySet.size && selectedLaundrySet.size <= 10;
	const canSelectMore = selectedLaundrySet.size < 10;

	function selectLaundry(laundryId: Laundry["id"]) {
		setSelectedLaundrySet((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(laundryId)) {
				newSet.delete(laundryId);
			} else {
				if (canSelectMore) {
					newSet.add(laundryId);
				}
			}

			return newSet;
		});
	}

	function handleClickLaundry(laundryId: Laundry["id"]) {
		if (isSelecting) {
			selectLaundry(laundryId);
		} else {
			overlay.open(({ isOpen, close }) => {
				return (
					<>
						<CareGuideDetailSheet isOpen={isOpen} close={close} />
					</>
				);
			});
		}
	}

	return (
		<div className="flex h-full flex-col gap-[12px]">
			<header className="relative flex h-[260px] shrink-0 items-center bg-white px-[16px]">
				<div className="flex h-full w-full flex-row-reverse items-end pb-[24px]">
					<img
						src={MascortSideImg}
						role="presentation"
						className="h-[145px] w-[135px]"
					/>
				</div>
				<div className="absolute inset-0 pt-[80px]">
					<h1 className="sr-only">빨래바구니 페이지</h1>
					<h2 className="mb-[18px] text-title-2 font-semibold text-black-2">
						<p>같이 세탁해도 될까?</p>
						<p>이렇게 확인해요</p>
					</h2>
					<div className="text-body-1 leading-[1.4]">
						<p>세탁물을 골라서 바구니에 담으면,</p>
						<p>함께 세탁해도 되는지 알려드려요</p>
					</div>
				</div>
			</header>

			<section className="relative flex grow flex-col bg-white px-[16px] pt-[24px] pb-[106px]">
				<div className="flex items-center justify-between">
					{isSelecting ? (
						<button
							className="flex"
							onClick={() => {
								setSelectedLaundrySet(new Set());
								setIsSelecting(false);
							}}
						>
							<CheckIcon />
							<span className="text-darkgray-1 text-body-1 font-semibold">
								선택 취소
							</span>
						</button>
					) : (
						<button className="flex" onClick={() => setIsSelecting(true)}>
							<CheckIcon />
							<span className="text-darkgray-1 text-body-1 font-semibold">
								세탁물 선택
							</span>
						</button>
					)}

					{hasSelectedLaundry ? (
						<button
							onClick={async () => {
								const shouldDelete = await overlay.openAsync(
									({ isOpen, close }) => {
										return (
											<ConfirmDialog
												img={BlueTShirtImg}
												title="정말 삭제하시겠어요?"
												body="삭제된 세탁물은 복구할 수 없어요"
												isOpen={isOpen}
												close={() => close(false)}
												confirm={() => close(true)}
											/>
										);
									},
								);

								if (shouldDelete) {
									console.log("삭제");
								}
							}}
							className="flex cursor-pointer items-center rounded-[4px] border border-gray-2 bg-gray-3 px-[8px] py-[7px] text-body-2 font-medium text-gray-1"
						>
							삭제
						</button>
					) : (
						<button className="flex cursor-pointer items-center rounded-[4px] border border-main-blue-3 bg-gray-bluegray-1 px-[8px] py-[7px] text-body-2 font-medium text-main-blue-1">
							<PlusIcon className="size-[18px]" />
							세탁물 추가
						</button>
					)}
				</div>

				<div className="h-[32px]">
					{isSelecting && (
						<p className="text-body-1 font-medium text-dark-gray-2">
							<span className="text-main-blue-1">
								{selectedLaundrySet.size}
							</span>
							/10개 선택됨
						</p>
					)}
				</div>

				{laundryList.length === 0 ? (
					<EmptyLaundryBasket className="mt-[60px]" />
				) : (
					<LaundryBasket
						className="grow"
						laundryList={laundryList}
						onClick={handleClickLaundry}
						selectedLaundrySet={selectedLaundrySet}
					/>
				)}

				{canAnalyse ? (
					<button className="sticky bottom-[102px] h-[56px] cursor-pointer rounded-[10px] bg-black-2 text-subhead font-medium text-white">
						해결책 보러가기
					</button>
				) : (
					<div className="h-[56px]"></div>
				)}
			</section>
		</div>
	);
}
