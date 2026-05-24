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
import CloseIcon from "@/assets/icons/close.svg?react";
import { cn } from "@/lib/utils";
// import { Link } from "@tanstack/react-router";

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
		bg: "bg-white",
		title: "text-black-2",
		body: "text-dark-gray-2",
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
						"fixed top-1/2 left-1/2 z-50 scrollbar-hidden flex aspect-square w-full max-w-80 -translate-x-1/2 -translate-y-1/2 flex-col justify-between overflow-y-auto rounded-3xl p-4 shadow-[0_4px_40px_rgba(0,0,0,0.25)]",
						"duration-200 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
						style[variant].bg,
						className,
					)}
				>
					<div className="aspect-2/1 w-full px-4 pt-4">
						<img
							src={content[variant].img}
							role="presentation"
							className="h-full w-full object-contain"
						/>
					</div>

					<div>
						<DialogTitle
							className={cn(
								"mb-2 text-center text-title-3 font-medium",
								style[variant].title,
							)}
						>
							<span className="text-title-3">{content[variant].title}</span>
						</DialogTitle>
						<DialogDescription
							className={cn("text-center text-body-1", style[variant].body)}
						>
							{content[variant].body}
						</DialogDescription>
					</div>

					{/* {variant === "success" && (
						<Link
							to="/laundry-basket"
							className="flex h-12 w-full items-center justify-center rounded-lg bg-main-blue-1 text-subhead font-medium text-white"
						>
							빨래바구니 보러가기
						</Link>
					)} */}

					{variant === "fail" && (
						<button
							className="h-12 w-full rounded-lg bg-main-blue-1 text-subhead font-medium text-white"
							onClick={close}
						>
							확인했어요
						</button>
					)}

					{variant === "success" && (
						<button>
							<span className="sr-only">닫기</span>
							<CloseIcon
								className="absolute top-4 right-4 size-6 text-gray-1"
								onClick={close}
							/>
						</button>
					)}
				</DialogContent>
			</DialogPortal>
		</Dialog>
	);
};
