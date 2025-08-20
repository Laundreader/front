import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "./ui/dialog";

interface AlertDialogProps {
	img: string;
	title: string;
	body: string;
	isOpen: boolean;
	close: () => void;
}

export const AlertDialog = ({
	img,
	title,
	body,
	isOpen,
	close,
}: AlertDialogProps) => {
	return (
		<Dialog open={isOpen} onOpenChange={close}>
			<DialogContent className="flex min-h-[320px] min-w-[320px] flex-col rounded-[24px] p-[16px]">
				<div className="grow">
					<div className="flex flex-col items-center gap-[16px]">
						<div>
							<img src={img} role="presentataion" />
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
				<DialogClose
					onClick={close}
					className="rounded-[8px] bg-main-blue-1 py-[14px] text-subhead font-medium text-white"
				>
					확인했어요
				</DialogClose>
			</DialogContent>
		</Dialog>
	);
};
