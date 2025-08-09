import AiStarIcon from "@/assets/icons/ai-star.svg?react";

export const AiBadge = () => {
	return (
		<div
			className="flex h-[22px] w-[60px] items-center justify-center rounded-full p-[1px]"
			style={{
				background: "linear-gradient(140deg, #2B91FF 0%, #8DC4FF 100%)",
			}}
		>
			<div className="flex h-full w-full items-center justify-center gap-[2px] rounded-full bg-white">
				<AiStarIcon />
				<span className="text-caption font-medium text-main-blue-1">
					Ai분석
				</span>
			</div>
		</div>
	);
};
