import { useQuery } from "@tanstack/react-query";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogHeader,
	DialogDescription,
	DialogClose,
} from "./ui/dialog";
import { getLaundriesAll } from "@/entities/laundry/api";
import CloseIcon from "@/assets/icons/close.svg?react";
import type { Laundry } from "@/entities/laundry/model";
import { cn } from "@/lib/utils";
import { useState, type Dispatch, type SetStateAction } from "react";
import BlueTShirtImg from "@/assets/images/blue-t-shirt.avif";

interface LaundryListModalProps {
	isOpen: boolean;
	close: () => void;
	setSelectedLaundry: Dispatch<SetStateAction<Laundry | null>>;
}

export const LaundryListModal = ({
	isOpen,
	close,
	setSelectedLaundry,
}: LaundryListModalProps) => {
	const [tempSelectedLaundry, setTempSelectedLaundry] =
		useState<Laundry | null>(null);

	const laundriesQuery = useQuery({
		queryKey: ["laundries"],
		queryFn: getLaundriesAll,
	});

	function handleClickLaundry(laundry: Laundry) {
		setTempSelectedLaundry((prev) => (prev === laundry ? null : laundry));
	}

	return (
		<Dialog open={isOpen} onOpenChange={close}>
			<DialogContent className="flex h-dvh w-full max-w-[393px] flex-col p-4">
				<DialogHeader className="grid grid-cols-[1fr_auto_1fr] items-center">
					<DialogTitle className="col-2 justify-self-center text-body-1 font-medium text-dark-gray-1">
						내 빨래바구니
					</DialogTitle>
					<DialogClose className="col-3 w-fit justify-self-end">
						<CloseIcon />
						<span className="sr-only">닫기</span>
					</DialogClose>
				</DialogHeader>

				<div className="mt-6">
					<DialogDescription className="text-title-2 font-semibold text-black-2">
						스캔한 옷에 더 궁금한 게 있나요?
					</DialogDescription>
					<p className="mt-4 text-body-1 text-dark-gray-1">
						받아보신 세탁 솔루션에 대해 아직 궁금한 점이 남았다면,
						<br /> 더 알고 싶은 옷을 골라서 질문해 보세요.
						<br /> 대화를 통해 버블리가 자세히 알려드릴게요!
					</p>
				</div>

				<div className="mt-9 grow">
					{laundriesQuery.isLoading && <p>로딩 중...</p>}
					{laundriesQuery.isError && <p>오류가 발생했습니다.</p>}
					{laundriesQuery.isSuccess && (
						<ul className="grid grid-cols-2 gap-4 pb-4">
							{laundriesQuery.data.map((laundry) => (
								<li
									key={laundry.id}
									onClick={() => handleClickLaundry(laundry)}
									className={cn(
										"aspect-square cursor-pointer overflow-hidden rounded-3xl",
										tempSelectedLaundry?.id === laundry.id &&
											"outline-4 outline-main-blue-1",
									)}
								>
									<img
										src={
											laundry.image.clothes?.data ??
											laundry.image.label?.data ??
											BlueTShirtImg
										}
										className="block aspect-square object-cover text-body-1 font-medium text-dark-gray-1"
									></img>
								</li>
							))}
						</ul>
					)}
				</div>

				<button
					onClick={() => {
						if (tempSelectedLaundry) {
							setSelectedLaundry(tempSelectedLaundry);
							close();
						}
					}}
					disabled={tempSelectedLaundry === null}
					className="sticky bottom-0 w-full rounded-[10px] bg-main-blue-1 py-4 text-subhead font-medium text-white disabled:bg-gray-bluegray-2 disabled:text-gray-1"
				>
					이 옷에 대해 질문할래요
				</button>
			</DialogContent>
		</Dialog>
	);
};
