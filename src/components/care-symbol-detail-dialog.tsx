import { symbolUrl } from "@/lib/utils";
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogDescription,
	DialogClose,
} from "./ui/dialog";

interface CareSymbolDetailDialogProps {
	isOpen: boolean;
	close: () => void;
	symbol: {
		code: string;
		description: string;
	};
	category: string;
}

export const CareSymbolDetailDialog = ({
	isOpen,
	close,
	symbol,
	category,
}: CareSymbolDetailDialogProps) => {
	return (
		<Dialog open={isOpen} onOpenChange={close}>
			<DialogContent className="flex h-full max-h-[640px] w-full max-w-[calc(393px-32px)] flex-col items-center justify-between rounded-[24px] p-[24px]">
				<div className="flex w-full flex-col items-center gap-[48px]">
					<DialogTitle className="text-subhead font-medium text-dark-gray-2">
						{category}
					</DialogTitle>
					<div className="flex size-[160px] items-center justify-center rounded-[24px] border-[2px]">
						<img src={symbolUrl(symbol.code)} className="w-4/6" />
					</div>

					<div className="w-full">
						<h3 className="mb-[18px] text-subhead font-semibold text-dark-gray-1">
							주요 세탁 방법
						</h3>
						<DialogDescription className="w-full rounded-[12px] bg-light-gray-1 p-[24px] text-body-1 text-dark-gray-1">
							{symbol.description}
						</DialogDescription>
					</div>
				</div>

				<DialogClose className="w-full rounded-[10px] bg-black-2 p-1 py-[14px] text-white">
					닫기
				</DialogClose>
			</DialogContent>
		</Dialog>
	);
};
