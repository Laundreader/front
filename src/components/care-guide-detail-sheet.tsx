import { useState } from "react";
import { AiBadge } from "./ai-badge";
import { Chip } from "./chip";
import { SheetContent, Sheet, SheetClose } from "./ui/sheet";
import { cn } from "@/lib/utils";

export const CareGuideDetailSheet = ({
	isOpen,
	close,
	className,
}: {
	isOpen: boolean;
	close: () => void;
	className?: string;
}) => {
	const categories = ["🧺 세탁", "💨 탈수/건조", "🫧 그외"] as const;
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
									src=""
									className="size-[72px] rounded-[12px] object-cover"
								/>
								<img
									src=""
									className="size-[72px] rounded-[12px] object-cover"
								/>
							</div>
							<p className="mb-[12px] text-center">
								이 세탁물의 소재는 100% 면이에요
							</p>
							<div className="flex items-center justify-center gap-[8px]">
								{["유색", "프린트나 장식이 있어요"].map((tag) => {
									return (
										<span className="rounded-[4px] p-[4px] text-caption font-medium">
											{tag}
										</span>
									);
								})}
							</div>
						</section>

						<section className="rounded-[12px] bg-white p-[24px]">
							<div className="mb-[24px] flex items-center justify-between">
								{categories.map((cate) => {
									return (
										<Chip
											isActive={cate === selectedCategory}
											key={cate}
											onClick={() => setSelectedCategory(cate)}
										>
											{cate}
										</Chip>
									);
								})}
							</div>
							<h4 className="mb-[18px] text-subhead font-semibold text-dark-gray-1">
								주요 세탁 방법
							</h4>
							<p className="text-body-1 font-medium text-dark-gray-1">
								일반 코스로 세탁하면 돼요.
								<br />
								찬물 또는 30-40도 미지근한 물이 좋아요.
								<br />
								너무 뜨거운 물(60도 이상)은 피해주세요.
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
