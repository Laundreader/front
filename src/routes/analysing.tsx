import { Link, Navigate, createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { laundryIdsSearchSchema } from "./-schema";
import AnalysingBgImg from "@/assets/images/analysing-bg.png";
import CloseIcon from "@/assets/icons/close.svg?react";
import { Loader } from "@/components/loader";
import { LAUNDRY_TIPS } from "@/entities/laundry/const";
import { laundryBasketSolutionQueryOptions } from "@/features/laundry/api";

export const Route = createFileRoute("/analysing")({
	validateSearch: laundryIdsSearchSchema,
	errorComponent: () => <Navigate to="/laundry-basket" replace />,
	component: RouteComponent,
});

function RouteComponent() {
	const { laundryIds } = Route.useSearch();
	const queryClient = useQueryClient();

	// TODO: indexedDB에서 각 id에 해당하는 세탁물 정보를 가져오기

	const { isSuccess, isError } = useQuery(
		laundryBasketSolutionQueryOptions(laundryIds),
	);

	if (isError) {
		return <Navigate to="/analysis-failed" search={{ laundryIds }} replace />;
	}

	if (isSuccess) {
		return (
			<Navigate
				to="/laundry-basket-analysis-result"
				search={{ laundryIds }}
				replace
			/>
		);
	}

	const randomTip =
		LAUNDRY_TIPS[Math.floor(Math.random() * LAUNDRY_TIPS.length)];

	return (
		<div>
			<img
				src={AnalysingBgImg}
				role="presentation"
				className="wi-full h-auto object-cover"
			/>

			<div className="absolute inset-0 flex flex-col justify-between px-[16px] pt-[54px] pb-[106px]">
				<div>
					<header className="mb-[24px]">
						<Link
							to="/laundry-basket"
							onClick={() =>
								queryClient.cancelQueries(
									laundryBasketSolutionQueryOptions(laundryIds),
								)
							}
							className="ml-auto block w-fit"
						>
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
