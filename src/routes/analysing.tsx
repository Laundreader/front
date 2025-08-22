import {
	Link,
	Navigate,
	createFileRoute,
	useBlocker,
} from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import CloseIcon from "@/assets/icons/close.svg?react";
import { Loader } from "@/components/loader";
import {
	HamperSolutionQueryOptions,
	laundrySolutionQueryOptions,
} from "@/features/laundry/api";
import { useTempLaundry } from "@/entities/laundry/store/temp";
import { laundryIdsSearchSchema } from "./-schema";
import { overlay } from "overlay-kit";
import { ConfirmDialog } from "@/components/confirm-dialog";
import BubblySadImg from "@/assets/images/bubbly-sad.avif";
import { useMemo } from "react";
import { LAUNDRY_TIPS } from "@/shared/constant";
import type { LaundrySolutionRequest } from "@/entities/laundry/model";
import SolutionLoadingBgImg from "@/assets/images/solution-loading-bg.avif";

export const Route = createFileRoute("/analysing")({
	validateSearch: laundryIdsSearchSchema,
	errorComponent: () => <Navigate to="/laundry-basket" replace />,
	component: RouteComponent,
});

function RouteComponent() {
	const { laundryIds } = Route.useSearch();
	const tempLaundry = useTempLaundry();

	if (laundryIds.length === 0 && tempLaundry.state === null) {
		return <Navigate to="/label-analysis" replace />;
	}

	const randomTip = useMemo(() => {
		const randomIndex = Math.floor(Math.random() * LAUNDRY_TIPS.length);
		return LAUNDRY_TIPS[randomIndex];
	}, []);

	const isLaundryQuery = tempLaundry.state !== null;

	let laundry: LaundrySolutionRequest["laundry"] | null = null;
	if (tempLaundry.state) {
		const { image, ...rest } = tempLaundry.state;
		laundry = rest;
	}

	const queryClient = useQueryClient();
	const laundryQuery = useQuery({
		...laundrySolutionQueryOptions({ laundry: laundry! }),
		enabled: isLaundryQuery && laundry !== null,
	});
	const hamperQuery = useQuery({
		...HamperSolutionQueryOptions(laundryIds),
		enabled: isLaundryQuery === false,
	});

	const isError = laundryQuery.isError || hamperQuery.isError;
	const isSuccess = laundryQuery.isSuccess || hamperQuery.isSuccess;

	useBlocker({
		shouldBlockFn: async ({ next }) => {
			if (next.fullPath !== "/laundry-basket") {
				return true;
			}

			const shouldBlock = await overlay.openAsync<boolean>(
				({ isOpen, close }) => {
					return (
						<ConfirmDialog
							img={BubblySadImg}
							title="정말 나가시겠어요?"
							body="페이지를 떠나면, 진행한 내용은 모두 사라져요."
							isOpen={isOpen}
							confirm={() => close(false)}
							cancel={() => close(true)}
						/>
					);
				},
				{ overlayId: "leave-confirm-dialog" },
			);

			if (shouldBlock) {
				return true;
			}

			tempLaundry.clear();
			queryClient.cancelQueries({
				queryKey: [isLaundryQuery ? "laundry-solution" : "hamper-solution"],
				exact: true,
			});

			return false;
		},
		withResolver: true,
	});

	if (isError) {
		return <Navigate to="/analysis-failed" replace />;
	}

	if (isSuccess) {
		overlay.unmount("leave-confirm-dialog");

		if (isLaundryQuery) {
			return <Navigate to="/laundry-solution" replace />;
		} else {
			return (
				<Navigate
					to="/laundry-basket-analysis-result"
					search={{ laundryIds }}
					replace
				/>
			);
		}
	}

	return (
		<div
			className="flex min-h-dvh flex-col bg-cover bg-center bg-no-repeat p-4"
			style={{ backgroundImage: `url(${SolutionLoadingBgImg})` }}
		>
			<header>
				<Link to="/laundry-basket" className="ml-auto block w-fit">
					<CloseIcon />
					<span className="sr-only">빨래바구니로 돌아가기</span>
				</Link>
			</header>

			<div className="flex grow flex-col justify-between">
				<div>
					<div>
						<p className="text-center text-title-1 font-semibold text-pretty text-black-2">
							지금부터 알려주신 내용으로
							<br />
							맞춤형 세탁법을 알려드릴게요
						</p>
					</div>

					<div className="flex flex-col items-center gap-4">
						<Loader />
					</div>
				</div>

				<div>
					<span className="mb-[12px] block text-large-title font-semibold text-deep-blue">
						Tip!
					</span>
					<p className="text-title-2 font-semibold text-dark-gray-1">
						{randomTip}
					</p>
				</div>
			</div>
		</div>
	);
}
