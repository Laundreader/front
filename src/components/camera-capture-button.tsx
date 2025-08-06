import { cn } from "@/lib/utils";

import type { ComponentProps } from "react";

type CameraCaptureButtonProps = ComponentProps<"button"> & {
	totalCount: number;
	currentCount: number;
};

export const CameraCaptureButton = ({
	currentCount,
	totalCount,
	className,
	...props
}: CameraCaptureButtonProps) => {
	return (
		<button
			className={cn(
				"size-[56px] rounded-full border-4 border-white bg-white/30 text-body-2 font-medium text-white",
				className,
			)}
			{...props}
		>
			{currentCount}/{totalCount}
		</button>
	);
};
