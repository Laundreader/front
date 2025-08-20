import { cn } from "@/lib/utils";
import {
	Dialog,
	DialogPortal,
	DialogDescription,
	DialogTitle,
} from "./ui/dialog";
import { Content as DialogContent } from "@radix-ui/react-dialog";
import { useEffect } from "react";

interface PopupProps {
	img: string;
	title: string;
	body: string;
	close: () => void;
	isOpen: boolean;
	timeout?: number;
	className?: string;
}

export const Popup = ({
	img,
	title,
	body,
	close,
	isOpen,
	timeout,
	className,
}: PopupProps) => {
	useEffect(() => {
		if (isOpen && timeout !== undefined) {
			const timer = setTimeout(() => {
				close();
			}, timeout);

			return () => {
				if (timer) {
					clearTimeout(timer);
				}
			};
		}
	});

	return (
		<Dialog open={isOpen} onOpenChange={close}>
			<DialogPortal data-slot="dialog-portal">
				<DialogContent
					data-slot="dialog-content"
					onEscapeKeyDown={(e) => {
						e.preventDefault();
					}}
					onPointerDownOutside={(e) => {
						e.preventDefault();
					}}
					onInteractOutside={(e) => {
						e.preventDefault();
					}}
					className={cn(
						"fixed top-1/2 left-1/2 z-50 scrollbar-hidden w-full max-w-80 -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl bg-white px-11 pt-6 pb-12 shadow-[0_4px_40px_rgba(0,0,0,0.25)]",
						"duration-200 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
						className,
					)}
				>
					<div className="mb-6 aspect-2/1 w-full">
						<img
							src={img}
							role="presentation"
							className="h-full w-full object-contain"
						/>
					</div>
					<DialogTitle className="mb-2 text-center text-title-3 font-medium text-black-2">
						{title}
					</DialogTitle>
					<DialogDescription className="text-center text-body-1 text-dark-gray-2">
						{body}
					</DialogDescription>
				</DialogContent>
			</DialogPortal>
		</Dialog>
	);
};
