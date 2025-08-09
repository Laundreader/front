export const Loader = () => {
	return (
		<div className="flex gap-[12px]">
			{[0, 0.16, 0.32].map((delay) => (
				<div
					key={delay}
					style={{ animationDelay: `${delay}s` }}
					className={
						"h-[12px] w-[12px] animate-dot-pulse rounded-full bg-main-blue-1"
					}
				/>
			))}
		</div>
	);
};
