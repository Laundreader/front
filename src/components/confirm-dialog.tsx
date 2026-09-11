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
		// 버튼 클릭 결과만 blocker에 전달되도록 Dialog의 자동 닫힘 콜백은 사용하지 않는다.
		<Dialog open={isOpen}>
			<DialogContent className="flex size-80 flex-col items-center justify-around rounded-3xl p-4">
				<div className="flex w-full flex-col items-center gap-4">
					<div className="aspect-square w-1/2">
						<img
							src={img}
							role="presentation"
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
					<DialogClose asChild>
						<button
							onClick={confirm}
							className="flex h-12 w-34 items-center justify-center rounded-lg border border-main-blue-2 bg-white py-3 text-subhead font-medium text-main-blue-2"
						>
							네
						</button>
					</DialogClose>
					<DialogClose
						onClick={cancel}
						className="flex h-12 w-34 items-center justify-center rounded-lg border border-gray-2 bg-gray-3 py-3 text-subhead font-medium text-gray-1"
					>
						아니요
					</DialogClose>
				</div>
			</DialogContent>
		</Dialog>
	);
};
