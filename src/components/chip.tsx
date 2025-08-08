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
				"shrink-0 rounded-full px-[16px] py-[8px] text-body-2",
				isActive ? "bg-dark-gray-1 text-white" : "bg-gray-3 text-dark-gray-1",
			)}
			onClick={onClick}
		>
			{children}
		</button>
	);
};

export const BlueChip = ({ children, isActive, onClick }: ChipProps) => {
	return (
		<button
			className={cn(
				"shrink-0 rounded-full border px-[16px] py-[8px] text-body-2 font-medium",
				isActive
					? "border-main-blue-3 bg-light-blue text-main-blue-1"
					: "border-gray-bluegray-2 bg-gray-bluegray-1 text-dark-gray-2",
			)}
			onClick={onClick}
		>
			{children}
		</button>
	);
};
