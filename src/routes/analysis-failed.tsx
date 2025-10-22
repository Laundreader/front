import { Link, Navigate, createFileRoute } from "@tanstack/react-router";
import AnalysisFailedBgImg from "@/assets/images/analysis-failed-bg.avif";
import CloseIcon from "@/assets/icons/close.svg?react";
import { useLaundryDraft } from "@/entities/laundry/store/draft";

export const Route = createFileRoute("/analysis-failed")({
	component: RouteComponent,
});

function RouteComponent() {
	const laundryDraft = useLaundryDraft();
	if (laundryDraft.state === null) {
		return <Navigate to="/label-analysis" replace />;
	}

	return (
		<>
			<img
				src={AnalysisFailedBgImg}
				role="presentation"
				className="object-center"
			/>

			<section className="absolute inset-0 flex flex-col gap-[22px] px-[16px] pt-[54px] pb-[46px]">
				<header>
					<Link to="/laundry-basket" replace className="ml-auto block w-fit">
						<CloseIcon />
						<span className="sr-only">빨래바구니로 돌아가기</span>
					</Link>
				</header>

				<div className="flex grow flex-col justify-between">
					<div className="text-center text-title-1 font-semibold text-black-2">
						<p>분석하다 잠깐 오류가 있었어요</p>
						<p>다시 시도해볼까요?</p>
					</div>

					<Link
						to="/analysing"
						replace
						className="flex h-[56px] items-center justify-center rounded-[10px] bg-black-2 text-subhead font-medium text-white"
					>
						다시 분석해주세요
					</Link>
				</div>
			</section>
		</>
	);
}
