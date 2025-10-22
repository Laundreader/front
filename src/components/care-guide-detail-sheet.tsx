import { useState, type ComponentProps } from "react";
import { useQuery } from "@tanstack/react-query";
import { AiBadge } from "./ai-badge";
import { Chip } from "./chip";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetTitle,
} from "./ui/sheet";
import { cn } from "@/lib/utils";
import ChatBotLinkButtonImg from "@/assets/images/chat-bot-link-button.avif";
import { overlay } from "overlay-kit";
import BlueTShirtImg from "@/assets/images/blue-t-shirt.avif";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";
import { laundryApi, laundryApiLocal } from "@/entities/laundry/api";
import { useAuth } from "@/features/auth/use-auth";

import type { Laundry } from "@/entities/laundry/model";
import type { UseNavigateResult } from "@tanstack/react-router";

type CareGuideDetailSheetProps = {
	laundryId: Laundry["id"];
	isOpen: boolean;
	close: () => void;
	className?: string;
	navigate?: UseNavigateResult<string>;
};

const categories = ["wash", "dry", "etc"] as const;
const categoryContent = {
	wash: { title: "🧺 세탁", subtitle: "주요 세탁 방법" },
	dry: { title: "💨 탈수/건조", subtitle: "주요 탈수/건조 방법" },
	etc: { title: "🫧 그외", subtitle: "주의사항" },
};

export const CareGuideDetailSheet = ({
	laundryId,
	isOpen,
	close,
	className,
	navigate,
}: CareGuideDetailSheetProps) => {
	const { auth } = useAuth();
	const [selectedCategory, setSelectedCategory] = useState<
		(typeof categories)[number]
	>(categories[0]);

	const { data: laundry } = useQuery({
		queryKey: ["laundry", laundryId],
		queryFn: () =>
			auth.isAuthenticated
				? laundryApi.getLaundry(laundryId)
				: laundryApiLocal.getLaundry(laundryId),
	});

	if (!laundry) {
		return null;
	}

	// 현재 카테고리에 해당하는 솔루션 (없을 경우 대비)
	const currentSolution = laundry?.solutions.find(
		(solution) => solution.name === selectedCategory,
	);

	const images = [];
	if (laundry.image.label) {
		images.push(laundry.image.label);
	}
	if (laundry.image.clothes) {
		images.push(laundry.image.clothes);
	}
	if (images.length === 0) {
		images.push(BlueTShirtImg);
	}

	return (
		<Sheet open={isOpen} onOpenChange={close}>
			<SheetContent
				className={cn(
					"flex h-[722px] max-w-[393px] flex-col rounded-t-[48px] bg-light-gray-1 px-[16px] pt-[48px] pb-[36px]",
					className,
				)}
			>
				<div className="grow">
					<SheetTitle className="mb-[34px] flex items-center gap-2.5 text-subhead font-medium text-black-2">
						세탁 메뉴얼
						<AiBadge />
					</SheetTitle>

					<div className="flex flex-col gap-4.5">
						<section className="rounded-xl bg-white p-6">
							<div className="mb-3 flex justify-center gap-3">
								{images.map((imgSrc) => (
									<img
										key={imgSrc}
										src={imgSrc}
										className="size-18 rounded-xl object-cover"
									/>
								))}
							</div>
							<p className="mb-3 text-center">
								이 세탁물의 소재는 {laundry.materials.join(", ")}이에요
							</p>
							<div className="flex items-center justify-center gap-[8px]">
								{laundry.color && (
									<span className="rounded-[4px] bg-label-yellow p-[4px] text-caption font-medium text-[#e9af32]">
										{laundry.color}
									</span>
								)}
								{laundry.hasPrintOrTrims && (
									<span className="rounded-[4px] bg-label-green p-[4px] text-caption font-medium text-[#76c76f]">
										프린트나 장식이 있어요
									</span>
								)}
							</div>
						</section>

						<section className="rounded-[12px] bg-white p-[24px]">
							<ul className="mb-[24px] scrollbar-hidden flex items-center justify-between gap-2 overflow-x-auto">
								{categories.map((category) => {
									return (
										<li key={category} className="shrink-0">
											<Chip
												isActive={category === selectedCategory}
												onClick={() => setSelectedCategory(category)}
											>
												{categoryContent[category].title}
											</Chip>
										</li>
									);
								})}
							</ul>
							<h4 className="mb-[18px] text-subhead font-semibold text-dark-gray-1">
								{categoryContent[selectedCategory].subtitle}
							</h4>
							<SheetDescription className="text-body-1 font-medium whitespace-pre-line text-dark-gray-1">
								{currentSolution?.contents}
							</SheetDescription>
						</section>
					</div>

					<div className="sticky bottom-0 left-0 mt-2 flex w-full flex-col gap-9 px-[16px]">
						{navigate && (
							<ChatBotLinkButton
								laundryId={laundryId}
								onClick={() => {
									overlay.unmountAll();
									navigate?.({ to: "/chat", search: { laundryId } });
								}}
								className="mr-3 ml-auto"
							/>
						)}

						<SheetClose className="h-12 w-full rounded-[8px] bg-black-2 text-subhead font-medium text-white">
							닫기
						</SheetClose>
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);
};

type ChatBotLinkButtonProps = ComponentProps<"button"> & {
	laundryId: Laundry["id"];
};

const ChatBotLinkButton = ({ className, onClick }: ChatBotLinkButtonProps) => {
	return (
		<div className={className}>
			<Tooltip>
				<TooltipTrigger>
					<button
						onClick={onClick}
						className="flex size-16 items-center justify-center rounded-full"
					>
						<img src={ChatBotLinkButtonImg} alt="" role="presentation" />
						<span className="sr-only">챗봇에게 물어보기</span>
					</button>
				</TooltipTrigger>
				<TooltipContent className="rounded-md bg-purple fill-purple px-2 py-1">
					<p className="text-caption font-semibold text-white">
						더 궁금한 게 있나요?
					</p>
				</TooltipContent>
			</Tooltip>
		</div>
	);
};
