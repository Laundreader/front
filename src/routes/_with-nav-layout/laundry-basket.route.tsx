import { useState } from "react";
import { overlay } from "overlay-kit";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import type { Laundry } from "@/entities/laundry/model";
import PlusIcon from "@/assets/icons/plus.svg?react";
import BlueTShirtImg from "@/assets/images/blue-t-shirt.avif";
import { EmptyLaundryBasket } from "@/components/empty-laundry-basket";
import { LaundryBasket } from "@/components/laundry-basket";
import { deleteLaundries } from "@/entities/laundry/api";
import { CareGuideDetailSheet } from "@/components/care-guide-detail-sheet";
import { ConfirmDialog } from "@/components/confirm-dialog";
import {
	hamperQueryOptions,
	laundryQueryOptions,
} from "@/features/laundry/api";
import HamperBgImg from "@/assets/images/hamper-bg.avif";
import ErrorIcon from "@/assets/icons/error.svg?react";
import { toast, Toaster } from "sonner";

export const Route = createFileRoute("/_with-nav-layout/laundry-basket")({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { data: laundryList } = useSuspenseQuery(hamperQueryOptions);
	const delMutation = useMutation({
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
		if (
			canSelectMore === false &&
			selectedLaundrySet.has(laundryId) === false
		) {
			toast("한 번에 10개씩만 선택할 수 있어요!", {
				icon: <ErrorIcon className="text-main-yellow" />,
				unstyled: true,
				classNames: {
					toast: "flex w-full items-center gap-2 rounded-xl bg-navy px-4 py-5",
					title: "font-medium text-subhead text-white text-inherit",
				},
			});
			return;
		}

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

	function handleClickCancelSelectAll() {
		setSelectedLaundrySet(new Set());
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
			await delMutation.mutateAsync(laundryIds);

			setSelectedLaundrySet(new Set());
		}
	}

	return (
		<div className="flex h-full flex-col gap-3">
			<header
				style={{ backgroundImage: `url(${HamperBgImg})` }}
				className="relative flex h-[30vh] flex-col justify-evenly bg-white bg-cover bg-center bg-no-repeat p-4"
			>
				<h1 className="sr-only">빨래바구니 페이지</h1>
				<h2 className="text-title-2 font-semibold text-black-2">
					같이 세탁해도 될까?
					<br />
					이렇게 확인해요
				</h2>
				<p className="text-body-1">
					세탁물을 골라서 바구니에 담으면,
					<br />
					함께 세탁해도 되는지 알려드려요
				</p>
			</header>

			<section className="relative flex grow flex-col bg-white px-4 pt-6 pb-26">
				<div className="sticky top-0 -mx-4 -mt-4 mb-4 flex h-20 flex-col justify-around bg-white px-4 py-2">
					<div className="flex items-center justify-between">
						<div>
							{isSelecting ? (
								<button
									onClick={() => {
										setSelectedLaundrySet(new Set());
										setIsSelecting(false);
									}}
									className="rounded-sm bg-light-gray-1 px-2 py-1 text-body-1 font-medium text-main-blue-1"
								>
									선택 취소
								</button>
							) : (
								<div className="flex items-center gap-2">
									<button
										onClick={() => setIsSelecting(true)}
										disabled={!hasLaundry}
										className="rounded-sm bg-main-blue-1 px-2 py-1 text-body-1 font-medium text-white"
									>
										선택
									</button>
									<p className="text-body-1 font-medium text-dark-gray-2">
										총{" "}
										<span className="font-semibold text-main-blue-1">
											{laundryList.length}
										</span>
										개
									</p>
								</div>
							)}
						</div>

						<div className="flex items-center gap-2">
							{isSelecting ? (
								<>
									{selectedLaundryCount < laundryList.length ? (
										<button
											onClick={handleClickSelectAll}
											className="text-body-1 font-semibold text-dark-gray-1"
										>
											전체선택
										</button>
									) : (
										<button
											onClick={handleClickCancelSelectAll}
											className="text-body-1 font-semibold text-dark-gray-1"
										>
											전체해제
										</button>
									)}

									<button
										onClick={handleClickDeleteLaundry}
										disabled={!hasSelectedLaundry}
										className="flex cursor-pointer items-center rounded-sm border border-gray-2 bg-gray-3 px-2 py-1 text-body-2 font-medium text-gray-1"
									>
										삭제
									</button>
								</>
							) : (
								<Link
									to="/label-analysis"
									className="flex items-center gap-0.5 rounded-sm border border-main-blue-3 bg-gray-bluegray-1 px-2 py-1 text-body-1 font-medium text-main-blue-1"
								>
									<PlusIcon className="size-[18px]" />
									추가
								</Link>
							)}
						</div>
					</div>

					<div>
						{isSelecting ? (
							<div className="flex items-center gap-2">
								<p className="text-body-1 font-medium text-dark-gray-2">
									<span className="text-main-blue-1">
										{selectedLaundrySet.size}/10
									</span>{" "}
									선택중
								</p>
								{selectedLaundrySet.size < 2 && (
									<p className="text-body-2 text-red">2개 이상 선택해주세요!</p>
								)}
							</div>
						) : (
							<p className="text-body-2 text-gray-1">
								사진을 누르면 상세 세탁솔루션을 볼 수 있어요
							</p>
						)}
					</div>
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

				{canAnalyse && (
					<div className="sticky bottom-24">
						<Link
							to="/analysing"
							search={{ laundryIds: Array.from(selectedLaundrySet) }}
							className="flex h-14 cursor-pointer items-center justify-center rounded-xl bg-black-2 text-subhead font-medium text-white"
						>
							솔루션 보러가기
						</Link>
					</div>
				)}
			</section>

			<Toaster
				position="bottom-center"
				duration={1500}
				visibleToasts={1}
				offset={{ bottom: "10rem" }}
				mobileOffset={{ bottom: "10rem" }}
				style={{ fontFamily: "inherit" }}
			/>
		</div>
	);
}
