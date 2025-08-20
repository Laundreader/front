import {
	Dialog,
	DialogClose,
	DialogTitle,
	DialogContent,
	DialogDescription,
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
			<DialogContent className="flex size-80 flex-col items-center justify-around rounded-3xl p-4">
				<div className="flex w-full flex-col items-center gap-4">
					<div className="aspect-square w-1/2">
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

				<div className="flex gap-4">
					<button
						onClick={confirm}
						className="flex h-12 w-34 items-center justify-center rounded-lg border border-main-blue-2 bg-white py-3 text-subhead font-medium text-main-blue-2"
					>
						네
					</button>
					<DialogClose className="flex h-12 w-34 items-center justify-center rounded-lg border border-gray-2 bg-gray-3 py-3 text-subhead font-medium text-gray-1">
						아니요
					</DialogClose>
				</div>
			</DialogContent>
		</Dialog>
	);
};
