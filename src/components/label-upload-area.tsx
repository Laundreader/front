import { forwardRef, useImperativeHandle, useRef } from "react";
import RotateCcwIcon from "@/assets/icons/rotate-ccw.svg?react";
import PlusCircleIcon from "@/assets/icons/plus-circle.svg?react";

interface LabelUploadAreaProps {
	index: number;
	label: string;
	selectedImage: string | null;
	isValidating: boolean;
	validationError: string | null;
	onUpload: (base64: string, extension: string) => void;
	onError: (error: string) => void;
	onProcessStart: () => void;
	onLabelClick: (index: number) => void;
	maxSize?: number;
	className?: string;
}

export interface LabelUploadAreaRef {
	triggerUpload: () => void;
}

export const LabelUploadArea = forwardRef<
	LabelUploadAreaRef,
	LabelUploadAreaProps
>(
	(
		{
			index,
			label,
			selectedImage,
			isValidating,
			validationError,
			onUpload,
			onError,
			onProcessStart,
			onLabelClick,
			maxSize = 5 * 1024 * 1024, // 기본 5MB
			className = "",
		},
		ref,
	) => {
		const inputRef = useRef<HTMLInputElement | null>(null);

		useImperativeHandle(ref, () => ({
			triggerUpload: () => inputRef.current?.click(),
		}));

		// 이미지 리사이즈 함수 (canvas 기반)
		const resizeImage = (
			image: HTMLImageElement,
			maxLongSide = 2240,
			minShortSide = 4,
		): HTMLCanvasElement => {
			let width = image.width;
			let height = image.height;
			const aspectRatio = width / height;
			console.log("RATIO", width, height, aspectRatio);

			if (width > height) {
				if (width > maxLongSide) {
					height = Math.max(
						minShortSide,
						Math.round((height * maxLongSide) / width),
					);
					width = maxLongSide;
				}
			} else {
				if (height > maxLongSide) {
					width = Math.max(
						minShortSide,
						Math.round((width * maxLongSide) / height),
					);
					height = maxLongSide;
				}
			}
			console.log("RESIZED", width, height, width / height);

			// 최소 길이 보장
			if (width < minShortSide) {
				width = minShortSide;
			}
			if (height < minShortSide) {
				height = minShortSide;
			}

			const canvas = document.createElement("canvas");
			canvas.width = width;
			canvas.height = height;

			const ctx = canvas.getContext("2d");
			if (!ctx) {
				throw new Error("Canvas context is not available");
			}

			ctx.drawImage(image, 0, 0, width, height);

			return canvas;
		};

		// 비율 체크 1:5 이상이면 false 반환
		const isValidAspectRatio = (width: number, height: number): boolean => {
			const ratio = width / height;
			return 0.2 <= ratio && ratio <= 5; // 1:5 ~ 5:1
		};

		// 확장자 추출
		const getExtension = (fileName: string): string => {
			return fileName.split(".").pop()?.toLowerCase() || "";
		};

		// 파일 처리
		const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
			const file = event.target.files?.[0];
			if (!file) {
				return;
			}

			// 파일 처리 시작을 알림
			onProcessStart();

			// 크기 체크 (0 < size ≤ maxSize)
			if (file.size === 0 || file.size > maxSize) {
				const error = `파일 크기는 0Byte 초과 ${Math.round(maxSize / (1024 * 1024))}MB 이하이어야 합니다.`;
				onError(error);
				return;
			}

			// 지원 형식 체크
			const supportedTypes = [
				"image/png",
				"image/jpeg",
				"image/jpg",
				"image/webp",
				"image/bmp",
			];
			if (!supportedTypes.includes(file.type)) {
				const error = "지원하는 이미지 형식이 아닙니다.";
				onError(error);
				return;
			}

			const extension = getExtension(file.name);

			const reader = new FileReader();
			reader.onload = () => {
				const dataURL = reader.result as string;

				// Image 객체 생성 후 비율 및 리사이즈 검사
				const img = new Image();
				img.onload = () => {
					if (!isValidAspectRatio(img.width, img.height)) {
						const error = "이미지 비율은 1:5에서 5:1 이내여야 합니다.";
						onError(error);
						return;
					}

					// 긴 쪽 2240px, 짧은 쪽 4px 이상으로 리사이즈
					const canvas = resizeImage(img);

					// 원하는 포맷으로 변환 (원본 확장자 기준)
					let outputFormat: "image/jpeg" | "image/png" | "image/webp" =
						"image/jpeg";
					if (extension === "png") {
						outputFormat = "image/png";
					} else if (extension === "webp") {
						outputFormat = "image/webp";
					}

					// base64 (dataURI) 생성
					const resizedDataURL = canvas.toDataURL(outputFormat);

					// dataURI에서 순수 base64 문자열만 추출
					const base64 = resizedDataURL.split(",")[1];

					// 콜백으로 전달 (서버 전송 등)
					onUpload(base64, extension);
				};

				img.onerror = () => {
					const error = "이미지 로드에 실패했습니다.";
					onError(error);
				};

				img.src = dataURL;
			};

			reader.onerror = () => {
				const error = "파일 읽기에 실패했습니다.";
				onError(error);
			};

			reader.readAsDataURL(file);
		};

		const handleClick = () => {
			onLabelClick(index);
		};

		return (
			<div className={`flex flex-col items-center ${className}`}>
				<div
					className="relative aspect-square size-[130px] cursor-pointer rounded-[16px] border border-gray-bluegray-2 bg-gray-3"
					onClick={handleClick}
				>
					{isValidating ? (
						/* 검증 중 상태 */
						<div className="flex h-full items-center justify-center">
							<div className="flex flex-col items-center gap-[8px]">
								<div className="h-[20px] w-[20px] animate-spin rounded-full border-2 border-main-blue-1 border-t-transparent" />
								<span className="text-body-2 text-gray-1">검증 중...</span>
							</div>
						</div>
					) : selectedImage ? (
						/* 이미지 미리보기 */
						<>
							<img
								src={selectedImage}
								alt={`${label} 미리보기`}
								className="h-full w-full rounded-[16px] object-cover"
							/>
							{/* 오버레이와 다시 선택하기 버튼 */}
							<div className="absolute right-0 bottom-0 left-0 flex h-[36px] items-center justify-center rounded-b-[16px] bg-black/30">
								<span className="flex items-center gap-[4px] text-body-2 font-medium text-white">
									<RotateCcwIcon className="size-[16px]" />
									다시 촬영하기
								</span>
							</div>
						</>
					) : (
						/* 기본 업로드 UI */
						<div className="flex h-full items-center justify-center">
							<span className="flex items-center gap-[4px] text-body-2 font-medium text-gray-1">
								<PlusCircleIcon /> {label}
							</span>
						</div>
					)}
				</div>

				{/* 검증 에러 메시지 */}
				{validationError && (
					<div className="mt-[8px] max-w-[130px] text-center">
						<p className="text-body-2 font-medium text-red">
							{validationError}
						</p>
					</div>
				)}

				{/* 숨겨진 파일 입력 */}
				<input
					ref={inputRef}
					type="file"
					accept="image/bmp,image/png,image/jpeg,image/webp"
					capture="environment"
					onChange={handleFileChange}
					className="hidden"
				/>
			</div>
		);
	},
);

LabelUploadArea.displayName = "LabelUploadArea";

export default LabelUploadArea;
