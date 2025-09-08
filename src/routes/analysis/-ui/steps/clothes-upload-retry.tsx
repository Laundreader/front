import { Link } from "@tanstack/react-router";
import CloseIcon from "@/assets/icons/close.svg?react";
import RotateCcwIcon from "@/assets/icons/rotate-ccw.svg?react";
import type { Options } from "browser-image-compression";
import imageCompression from "browser-image-compression";
import { Stepper } from "../stepper";

export const ClothesUploadRetry = ({
	clothesImage,
	onSkip,
	onRegister,
}: {
	clothesImage: string | null;
	onSkip: () => void;
	onRegister: (imageDataUrl: string) => void;
}) => {
	return (
		<div className="grid h-dvh grid-rows-[auto_1fr] bg-gray-3 p-4">
			<header className="grid grid-cols-[1fr_auto_1fr] p-4">
				<Stepper
					total={3}
					current={2}
					className="col-start-2 justify-self-center"
				/>
				<Link to="/" className="ml-auto">
					<CloseIcon />
				</Link>
			</header>

			<section className="grid min-h-0 grid-rows-[1fr_2fr_1fr]">
				<div>
					<p className="mb-[18px] text-center text-title-2 font-semibold text-black-2">
						의류 인식이 어려워요
					</p>
					<p className="text-center text-body-1 text-dark-gray-1">
						의류가 잘 보이도록 사진을 다시 찍어주세요.
						<br />
						또는 의류 사진 없이 결과를 보러갈 수도 있어요.
					</p>
				</div>

				<div className="flex flex-col items-center justify-evenly rounded-3xl bg-white p-3">
					<div className="aspect-square w-1/2">
						<img
							src={clothesImage ?? undefined}
							alt=""
							role="presentation"
							className="aspect-square h-full w-full rounded-xl object-cover"
						/>
					</div>
					<p className="text-center text-subhead font-medium text-dark-gray-1">
						인식에 실패했어요! 다시 촬영해주세요.
					</p>
					<label
						htmlFor="clothes-image-upload"
						className="flex cursor-pointer items-center justify-center gap-1 rounded-xl bg-light-red px-5 py-4 text-body-1 font-semibold text-orange"
					>
						<RotateCcwIcon />
						다시 촬영
					</label>
					<input
						id="clothes-image-upload"
						type="file"
						accept="image/*"
						onChange={async (e) => {
							const imageDataUrl = await handleImageUpload(e, "clothes");
							if (imageDataUrl) {
								onRegister(imageDataUrl);
							}
						}}
						className="hidden"
					/>
				</div>

				<button
					onClick={onSkip}
					className="flex h-fit w-full max-w-90 items-center justify-center gap-1 self-end rounded-xl bg-main-blue-1 py-[18px] text-body-1 font-semibold text-white disabled:opacity-60"
				>
					바로 결과보러 갈래요
				</button>
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
