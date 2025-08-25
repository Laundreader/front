import { type ComponentProps, useState, useEffect } from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";

function TooltipProvider({
	delayDuration = 0,
	...props
}: ComponentProps<typeof TooltipPrimitive.Provider>) {
	return (
		<TooltipPrimitive.Provider
			data-slot="tooltip-provider"
			delayDuration={delayDuration}
			{...props}
		/>
	);
}

function Tooltip({
	defaultOpen = true,
	open,
	timeout = 3000,
	onOpenChange,
	...props
}: ComponentProps<typeof TooltipPrimitive.Root> & { timeout?: number }) {
	// open 또는 defaultOpen으로 초기화
	const [isOpen, setIsOpen] = useState(open ?? defaultOpen);

	// open이 바뀔 때마다 내부 상태(isOpen)와 동기화
	useEffect(() => {
		if (open === undefined) {
			return;
		}

		setIsOpen(open);
	}, [open]);

	// isOpen이 true가 되면 timeout 후에 자동 닫기
	useEffect(() => {
		if (isOpen === false) {
			return;
		}

		const timer = window.setTimeout(() => {
			setIsOpen(false);
			onOpenChange?.(false);
		}, timeout);

		return () => {
			window.clearTimeout(timer);
		};
	}, [isOpen, timeout, onOpenChange]);

	function handleOpenChange(open: boolean) {
		setIsOpen(open);
		onOpenChange?.(open);
	}

	return (
		<TooltipProvider>
			<TooltipPrimitive.Root
				data-slot="tooltip"
				open={isOpen}
				onOpenChange={handleOpenChange}
				{...props}
			/>
		</TooltipProvider>
	);
}

function TooltipTrigger({
	...props
}: ComponentProps<typeof TooltipPrimitive.Trigger>) {
	return (
		<TooltipPrimitive.Trigger data-slot="tooltip-trigger" asChild {...props} />
	);
}

function TooltipContent({
	className,
	sideOffset = 0,
	children,
	...props
}: ComponentProps<typeof TooltipPrimitive.Content>) {
	return (
		<TooltipPrimitive.Portal>
			<TooltipPrimitive.Content
				data-slot="tooltip-content"
				sideOffset={sideOffset}
				className={cn(
					"z-50 w-fit origin-(--radix-tooltip-content-transform-origin) text-balance animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
					className,
				)}
				{...props}
			>
				{children}
				<TooltipPrimitive.Arrow className="z-50 size-4 -translate-y-1/2 fill-inherit" />
			</TooltipPrimitive.Content>
		</TooltipPrimitive.Portal>
	);
}

export { Tooltip, TooltipTrigger, TooltipContent };
