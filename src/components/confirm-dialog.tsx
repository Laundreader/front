import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "./ui/dialog";

interface ConfirmDialogProps {
	img: string;
	title: string;
	body: string;
	isOpen: boolean;
	cancel: () => void;
	confirm: () => void;
}

export const ConfirmDialog = ({
	img,
	title,
	body,
	isOpen,
	cancel,
	confirm,
}: ConfirmDialogProps) => {
	return (
		<Dialog open={isOpen} onOpenChange={cancel}>
			<DialogContent className="flex size-[320px] flex-col rounded-[24px] p-[16px]">
				<div className="flex flex-col items-center gap-[16px]">
					<div>
						<div className="aspect-[2/1] w-full">
							<img
								src={img}
								role="presentataion"
								className="h-full w-full object-contain"
							/>
						</div>
						<div className="flex flex-col items-center">
							<DialogTitle className="text-title-3 font-medium text-black-2">
								{title}
							</DialogTitle>
							<DialogDescription className="text-body-1 text-dark-gray-2">
								{body}
							</DialogDescription>
						</div>
					</div>
				</div>

				<div className="flex gap-[16px]">
					<button
						onClick={confirm}
						className="flex h-[48px] w-[136px] items-center justify-center rounded-[8px] border border-main-blue-2 bg-white py-[14px] text-subhead font-medium text-main-blue-2"
					>
						네
					</button>
					<DialogClose className="flex h-[48px] w-[136px] items-center justify-center rounded-[8px] border border-gray-2 bg-gray-3 py-[14px] text-subhead font-medium text-gray-1">
						아니요
					</DialogClose>
				</div>
			</DialogContent>
		</Dialog>
	);
};
