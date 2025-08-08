import { Dialog, DialogContent, DialogClose } from "./ui/dialog";

export const AlertDialog = ({
	isOpen,
	close,
	img,
	title,
	body,
	onConfirm,
}: {
	isOpen: boolean;
	img: string;
	title: string;
	body: string;
	close: () => void;
	onConfirm?: () => void;
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
				<DialogClose
					onClick={onConfirm}
					className="rounded-[8px] bg-main-blue-1 py-[14px] text-subhead font-medium text-white"
				>
					확인했어요
				</DialogClose>
			</DialogContent>
		</Dialog>
	);
};
