import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/tooltip";
import { cn } from "@/lib/utils";
import RotateCcwIcon from "@/assets/icons/rotate-ccw.svg?react";
import { Link } from "@tanstack/react-router";
import CloseIcon from "@/assets/icons/close.svg?react";
import imageCompression, { type Options } from "browser-image-compression";
import { Stepper } from "../stepper";

export const LabelUploadRetry = ({
	labelImage,
	onManual,
	onRegister,
}: {
	labelImage: string | null;
	onManual: () => void;
	onRegister: (imageDataUrl: string) => void;
}) => {
	return (
		<div className="grid h-dvh grid-rows-[auto_1fr] bg-gray-3 p-4">
			<header className="grid grid-cols-[1fr_auto_1fr] p-4">
				<Stepper
					total={3}
					current={1}
					className="col-start-2 justify-self-center"
				/>
				<Link to="/" className="ml-auto">
					<CloseIcon />
				</Link>
			</header>

			<section className="grid min-h-0 grid-rows-[1fr_2fr_1fr]">
				<div className="flex flex-col items-center gap-4">
					<h2 className="text-center text-title-2 font-semibold text-black-2">
						케어라벨 인식이 어려워요
					</h2>
					<p className="text-center text-body-1 text-dark-gray-1">
						라벨이 잘 보이도록 사진을 다시 찍어주세요.
						<br />
						또는 세탁기호와 소재 정보를 직접 입력해주세요.
					</p>
				</div>

				<div className="flex flex-col items-center justify-evenly rounded-3xl bg-white p-3">
					<div className="aspect-square w-1/2">
						<img
							src={labelImage ?? undefined}
							alt=""
							role="presentation"
							className="aspect-square h-full w-full rounded-xl object-cover"
						/>
					</div>
					<p className="text-center text-subhead font-medium text-dark-gray-1">
						인식에 실패했어요! 다시 촬영해주세요.
					</p>
					<label
						htmlFor="label-image-upload"
						className="flex cursor-pointer items-center justify-center gap-1 rounded-xl bg-light-red px-5 py-4 text-body-1 font-semibold text-orange"
					>
						<RotateCcwIcon />
						다시 촬영
					</label>

					<input
						id="label-image-upload"
						type="file"
						accept="image/*"
						onChange={async (e) => {
							const imageDataUrl = await handleImageUpload(e, "label");
							if (imageDataUrl) {
								onRegister(imageDataUrl);
							}
						}}
						className="hidden"
					/>
				</div>

				<div className="self-end">
					<Tooltip>
						<TooltipTrigger>
							<button
								onClick={onManual}
								className={cn(
									"flex h-14 w-full items-center justify-center rounded-xl bg-main-blue-1 text-body-1 font-semibold text-white",
								)}
							>
								직접 입력할게요
							</button>
						</TooltipTrigger>
						<TooltipContent className="rounded-lg bg-deep-blue fill-deep-blue px-3 py-2">
							<p className="text-caption font-medium text-white">
								라벨 인식이 안되나요?
							</p>
						</TooltipContent>
					</Tooltip>
				</div>
			</section>
		</div>
	);
};

async function handleImageUpload(
	event: React.ChangeEvent<HTMLInputElement>,
	type: "label" | "clothes",
) {
	const imageFile = event.target.files?.[0];
	if (imageFile === undefined) {
		return;
	}

	const imageDataUrl = await processImage(imageFile, type);

	return imageDataUrl;
}

// MARK: 이미지 처리
async function processImage(
	imageFile: File,
	type: "label" | "clothes",
): Promise<string> {
	const options: Options = {
		fileType: "image/jpeg",
		maxSizeMB: type === "label" ? 2 : 0.5,
		maxWidthOrHeight: 2240,
		useWebWorker: true,
	};

	const compressedImage = await imageCompression(imageFile, options);
	const imageDataUrl =
		await imageCompression.getDataUrlFromFile(compressedImage);

	return imageDataUrl;
}
