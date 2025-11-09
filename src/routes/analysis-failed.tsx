import { Link, Navigate, createFileRoute } from "@tanstack/react-router";
import CloseIcon from "@/assets/icons/close.svg?react";
import BubblySideRedImg from "@/assets/images/laundreader-character-red.avif";
import SolutionLoadingBgImg from "@/assets/images/solution-loading-bg.avif";
// import { Loader } from "@/components/loader";
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

			<div className="flex grow flex-col items-center justify-between">
				<p className="text-center text-title-1 font-semibold text-black-2">
					분석하다 잠깐 오류가 있었어요. 다시 시도해볼까요?
				</p>

				{/* <div className="flex flex-col items-center gap-4">
					<Loader />
				</div> */}

				<img
					src={BubblySideRedImg}
					alt=""
					role="presentation"
					className="size-54 animate-bubble"
				/>

				<Link
					to="/analysing"
					replace
					className="flex h-14 w-full items-center justify-center rounded-[10px] bg-black-2 text-subhead font-medium text-white"
				>
					다시 분석해주세요
				</Link>
			</div>
		</div>
	);
}
