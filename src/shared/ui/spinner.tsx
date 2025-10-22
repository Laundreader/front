import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

export const Spinner = ({ className, ...props }: ComponentProps<"div">) => {
	return (
		<div
			{...props}
			className={cn(
				"relative flex size-16 animate-spin-ccw items-center justify-center rounded-full bg-conic from-main-blue-1 via-main-blue-1 via-20% to-white/0 to-90%",
				className,
			)}
		>
			<div className="size-12 rounded-full bg-white"></div>
			<div className="absolute top-0 size-2.5 rounded-full bg-main-blue-1"></div>
		</div>
	);
};
