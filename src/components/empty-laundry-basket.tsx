import BlueTShirt from "@/assets/images/blue-t-shirt.avif";
import { cn } from "@/lib/utils";

type EmptyLaundryBasketProps = {
	className?: string;
};

export const EmptyLaundryBasket = ({ className }: EmptyLaundryBasketProps) => {
	return (
		<div className={cn("flex flex-col items-center gap-[25px]", className)}>
			<img src={BlueTShirt} role="presentation" />
			<p className="text-body-2 text-gray-1">
				빨랫감이 없어요! 추가하러 가볼까요?
			</p>
		</div>
	);
};
