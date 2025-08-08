import { Dialog, DialogContent, DialogClose } from "./ui/dialog";

export const ConfirmDialog = ({
	isOpen,
	close,
	img,
	title,
	body,
	confirm,
}: {
	isOpen: boolean;
	img: string;
	title: string;
	body: string;
	close: () => void;
	confirm?: () => void;
}) => {
	return (
		<Dialog open={isOpen} onOpenChange={close}>
			<DialogContent className="flex size-[320px] flex-col rounded-[24px] p-[16px]">
				<div className="grow">
					<div className="flex flex-col items-center gap-[16px]">
						<img src={img} role="presentataion" />
						<div className="flex flex-col items-center">
							<p className="text-title-3 font-medium text-black-2">{title}</p>
							<p className="text-body-1 text-dark-gray-2">{body}</p>
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
