import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "./ui/dialog";

interface MaterialDetailDialogProps {
	material: {
		name: string;
		description: string;
		careInstructions: {
			washing: string;
			drying: string;
			other: string;
		};
	};
	isOpen: boolean;
	close: () => void;
	category: string;
}

export const MaterialDetailDialog = ({
	material,
	isOpen,
	close,
	category,
}: MaterialDetailDialogProps) => {
	return (
		<Dialog open={isOpen} onOpenChange={close}>
			<DialogContent className="flex h-full max-h-[640px] w-full max-w-[calc(393px-32px)] flex-col justify-between rounded-[24px] p-[24px]">
				<div className="flex flex-col justify-between gap-[24px]">
					<DialogTitle className="text-center">
						<span className="mr-[8px] text-title-3 font-medium text-black">
							{material.name}
						</span>
						<span className="rounded-[4px] bg-gray-bluegray-2 p-[4px] text-caption font-medium text-gray-1">
							{category}
						</span>
					</DialogTitle>

					<h3 className="text-subhead font-semibold text-black-2">
						주요 세탁 방법
					</h3>
					<ul className="flex flex-col gap-[18px] text-body-1 text-dark-gray-1">
						<li className="rounded-[12px] bg-text-field-yellow p-[18px]">
							<p className="mb-[8px] font-medium text-black-2">🧺 세탁</p>
							<DialogDescription className="mt-[4px] whitespace-pre-wrap">
								{material.careInstructions.washing}
							</DialogDescription>
						</li>
						<li className="rounded-[12px] bg-text-field-green p-[18px]">
							<p className="mb-[8px] font-medium text-black-2">💨 탈수/건조</p>
							<DialogDescription className="mt-[4px] whitespace-pre-wrap">
								{material.careInstructions.drying}
							</DialogDescription>
						</li>
						<li className="rounded-[12px] bg-text-field-blue p-[18px]">
							<p className="mb-[8px] font-medium text-black-2">🫧 그 외</p>
							<DialogDescription className="mt-[4px] whitespace-pre-wrap">
								{material.careInstructions.other}
							</DialogDescription>
						</li>
					</ul>
				</div>

				<DialogClose className="w-full rounded-[10px] bg-black-2 p-1 py-[14px] text-white">
					닫기
				</DialogClose>
			</DialogContent>
		</Dialog>
	);
};
