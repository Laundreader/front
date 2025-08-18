import {
	Link,
	Navigate,
	createFileRoute,
	useBlocker,
} from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import AnalysingBgImg from "@/assets/images/analysing-bg.png";
import CloseIcon from "@/assets/icons/close.svg?react";
import { Loader } from "@/components/loader";
import {
	HamperSolutionQueryOptions,
	laundrySolutionQueryOptions,
} from "@/features/laundry/api";
import { LAUNDRY_TIPS } from "@/shared/constant";
import { useTempLaundry } from "@/entities/laundry/store/temp";
import { laundryIdsSearchSchema } from "./-schema";
import { overlay } from "overlay-kit";
import { ConfirmDialog } from "@/components/confirm-dialog";
import BubblySadImg from "@/assets/images/bubbly-sad.png";

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

	const isSingle = tempLaundry.state !== null;

	const queryClient = useQueryClient();
	const singleQuery = useQuery({
		...laundrySolutionQueryOptions({ laundry: tempLaundry.state! }),
		enabled: isSingle,
	});
	const basketQuery = useQuery({
		...HamperSolutionQueryOptions(laundryIds),
		enabled: isSingle === false,
	});

	const isError = singleQuery.isError || basketQuery.isError;
	const isSuccess = singleQuery.isSuccess || basketQuery.isSuccess;

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
				queryKey: [isSingle ? "laundry-solution" : "hamper-solution"],
				exact: true,
			});

			return false;
		},
	});

	if (isError) {
		return <Navigate to="/analysis-failed" replace />;
	}

	if (isSuccess) {
		overlay.unmount("leave-confirm-dialog");

		if (isSingle) {
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

	const randomTip =
		LAUNDRY_TIPS[Math.floor(Math.random() * LAUNDRY_TIPS.length)];

	return (
		<div
			className={`min-h-dvh bg-cover bg-center bg-no-repeat`}
			style={{ backgroundImage: `url(${AnalysingBgImg})` }}
		>
			<div className="absolute inset-0 flex flex-col justify-between px-[16px] pt-[54px] pb-[106px]">
				<div>
					<header className="mb-[24px]">
						<Link to="/laundry-basket" className="ml-auto block w-fit">
							<CloseIcon />
							<span className="sr-only">빨래바구니로 돌아가기</span>
						</Link>
					</header>

					<div className="mb-[42px] text-center text-title-1 font-semibold text-black-2">
						<p>모든 정보를 확인했어요!</p>
						<p>지금부터 알려주신 내용으로</p>
						<p>맞춤형 세탁법을 알려드릴게요</p>
					</div>

					<div className="flex justify-center">
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
