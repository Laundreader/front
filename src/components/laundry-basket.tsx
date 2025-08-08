import type { Laundry } from "@/entities/laundry/model";
import { cn } from "@/lib/utils";

interface LaundryBasketProps {
	laundryList: Array<Laundry>;
	onClick: (id: Laundry["id"]) => void;
	selectedLaundrySet: Set<Laundry["id"]>;
	className?: string;
}

export const LaundryBasket = ({
	className,
	laundryList,
	onClick,
	selectedLaundrySet,
}: LaundryBasketProps) => {
	return (
		<ul className={cn("grid grid-cols-2 gap-[16px] pb-[16px]", className)}>
			{laundryList.map((laundry) => {
				return (
					<li key={laundry.id}>
						{/* 세탁물 카드 */}
						<div
							onClick={() => onClick(laundry.id)}
							className={cn(
								"aspect-square cursor-pointer rounded-[24px] border border-gray-bluegray-2 bg-gray-1",
								selectedLaundrySet.has(laundry.id) &&
									"border-[3px] border-main-blue-1",
							)}
						>
							<img
								src={laundry.images.real ?? laundry.images.label}
								className="h-full w-full rounded-[24px] object-cover"
							/>
						</div>
					</li>
				);
			})}
		</ul>
	);
};
