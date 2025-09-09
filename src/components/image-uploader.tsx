import { forwardRef, useImperativeHandle, useRef } from "react";

type Props = {
	onUpload: (base64: string, extension: string) => void;
	onError?: (error: string) => void;
	onProcessStart?: () => void;
	maxSize?: number;
	className?: string;
	children?: React.ReactNode;
};

export interface ImageUploaderRef {
	triggerUpload: () => void;
}

export const ImageUploader = forwardRef<ImageUploaderRef, Props>(
	(
		{
			onUpload,
			onError,
			onProcessStart,
			maxSize = 20 * 1024 * 1024, // 기본 20MB
			className = "",
			children,
		},
		ref,
	) => {
		const inputRef = useRef<HTMLInputElement | null>(null);

		useImperativeHandle(ref, () => ({
			triggerUpload: () => inputRef.current?.click(),
		}));

		const triggerUpload = () => {
			inputRef.current?.click();
		};

		// 이미지 리사이즈 함수 (canvas 기반)
		const resizeImage = (
			image: HTMLImageElement,
			maxLongSide = 2240,
			minShortSide = 4,
		): HTMLCanvasElement => {
			let width = image.width;
			let height = image.height;
			// const aspectRatio = width / height;

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
			if (onProcessStart) {
				onProcessStart();
			}

			// 크기 체크 (0 < size ≤ maxSize)
			if (file.size === 0 || file.size > maxSize) {
				const error = `파일 크기는 0Byte 초과 ${Math.round(maxSize / (1024 * 1024))}MB 이하이어야 합니다.`;
				if (onError) {
					onError(error);
				} else {
					alert(error);
				}
				return;
			} // 지원 형식 체크
			const supportedTypes = [
				"image/png",
				"image/jpeg",
				"image/jpg",
				"image/webp",
				"image/bmp",
			];
			if (!supportedTypes.includes(file.type)) {
				const error = "지원하는 이미지 형식이 아닙니다.";
				if (onError) {
					onError(error);
				} else {
					alert(error);
				}
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
						if (onError) {
							onError(error);
						} else {
							alert(error);
						}
						return;
					}

					// 긴 쪽 2240px, 짧은 쪽 4px 이상으로 리사이즈
					const canvas = resizeImage(img);

					// 원하는 포맷으로 변환 (원본 확장자 기준)
					// PNG, WEBP 모두 가능, 여기서는 JPEG/PNG 처리 예시
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
					if (onError) {
						onError(error);
					} else {
						alert(error);
					}
				};

				img.src = dataURL;
			};

			reader.onerror = () => {
				const error = "파일 읽기에 실패했습니다.";
				if (onError) {
					onError(error);
				} else {
					alert(error);
				}
			};

			reader.readAsDataURL(file);
		};

		return (
			<div className={className} onClick={triggerUpload}>
				{children || (
					<input
						ref={inputRef}
						type="file"
						accept="image/bmp,image/png,image/jpeg,image/webp"
						onChange={handleFileChange}
					/>
				)}
				{children && (
					<input
						ref={inputRef}
						type="file"
						accept="image/bmp,image/png,image/jpeg,image/webp"
						onChange={handleFileChange}
						className="hidden"
					/>
				)}
			</div>
		);
	},
);

ImageUploader.displayName = "ImageUploader";

export default ImageUploader;
