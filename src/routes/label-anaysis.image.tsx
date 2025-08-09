import { useRef, useState } from "react";
import { overlay } from "overlay-kit";
import { Link, createFileRoute } from "@tanstack/react-router";
import type { LabelUploadAreaRef } from "@/components/label-upload-area";
import type {
	LaundryAfterAnalysis,
	LaundryBeforeAnalysis,
} from "@/entities/laundry/model";
import CloseIcon from "@/assets/icons/close.svg?react";
import CaptureGuideImg from "@/assets/images/capture-guide.png";
import { AlertDialog } from "@/components/alert-dialog";
import LabelUploadArea from "@/components/label-upload-area";
import { getCareLabelAnalysis } from "@/entities/care-label/api";
import { laundryStore } from "@/idb";

export const Route = createFileRoute("/label-anaysis/image")({
	component: RouteComponent,
});

function RouteComponent() {
	const [laundry, setLaundry] = useState<LaundryAfterAnalysis | null>(null);

	const [selectedImages, setSelectedImages] = useState<Array<string | null>>([
		null,
		null,
	]);
	const [validationErrors, setValidationErrors] = useState<
		Array<string | null>
	>([null, null]);
	const [isValidating, setIsValidating] = useState<Array<boolean>>([
		false,
		false,
	]);
	const labelUploadAreaRefs = useRef<Array<LabelUploadAreaRef | null>>([
		null,
		null,
	]);
	const [currentUploadIndex, setCurrentUploadIndex] = useState<number | null>(
		null,
	);

	// ImageUploader에서 업로드 완료 시 호출되는 함수
	const handleImageUpload = async (base64: string, extension: string) => {
		if (currentUploadIndex === null) return;

		const index = currentUploadIndex;
		console.log({ index });

		// base64를 data URL로 변환해서 미리보기에 사용
		const dataURL = `data:image/${extension};base64,${base64}`;

		setSelectedImages((prev) => {
			const newImages = [...prev];
			newImages[index] = dataURL;
			return newImages;
		});

		setIsValidating((prev) => {
			const newValidating = [...prev];
			newValidating[index] = false;
			return newValidating;
		});

		setCurrentUploadIndex(null);

		if (currentUploadIndex === 1) {
			console.log("의류 사진 업로드 완료");
			if (laundry) {
				console.log("의류 사진이 이미 존재합니다. 업데이트 중...");
				// 의류 사진이 이미 존재하는 경우, 해당 laundry의 이미지를 업데이트
				const prevLaundry = await laundryStore.get(laundry.id);
				console.log(prevLaundry);
				prevLaundry.images["real"] = {
					format: extension,
					data: dataURL,
				};

				await laundryStore.set({ id: laundry.id, value: prevLaundry });
				setLaundry(prevLaundry);
				return;
			}
		}

		try {
			const labelAnalysis = await getCareLabelAnalysis({
				imageData: dataURL,
				imageFormat: extension as "png" | "jpg" | "jpeg",
			});
			console.log("라벨 분석 결과:", labelAnalysis);

			const laundrySymbols = Object.values(labelAnalysis.laundrySymbols).flat();
			console.log(laundrySymbols);

			const laundry: LaundryBeforeAnalysis = {
				...labelAnalysis,
				laundrySymbols,
				images: {
					label: { format: extension, data: dataURL },
				},
			};

			const laundryId = await laundryStore.set({ value: laundry });
			const newLaundry = { ...laundry, id: laundryId };

			setLaundry(newLaundry);
		} catch (error) {
			overlay.open(({ isOpen, close }) => {
				return (
					<AlertDialog
						img={CaptureGuideImg}
						title="다시 촬영해주세요"
						body="가이드에 맞춰 올바르게 촬영해주세요"
						isOpen={isOpen}
						close={close}
					/>
				);
			});
		}

		// 서버 전송 로직
		console.log("서버 전송용 base64:", dataURL);
		console.log("확장자:", extension);
	};

	// ImageUploader에서 에러 발생 시 호출되는 함수
	const handleImageError = (error: string) => {
		if (currentUploadIndex === null) return;

		const index = currentUploadIndex;

		setValidationErrors((prev) => {
			const newErrors = [...prev];
			newErrors[index] = error;
			return newErrors;
		});

		setIsValidating((prev) => {
			const newValidating = [...prev];
			newValidating[index] = false;
			return newValidating;
		});

		setCurrentUploadIndex(null);
	};

	// ImageUploader에서 파일 선택이 시작될 때 호출되는 함수
	const handleImageProcessStart = () => {
		if (currentUploadIndex === null) return;

		const index = currentUploadIndex;

		// 검증 시작
		setIsValidating((prev) => {
			const newValidating = [...prev];
			newValidating[index] = true;
			return newValidating;
		});

		// 에러 초기화
		setValidationErrors((prev) => {
			const newErrors = [...prev];
			newErrors[index] = null;
			return newErrors;
		});
	};

	// 라벨 클릭 시 ImageUploader 트리거
	const handleLabelClick = (index: number) => {
		setCurrentUploadIndex(index);
		labelUploadAreaRefs.current[index]?.triggerUpload();
	};

	return (
		<div className="h-full bg-gray-3 px-[16px] pt-[54px]">
			<header className="flex">
				<Link to="/" className="ml-auto">
					<CloseIcon />
				</Link>
			</header>

			<section className="h-[190px] pt-[22px] pb-[48px]">
				{laundry && (
					<>
						<p className="mb-[18px] text-center text-title-2 font-semibold text-black-2">
							잠깐! 이 정보가 맞나요?
						</p>
						<p className="text-center text-body-1 text-dark-gray-1">
							런드리더가 분석한 정보가 다르거나,
							<br />
							더욱 자세한 세탁법을 알고 싶다면
							<br />
							의류사진을 올리거나 정보를 더 알려주세요.
						</p>
					</>
				)}
			</section>

			<section className="mb-[88px] rounded-[24px] bg-white px-[16px] py-[48px] pb-[72px]">
				{/* 업로드 영역들 */}
				<div className="mb-[28px] flex justify-center gap-[16px]">
					{/* 첫 번째 업로드 영역 (항상 표시) */}
					<LabelUploadArea
						ref={(el) => {
							labelUploadAreaRefs.current[0] = el;
						}}
						index={0}
						label="라벨"
						selectedImage={selectedImages[0]}
						isValidating={isValidating[0]}
						validationError={validationErrors[0]}
						onUpload={handleImageUpload}
						onError={handleImageError}
						onProcessStart={handleImageProcessStart}
						onLabelClick={handleLabelClick}
						maxSize={5 * 1024 * 1024} // 5MB
					/>

					{/* 두 번째 업로드 영역 (첫 번째 이미지가 유효할 때만 표시) */}
					{selectedImages[0] && !validationErrors[0] && (
						<LabelUploadArea
							ref={(el) => {
								labelUploadAreaRefs.current[1] = el;
							}}
							index={1}
							label="의류"
							selectedImage={selectedImages[1]}
							isValidating={isValidating[1]}
							validationError={validationErrors[1]}
							onUpload={handleImageUpload}
							onError={handleImageError}
							onProcessStart={handleImageProcessStart}
							onLabelClick={handleLabelClick}
							maxSize={5 * 1024 * 1024} // 5MB
						/>
					)}
				</div>

				{/* 분석 정보 */}
				{laundry && (
					<div className="flex flex-col items-center">
						<p className="mb-[12px] text-subhead font-semibold text-black-2">
							이 세탁물의 소재는 {laundry.materials.join(", ")}이에요
						</p>
						<div className="mb-[24px] flex items-center justify-center gap-[8px]">
							{laundry.color && (
								<span className="rounded-[4px] bg-label-yellow p-[4px] text-caption font-medium text-[#e9af32]">
									{laundry.color}
								</span>
							)}
							{laundry.hasPrintOrTrims && (
								<span className="rounded-[4px] bg-label-green p-[4px] text-caption font-medium text-[#76c76f]">
									프린트나 장식이 있어요
								</span>
							)}
						</div>
						<ul className="grid w-full grid-cols-6 gap-[8px]">
							{laundry.laundrySymbols.map((symbol) => (
								<li
									key={symbol.code}
									className="flex aspect-square items-center justify-center rounded-[10px] border border-gray-bluegray-2 bg-white text-body-1 font-medium text-dark-gray-1"
								>
									<img className="" />
								</li>
							))}
							{Array.from({ length: 6 - laundry.laundrySymbols.length }).map(
								(_, index) => (
									<li
										key={index}
										className="flex aspect-square items-center justify-center rounded-[10px] border border-gray-bluegray-2 bg-white text-body-1 font-medium text-dark-gray-1"
									></li>
								),
							)}
						</ul>
					</div>
				)}
			</section>

			<div className="flex justify-between gap-[13px]">
				<button
					disabled={!laundry}
					className="grow rounded-[10px] bg-gray-bluegray-2 py-[18px] text-subhead font-medium text-dark-gray-2 disabled:cursor-not-allowed"
				>
					수정할게요
				</button>
				<Link
					to="/analysing"
					search={{ laundryIds: [laundry?.id ?? 0] }}
					disabled={!laundry}
					className="flex grow items-center justify-center rounded-[10px] bg-main-blue-1 py-[18px] text-white disabled:cursor-not-allowed"
				>
					바로 세탁 방법 볼래요
				</Link>
			</div>
		</div>
	);
}
