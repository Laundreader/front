import { Link } from "@tanstack/react-router";
import CloseIcon from "@/assets/icons/close.svg?react";
import SolutionLoadingBgImg from "@/assets/images/solution-loading-bg.avif";
import BubblySideRedImg from "@/assets/images/laundreader-character-red.avif";

export const AnalysisError = ({ onRetry }: { onRetry: () => void }) => {
	return (
		<div
			style={{ backgroundImage: `url(${SolutionLoadingBgImg})` }}
			className="grid h-dvh grid-rows-[auto_1fr] flex-col bg-cover bg-center bg-no-repeat"
		>
			<header className="p-4">
				<Link to="/" replace className="ml-auto block w-fit">
					<CloseIcon />
					<span className="sr-only">분석 중단하고 나가기</span>
				</Link>
			</header>

			<section className="flex flex-col items-center justify-between p-4">
				<p className="text-center text-title-1 font-semibold text-black-2">
					분석하다 잠깐 오류가 있었어요. 다시 시도해볼까요?
				</p>

				<img
					src={BubblySideRedImg}
					alt=""
					role="presentation"
					className="size-54 animate-bubble"
				/>

				<button
					onClick={onRetry}
					className="flex h-14 w-full items-center justify-center rounded-[10px] bg-black-2 text-subhead font-medium text-white"
				>
					다시 분석해주세요
				</button>
			</section>
		</div>
	);
};
