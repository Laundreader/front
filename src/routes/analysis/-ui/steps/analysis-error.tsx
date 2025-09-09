import { Link } from "@tanstack/react-router";
import CloseIcon from "@/assets/icons/close.svg?react";
import AnalysingErrorBgImg from "@/assets/images/analysis-failed-bg.avif";

export const AnalysisError = ({ onRetry }: { onRetry: () => void }) => {
	return (
		<div
			style={{ backgroundImage: `url(${AnalysingErrorBgImg})` }}
			className="grid h-dvh grid-rows-[auto_1fr] flex-col bg-cover bg-center bg-no-repeat"
		>
			<header className="p-4">
				<Link to="/" replace className="ml-auto block w-fit">
					<CloseIcon />
					<span className="sr-only">분석 중단하고 나가기</span>
				</Link>
			</header>

			<section className="flex flex-col justify-between p-4">
				<div className="text-center text-title-1 font-semibold break-keep text-black-2">
					<p>분석하다 잠깐 오류가 있었어요</p>
					<p>다시 시도해볼까요?</p>
				</div>

				<button
					onClick={onRetry}
					className="flex h-14 items-center justify-center rounded-[10px] bg-black-2 text-subhead font-medium text-white"
				>
					다시 분석해주세요
				</button>
			</section>
		</div>
	);
};
