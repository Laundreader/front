import { cn } from "@/lib/utils";

import type { ReactNode } from "react";

type ChipProps = {
	children: ReactNode;
	isActive: boolean;
	onClick: () => void;
};

export const Chip = ({ children, isActive, onClick }: ChipProps) => {
	return (
		<button
			className={cn(
				"cursor-pointer rounded-full px-[16px] py-[8px] text-body-2",
				isActive ? "bg-dark-gray-1 text-white" : "bg-gray-3 text-dark-gray-1",
			)}
			onClick={onClick}
		>
			{children}
		</button>
	);
};
