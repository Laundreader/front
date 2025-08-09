import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { AiBadge } from "./ai-badge";
import { Chip } from "./chip";
import { Sheet, SheetClose, SheetContent } from "./ui/sheet";
import { cn } from "@/lib/utils";
import { laundryQueryOptions } from "@/features/laundry/api";

import type { Laundry } from "@/entities/laundry/model";

type CareGuideDetailSheetProps = {
	laundryId: Laundry["id"];
	isOpen: boolean;
	close: () => void;
	className?: string;
};

export const CareGuideDetailSheet = ({
	laundryId,
	isOpen,
	close,
	className,
}: CareGuideDetailSheetProps) => {
	const { data: laundry } = useSuspenseQuery(laundryQueryOptions(laundryId));

	const categoryContent = {
		wash: { title: "🧺 세탁", subtitle: "주요 세탁 방법" },
		dry: { title: "💨 탈수/건조", subtitle: "주요 탈수/건조 방법" },
		etc: { title: "🫧 그외", subtitle: "주의사항" },
	};

	const categories = ["wash", "dry", "etc"] as const;
	const [selectedCategory, setSelectedCategory] = useState<
		(typeof categories)[number]
	>(categories[0]);

	return (
		<Sheet open={isOpen} onOpenChange={close}>
			<SheetContent
				className={cn(
					"flex h-[722px] max-w-[393px] flex-col rounded-t-[48px] bg-light-gray-1 px-[16px] pt-[48px] pb-[36px]",
					className,
				)}
			>
				<div className="grow pb-[48px]">
					<h3 className="mb-[34px] flex items-center gap-[10px] text-subhead font-medium text-black-2">
						세탁 메뉴얼
						<AiBadge />
					</h3>

					<div className="flex flex-col gap-[18px]">
						<section className="rounded-[12px] bg-white p-[24px]">
							<div className="mb-[12px] flex justify-center gap-[12px]">
								<img
									src={laundry.images.label.data}
									className="size-[72px] rounded-[12px] object-cover"
								/>
								{laundry.images.real?.data && (
									<img
										src={laundry.images.real.data}
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
							<div className="mb-[24px] flex items-center justify-between">
								{categories.map((category) => {
									return (
										<Chip
											key={category}
											isActive={category === selectedCategory}
											onClick={() => setSelectedCategory(category)}
										>
											{categoryContent[category].title}
										</Chip>
									);
								})}
							</div>
							<h4 className="mb-[18px] text-subhead font-semibold text-dark-gray-1">
								{categoryContent[selectedCategory].subtitle}
							</h4>
							<p className="text-body-1 font-medium text-dark-gray-1">
								{
									laundry.solutions.find(
										(solution) => solution.name === selectedCategory,
									)?.contents
								}
							</p>
						</section>
					</div>
				</div>

				<SheetClose className="h-[48px] rounded-[8px] bg-black-2 text-subhead font-medium text-white">
					닫기
				</SheetClose>
			</SheetContent>
		</Sheet>
	);
};
