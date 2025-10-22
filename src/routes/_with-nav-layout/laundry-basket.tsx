import { useState } from "react";
import { overlay } from "overlay-kit";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { type Laundry } from "@/entities/laundry/model";
import PlusIcon from "@/assets/icons/plus.svg?react";
import BlueTShirtImg from "@/assets/images/blue-t-shirt.avif";
import { EmptyLaundryBasket } from "@/components/empty-laundry-basket";
import { LaundryBasket } from "@/components/laundry-basket";
import { laundryApi, laundryApiLocal } from "@/entities/laundry/api";
import { CareGuideDetailSheet } from "@/components/care-guide-detail-sheet";
import { ConfirmDialog } from "@/components/confirm-dialog";
import HamperBgImg from "@/assets/images/hamper-bg.avif";
import LaundryBasketErrorImg from "@/assets/images/laundry-basket-error.avif";
import ErrorIcon from "@/assets/icons/error.svg?react";
import { toast, Toaster } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/tooltip";
import { useAuth } from "@/features/auth/use-auth";

export const Route = createFileRoute("/_with-nav-layout/laundry-basket")({
	component: RouteComponent,
});

function RouteComponent() {
	const { auth } = useAuth();
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const { data: laundryList } = useSuspenseQuery({
		queryKey: ["hamper"],
		queryFn: auth.isAuthenticated
			? laundryApi.getLaundriesAll
			: laundryApiLocal.getLaundriesAll,
	});

	const deleteLaundryMut = useMutation({
		mutationFn: auth.isAuthenticated
			? laundryApi.deleteLaundry
			: laundryApiLocal.deleteLaundry,
	});

	const [selectionMode, setSelectionMode] = useState<
		"none" | "delete" | "pick"
	>("none");
	const isSelecting = selectionMode !== "none";
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
			return;
		}

		overlay.open(({ isOpen, close }) => {
			return (
				<CareGuideDetailSheet
					laundryId={laundryId}
					isOpen={isOpen}
					close={close}
					navigate={navigate}
				/>
			);
		});
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
			const deleteLaundryPromises = Array.from(selectedLaundrySet).map(
				(laundryId) =>
					deleteLaundryMut.mutateAsync(laundryId, {
						onSuccess: () => {
							queryClient.invalidateQueries({
								queryKey: ["hamper"],
							});
						},
					}),
			);
			await Promise.allSettled(deleteLaundryPromises);

			setSelectedLaundrySet(new Set());
		}
	}

	// const migrateLocalLaundriesMut = useMutation({
	// 	mutationFn: migrateLocalLaundries,
	// });

	// async function migrateLocalLaundries() {
	// 	const laundries = await laundryStore.getAll();

	// 	const convertedLaundries = laundries.map((laundry) => {
	// 		return {
	// 			type: laundry.type,
	// 			color: laundry.color,
	// 			materials: laundry.materials,
	// 			laundrySymbols: laundry.laundrySymbols,
	// 			solutions: laundry.solutions,
	// 			hasPrintOrTrims: laundry.hasPrintOrTrims,
	// 			additionalInfo: laundry.additionalInfo,
	// 			image: {
	// 				label: laundry.image.label?.data ?? null,
	// 				clothes: laundry.image.clothes?.data ?? null,
	// 			},
	// 		};
	// 	});

	// 	const promises = convertedLaundries.map(
	// 		async (laundry) => await laundryApi.saveLaundry(laundry),
	// 	);

	// 	await Promise.allSettled(promises);

	// 	const laundryIdsToDelete = laundries.map((laundry) => laundry.id);
	// 	await laundryStore.delMany(laundryIdsToDelete);

	// 	queryClient.invalidateQueries({ queryKey: ["hamper"] });
	// }

	// useEffect(() => {
	// 	if (auth.isAuthenticated && laundryListLocal.length > 0) {
	// 		migrateLocalLaundriesMut.mutate();
	// 	}
	// });

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
				{/*
					MARK: 상단 바
				*/}
				<div className="sticky top-0 -mx-4 -mt-4 mb-4 flex h-20 flex-col justify-around bg-white px-4 py-2">
					{/*
						MARK: 기본 상태
					*/}
					{selectionMode === "none" && (
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<Tooltip defaultOpen={true} open={true}>
									<TooltipContent
										sideOffset={-4}
										align="start"
										className="rounded-lg bg-deep-blue fill-deep-blue px-3 py-2"
									>
										<p className="text-caption font-medium text-white">
											{auth.isAuthenticated
												? "같이 세탁할 옷 고르기"
												: "로그인 후 이용하실 수 있어요."}
										</p>
									</TooltipContent>
									<TooltipTrigger>
										<button
											onClick={() => {
												setSelectionMode("pick");
											}}
											disabled={auth.isAuthenticated === false}
											className="h-8 w-11 rounded-sm bg-main-blue-1 text-body-1 font-medium text-white"
										>
											선택
										</button>
									</TooltipTrigger>
								</Tooltip>
								<p className="text-body-1 font-medium text-dark-gray-2">
									총{" "}
									<span className="font-semibold text-main-blue-1">
										{laundryList.length}
									</span>
									개
								</p>
							</div>

							<div className="flex items-center gap-2">
								<button
									onClick={() => {
										setSelectionMode("delete");
									}}
									className="h-8 w-11 rounded-sm border border-gray-2 bg-gray-3 text-body-1 text-gray-1"
								>
									삭제
								</button>
								<Link
									to="/label-analysis"
									className="flex h-8 w-15.5 items-center justify-center gap-0.5 rounded-sm border border-main-blue-3 bg-gray-bluegray-1 text-body-1 font-medium text-main-blue-1"
								>
									<PlusIcon className="size-[18px]" />
									추가
								</Link>
							</div>
						</div>
					)}

					{/*
						MARK: 선택 모드
					*/}
					{selectionMode === "pick" && isSelecting && (
						<div className="flex items-center">
							<button
								onClick={() => {
									setSelectedLaundrySet(new Set());
									setSelectionMode("none");
								}}
								className="h-8 rounded-sm bg-light-gray-1 px-2 text-body-1 font-medium text-main-blue-1"
							>
								선택 취소
							</button>
						</div>
					)}

					{/*
						MARK: 삭제 모드
					*/}
					{selectionMode === "delete" && isSelecting && (
						<div className="flex items-center justify-between">
							<button
								onClick={() => {
									setSelectedLaundrySet(new Set());
									setSelectionMode("none");
								}}
								className="h-8 rounded-sm bg-light-gray-1 px-2 text-body-1 font-medium text-main-blue-1"
							>
								선택 취소
							</button>

							{selectedLaundryCount < laundryList.length ? (
								<button
									onClick={handleClickSelectAll}
									className="h-8 text-body-1 font-semibold text-dark-gray-1"
								>
									전체선택
								</button>
							) : (
								<button
									onClick={handleClickCancelSelectAll}
									className="h-8 text-body-1 font-semibold text-dark-gray-1"
								>
									전체해제
								</button>
							)}
						</div>
					)}

					<div>
						{selectionMode === "none" && (
							<p className="text-body-2 text-gray-1">
								사진을 누르면 상세 세탁솔루션을 볼 수 있어요
							</p>
						)}
						{selectionMode === "pick" && (
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
						)}
						{selectionMode === "delete" && (
							<div className="flex items-center gap-2">
								<p className="text-body-1 font-medium text-dark-gray-2">
									<span className="text-main-blue-1 tabular-nums">
										{selectedLaundrySet.size}/{laundryList.length}
									</span>{" "}
									선택중
								</p>
							</div>
						)}
					</div>
				</div>

				{/* 
					MARK: 세탁물 목록
				*/}
				{/* {auth.isAuthenticated && laundryListLocal.length > 0 && (
					<p className="mb-4 text-center text-body-2 text-dark-gray-2">
						오프라인 모드에서 저장된 세탁물 {laundryListLocal.length}개
					</p>
				)} */}
				{hasLaundry && (
					<LaundryBasket
						className="grow"
						laundryList={laundryList}
						onClick={handleClickLaundry}
						selectedLaundrySet={selectedLaundrySet}
					/>
				)}
				{hasLaundry === false && auth.isAuthenticated && (
					<EmptyLaundryBasket className="mt-[60px]" />
				)}
				{hasLaundry === false && auth.isAuthenticated === false && (
					<div className="mt-[60px] flex flex-col items-center">
						<img
							src={LaundryBasketErrorImg}
							role="presentation"
							className="w-[150px]"
						/>
						<p className="mt-6 text-title-3 font-medium text-black-2">
							회원 전용 기능이에요.
						</p>
						<p className="mt-2 text-body-1 text-dark-gray-2">
							빨래바구니는 로그인 후 이용하실 수 있어요.
						</p>
						<Link
							to="/auth/login"
							search={{ redirect: Route.fullPath }}
							className="mt-3 text-gray-1 underline underline-offset-4"
						>
							로그인 하러가기
						</Link>
					</div>
				)}

				{/*
					MARK: 솔루션 보러가기
				*/}
				{selectionMode === "pick" && canAnalyse && (
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
				{/*
					MARK: 삭제하기
				*/}
				{selectionMode === "delete" && hasSelectedLaundry && (
					<div className="sticky bottom-24">
						<button
							onClick={handleClickDeleteLaundry}
							className="flex h-14 w-full cursor-pointer items-center justify-center rounded-xl bg-black-2 text-subhead font-medium text-white"
						>
							삭제하기
						</button>
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
