import { useState } from "react";
import { overlay } from "overlay-kit";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import type { Laundry } from "@/entities/laundry/model";
import CheckIcon from "@/assets/icons/check.svg?react";
import PlusIcon from "@/assets/icons/plus.svg?react";
import BlueTShirtImg from "@/assets/images/blue-t-shirt.png";
import MascortSideImg from "@/assets/images/laundreader-mascort-side.png";
import { EmptyLaundryBasket } from "@/components/empty-laundry-basket";
import { LaundryBasket } from "@/components/laundry-basket";
import { deleteLaundries } from "@/entities/laundry/api";
import { CareGuideDetailSheet } from "@/components/care-guide-detail-sheet";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { cn } from "@/lib/utils";
import {
	hamperQueryOptions,
	laundryQueryOptions,
} from "@/features/laundry/api";

export const Route = createFileRoute("/_with-nav-layout/laundry-basket")({
	component: RouteComponent,
});

function RouteComponent() {
	const queryClient = useQueryClient();
	const { data: laundryList } = useSuspenseQuery(hamperQueryOptions);
	const mutate = useMutation({
		mutationFn: (laundryIds: Array<Laundry["id"]>) =>
			deleteLaundries(laundryIds),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: hamperQueryOptions.queryKey,
			});
		},
	});

	const [isSelecting, setIsSelecting] = useState(false);
	const [selectedLaundrySet, setSelectedLaundrySet] = useState(
		new Set<Laundry["id"]>(),
	);

	const selectedLaundryCount = selectedLaundrySet.size;
	const hasLaundry = 0 < laundryList.length;
	const hasSelectedLaundry = 0 < selectedLaundryCount;
	const canAnalyse = 2 <= selectedLaundryCount && selectedLaundryCount <= 10;
	const canSelectMore = selectedLaundryCount < 10;

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
			// 시트 열기 전에 최신 데이터 프리패치해서 캐시 반영
			queryClient
				.prefetchQuery(laundryQueryOptions(laundryId))
				.finally(() => {});
			overlay.open(({ isOpen, close }) => {
				return (
					<>
						<CareGuideDetailSheet
							laundryId={laundryId}
							isOpen={isOpen}
							close={close}
							navigate={navigate}
						/>
					</>
				);
			});
		}
	}

	function handleClickSelectAll() {
		const everyLaundryIds = laundryList.map((laundry) => laundry.id);
		setSelectedLaundrySet(new Set(everyLaundryIds));
	}

	async function handleClickDeleteLaundry() {
		const shouldDelete = await overlay.openAsync(({ isOpen, close }) => {
			return (
				<ConfirmDialog
					img={BlueTShirtImg}
					title="정말 삭제하시겠어요?"
					body="삭제된 세탁물은 복구할 수 없어요"
					isOpen={isOpen}
					cancel={() => close(false)}
					confirm={() => close(true)}
				/>
			);
		});

		if (shouldDelete) {
			const laundryIds = Array.from(selectedLaundrySet);
			await mutate.mutateAsync(laundryIds);

			setSelectedLaundrySet(new Set());
		}
	}

	const navigate = useNavigate();

	return (
		<div className="flex h-full flex-col gap-[12px]">
			<header className="relative flex h-[260px] shrink-0 items-center bg-white">
				<div className="flex h-full w-full flex-row-reverse items-end px-[16px] pb-[24px]">
					<img
						src={MascortSideImg}
						role="presentation"
						className="h-[145px] w-[135px]"
					/>
				</div>
				<div className="absolute inset-0 px-[16px] pt-[80px]">
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
						<button
							onClick={() => setIsSelecting(true)}
							className={cn("flex", !hasLaundry && "cursor-not-allowed")}
							disabled={!hasLaundry}
						>
							<CheckIcon />
							<span className="text-darkgray-1 text-body-1 font-semibold">
								세탁물 선택
							</span>
						</button>
					)}

					<div className="flex items-center gap-[8px]">
						{isSelecting ? (
							<>
								<button
									onClick={handleClickSelectAll}
									className="text-body-1 font-semibold text-dark-gray-1"
								>
									전체선택
								</button>
								<button
									onClick={handleClickDeleteLaundry}
									disabled={!hasSelectedLaundry}
									className="flex cursor-pointer items-center rounded-[4px] border border-gray-2 bg-gray-3 px-[8px] py-[7px] text-body-2 font-medium text-gray-1"
								>
									삭제
								</button>
							</>
						) : (
							<Link
								to="/label-analysis"
								className="flex cursor-pointer items-center rounded-[4px] border border-main-blue-3 bg-gray-bluegray-1 px-[8px] py-[7px] text-body-2 font-medium text-main-blue-1"
							>
								<PlusIcon className="size-[18px]" />
								추가
							</Link>
						)}
					</div>
				</div>

				<div className="h-[32px]">
					{isSelecting ? (
						<p className="text-body-1 font-medium text-dark-gray-2">
							<span className="text-main-blue-1">
								{selectedLaundrySet.size}
							</span>
							/10개 선택됨
						</p>
					) : (
						<p className="text-body-2 text-gray-1">
							사진을 누르면 상세한 세탁 솔루션을 볼 수 있어요
						</p>
					)}
				</div>

				{hasLaundry ? (
					<LaundryBasket
						className="grow"
						laundryList={laundryList}
						onClick={handleClickLaundry}
						selectedLaundrySet={selectedLaundrySet}
					/>
				) : (
					<EmptyLaundryBasket className="mt-[60px]" />
				)}

				{canAnalyse ? (
					<Link
						to="/analysing"
						search={{ laundryIds: Array.from(selectedLaundrySet) }}
						className="sticky bottom-[102px] flex h-[56px] cursor-pointer items-center justify-center rounded-[10px] bg-black-2 text-subhead font-medium text-white"
					>
						솔루션 보러가기
					</Link>
				) : (
					<div className="h-[56px]"></div>
				)}
			</section>
		</div>
	);
}
