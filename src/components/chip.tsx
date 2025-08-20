import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ChipProps = {
	children: ReactNode;
	isActive: boolean;
	onClick: () => void;
	className?: string;
};

export const Chip = ({ children, isActive, onClick, className }: ChipProps) => {
	return (
		<button
			className={cn(
				"rounded-full px-[16px] py-[8px] text-body-2",
				isActive ? "bg-dark-gray-1 text-white" : "bg-gray-3 text-dark-gray-1",
				className,
			)}
			onClick={onClick}
		>
			{children}
		</button>
	);
};

export const BlueChip = ({
	children,
	isActive,
	onClick,
	className,
}: ChipProps) => {
	return (
		<button
			className={cn(
				"rounded-full border px-[16px] py-[8px] text-body-2 font-medium",
				isActive
					? "border-main-blue-3 bg-light-blue text-main-blue-1"
					: "border-gray-bluegray-2 bg-gray-bluegray-1 text-dark-gray-2",
				className,
			)}
			onClick={onClick}
		>
			{children}
		</button>
	);
};
