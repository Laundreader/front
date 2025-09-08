import { useState, type ComponentProps } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { AiBadge } from "./ai-badge";
import { Chip } from "./chip";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetTitle,
} from "./ui/sheet";
import type { Laundry } from "@/entities/laundry/model";
import { cn } from "@/lib/utils";
import { laundryQueryOptions } from "@/features/laundry/api";
import ChatBotLinkButtonImg from "@/assets/images/chat-bot-link-button.avif";
import type { UseNavigateResult } from "@tanstack/react-router";
import { overlay } from "overlay-kit";
import BlueTShirtImg from "@/assets/images/blue-t-shirt.avif";

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
	const [selectedCategory, setSelectedCategory] = useState<
		(typeof categories)[number]
	>(categories[0]);

	const { data: laundry } = useSuspenseQuery(laundryQueryOptions(laundryId));

	// 현재 카테고리에 해당하는 솔루션 (없을 경우 대비)
	const currentSolution = laundry.solutions.find(
		(solution) => solution.name === selectedCategory,
	);

	return (
		<Sheet open={isOpen} onOpenChange={close}>
			<SheetContent
				className={cn(
					"flex h-[722px] max-w-[393px] flex-col rounded-t-[48px] bg-light-gray-1 px-[16px] pt-[48px] pb-[36px]",
					className,
				)}
			>
				<div className="grow pb-[48px]">
					<SheetTitle className="mb-[34px] flex items-center gap-[10px] text-subhead font-medium text-black-2">
						세탁 메뉴얼
						<AiBadge />
					</SheetTitle>

					<div className="flex flex-col gap-[18px]">
						<section className="rounded-[12px] bg-white p-[24px]">
							<div className="mb-[12px] flex justify-center gap-[12px]">
								<img
									src={laundry.image.label?.data ?? BlueTShirtImg}
									className="size-[72px] rounded-[12px] object-cover"
								/>
								{laundry.image.clothes && (
									<img
										src={laundry.image.clothes.data}
										className="size-[72px] rounded-[12px] object-cover"
									/>
								)}
							</div>
							<p className="mb-[12px] text-center">
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
				</div>

				<div className="relative">
					{navigate && (
						<ChatBotLinkButton
							laundryId={laundryId}
							onClick={() => {
								overlay.unmountAll();
								navigate?.({ to: "/chat", search: { laundryId } });
							}}
							className="absolute right-8 bottom-14"
						/>
					)}

					<SheetClose className="h-12 w-full rounded-[8px] bg-black-2 text-subhead font-medium text-white">
						닫기
					</SheetClose>
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
		<div className={cn("relative w-fit", className)}>
			<button
				onClick={onClick}
				className="flex size-16 items-center justify-center rounded-full"
			>
				<img src={ChatBotLinkButtonImg} alt="" role="presentation" />
				<span className="sr-only">챗봇에게 물어보기</span>
			</button>

			<p
				className={cn(
					// 위치: 컨테이너 기준 버튼 중앙 위
					"pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2",
					// 레이아웃: 폭 보존
					"inline-block w-auto whitespace-nowrap",
					// 스타일
					"rounded-md bg-purple px-2 py-1 text-caption font-semibold text-white shadow-lg",
					// 꼬리
					"after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-purple",
				)}
			>
				더 궁금한 게 있나요?
			</p>
		</div>
	);
};
