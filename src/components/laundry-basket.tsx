import { cn } from "@/lib/utils";
import BlueTShirtImg from "@/assets/images/blue-t-shirt.avif";

import type { Laundry } from "@/entities/laundry/model";

interface LaundryBasketProps {
	laundryList: Array<{ id: Laundry["id"]; thumbnail: string | null }>;
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
		<ul className={cn("grid grid-cols-2 gap-4 pb-4", className)}>
			{laundryList.map((laundry, i) => {
				return (
					<li key={laundry.id}>
						{/* 세탁물 카드 */}
						<div
							onClick={() => onClick(laundry.id)}
							className={cn(
								"aspect-square cursor-pointer rounded-3xl bg-gray-1 outline-1 outline-gray-bluegray-2",
								selectedLaundrySet.has(laundry.id) &&
									"outline-4 outline-main-blue-1",
							)}
						>
							<img
								src={laundry.thumbnail ?? BlueTShirtImg}
								className="h-full w-full rounded-3xl object-cover"
								loading={i < 8 ? "eager" : "lazy"}
							/>
						</div>
					</li>
				);
			})}
		</ul>
	);
};
