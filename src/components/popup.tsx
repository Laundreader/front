import { useEffect } from "react";
import { Content as DialogContent } from "@radix-ui/react-dialog";
import {
	Dialog,
	DialogPortal,
	DialogDescription,
	DialogTitle,
	DialogOverlay,
} from "./ui/dialog";
import LaundryBasketImg from "@/assets/images/laundry-basket.avif";
import LaundryBasketConfettiImg from "@/assets/images/laundry-basket-confetti.avif";
import LaundryBasketErrorImg from "@/assets/images/laundry-basket-error.avif";
import { cn } from "@/lib/utils";

interface PopupProps {
	close: () => void;
	isOpen: boolean;
	variant: "success" | "fail" | "pending";
	timeout?: number;
	className?: string;
}

const content = {
	pending: {
		img: LaundryBasketImg,
		title: "빨래바구니에 담는 중이에요",
		body: "잠시만 기다려주세요...",
	},
	fail: {
		img: LaundryBasketErrorImg,
		title: "빨래바구니에 담지 못했어요",
		body: "잠시 문제가 생겼어요. 다시 넣어주세요!",
	},
	success: {
		img: LaundryBasketConfettiImg,
		title: "빨랫감이 잘 담겼어요!",
		body: "한 번에 세탁할 때 해결책을 알려줄게요",
	},
} as const;

const style = {
	pending: {
		bg: "bg-white",
		title: "text-black-2",
		body: "text-dark-gray-2",
	},
	fail: {
		bg: "bg-white",
		title: "text-black-2",
		body: "text-dark-gray-2",
	},
	success: {
		bg: "bg-navy",
		title: "text-white",
		body: "text-light-gray-1",
	},
} as const;

export const Popup = ({
	close,
	isOpen,
	variant,
	timeout,
	className,
}: PopupProps) => {
	useEffect(() => {
		if (isOpen && timeout !== undefined) {
			const timer = window.setTimeout(() => {
				close();
			}, timeout);

			return () => {
				if (timer) {
					window.clearTimeout(timer);
				}
			};
		}
	});

	return (
		<Dialog open={isOpen} onOpenChange={close}>
			<DialogPortal data-slot="dialog-portal">
				<DialogOverlay />
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
						"fixed top-1/2 left-1/2 z-50 scrollbar-hidden w-full max-w-80 -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl px-11 pt-6 pb-12 shadow-[0_4px_40px_rgba(0,0,0,0.25)]",
						"duration-200 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
						style[variant].bg,
						className,
					)}
				>
					<div className="mb-6 aspect-2/1 w-full">
						<img
							src={content[variant].img}
							role="presentation"
							className="h-full w-full object-contain"
						/>
					</div>
					<DialogTitle
						className={cn(
							"mb-2 text-center text-title-3 font-medium text-black-2",
							style[variant].title,
						)}
					>
						{content[variant].title}
					</DialogTitle>
					<DialogDescription
						className={cn("text-center text-body-1", style[variant].body)}
					>
						{content[variant].body}
					</DialogDescription>
				</DialogContent>
			</DialogPortal>
		</Dialog>
	);
};
