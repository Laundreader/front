import { useEffect, useRef, useState } from "react";
import { overlay } from "overlay-kit";
import {
	Link,
	createFileRoute,
	useBlocker,
	useNavigate,
} from "@tanstack/react-router";
import type { ImageUploadAreaRef } from "@/components/label-upload-area";
import type { IMG_FORMAT } from "@/shared/constant";
import { validateImage } from "@/entities/image/api";
import { createLaundryAnalysis } from "@/entities/laundry/api";
import CloseIcon from "@/assets/icons/close.svg?react";
import PlusCircleIcon from "@/assets/icons/plus-circle.svg?react";
import CaptureGuideImg from "@/assets/images/capture-guide.png";
import { AlertDialog } from "@/components/alert-dialog";
import { LabelUploadArea } from "@/components/label-upload-area";
import { useTempLaundry } from "@/entities/laundry/store/temp";
import { cn, sha256HexFromBase64, symbolUrl } from "@/lib/utils";

import { ConfirmDialog } from "@/components/confirm-dialog";
import LabelCaptureGuideImg from "@/assets/images/label-capture-guide.png";
import ClothesCaptureGuideImg from "@/assets/images/clothes-capture-guide.png";

type IMGFormat = (typeof IMG_FORMAT)[number];
type ImageSlot = {
	format: IMGFormat | null;
	data: string;
	isValid: boolean;
	didFail: boolean;
};

export const Route = createFileRoute("/label-anaysis/image")({
	component: RouteComponent,
});

function RouteComponent() {
	const tempLaundry = useTempLaundry();
	const laundry = tempLaundry.state;
	const hasLaundry = laundry !== null;

	const [imageStatus, setImageStatus] = useState<{
		label: ImageSlot;
		clothes: ImageSlot;
	}>({
		label: {
			format: null,
			data: "",
			isValid: false,
			didFail: false,
		},
		clothes: {
			format: null,
			data: "",
			isValid: false,
			didFail: false,
		},
	});

	const [isAnalyzing, setIsAnalyzing] = useState(false);
	const [isValidating, setIsValidating] = useState(false);
	// 전체 페이지 로딩 오버레이 표시 여부 (Stage 2 의류 처리 또는 CTA 실행 시에만 표시)
	const [showOverlay, setShowOverlay] = useState(false);
	// 1: 라벨 업로드, 2: 의류 업로드(+CTA), 3: 결과 표시
	const [stage, setStage] = useState<1 | 2 | 3>(hasLaundry ? 3 : 1);
	// 라벨 실패 후 의류는 통과한 경우, 라벨 재업로드 시 자동 진행 플래그
	const [autoProceedAfterLabelUpload, setAutoProceedAfterLabelUpload] =
		useState(false);
	const [labelPreview, setLabelPreview] = useState<string | null>(
		laundry?.image.label.data ?? null,
	);
	const [clothesPreview, setClothesPreview] = useState<string | null>(
		laundry?.image.clothes?.data ?? null,
	);

	// 업로드 실패 시 Step B 표시 (성공 전까지 유지)
	const [_isUploadFailed, setIsUploadFailed] = useState(false);
	const [_lastLabelError, setLastLabelError] = useState<string | null>(null);
	const [acceptedLabelHash, setAcceptedLabelHash] = useState<string | null>(
		null,
	);
	const [acceptedClothesHash, setAcceptedClothesHash] = useState<string | null>(
		null,
	);

	const navigate = useNavigate();

	// 최신 imageStatus를 참조하기 위한 ref (자동 진행 시 상태 동기화 문제 방지)
	const imageStatusRef = useRef(imageStatus);
	useEffect(() => {
		imageStatusRef.current = imageStatus;
	}, [imageStatus]);

	// Step A/B에서 사용할 숨겨진 업로더 (LabelUploadArea의 검증/리사이즈/업로드 로직 재사용)
	const hiddenImageUploaderRef = useRef<ImageUploadAreaRef | null>(null);

	// 업로드 핸들러 - Stage 1: 라벨 이미지만 리사이즈/저장하고 Stage 2로 진행
	async function handleLabelUploaded(
		base64: string,
		extension: string,
		dataURL: string,
	) {
		// 이미 올린 의류 사진과 동일하면 차단
		const currentHash = await sha256HexFromBase64(base64);
		if (acceptedClothesHash && currentHash === acceptedClothesHash) {
			overlay.open(({ isOpen, close }) => (
				<AlertDialog
					img={CaptureGuideImg}
					title="이미 업로드한 이미지입니다"
					body="라벨과 의류에 같은 이미지를 사용할 수 없어요."
					isOpen={isOpen}
					close={close}
				/>
			));
			return;
		}

		// 이미 올린 라벨 사진과 동일하면 무시
		if (acceptedLabelHash && currentHash === acceptedLabelHash) {
			console.log("이미 동일한 라벨 이미지가 업로드되었습니다.");
			return;
		}

		const normalized = (extension === "jpg" ? "jpeg" : extension) as IMGFormat;

		// 검증/리사이즈는 LabelUploadArea 내부에서 수행되므로 여기서는 저장만 수행
		setImageStatus((prev) => ({
			...prev,
			label: {
				format: normalized,
				data: dataURL,
				isValid: true,
				didFail: false,
			},
		}));
		setLabelPreview(dataURL);
		setAcceptedLabelHash(currentHash);
		setIsUploadFailed(false);
		setLastLabelError(null);
		setStage(2);

		// 이전 시도에서 라벨만 실패했고 의류는 통과한 경우 자동으로 진행
		if (autoProceedAfterLabelUpload) {
			setAutoProceedAfterLabelUpload(false);
			await runValidationAndAnalysis();
		}
	}

	const handleClotheUploaded = async (
		base64: string,
		extension: string,
		dataURL: string,
	) => {
		// 이미 올린 라벨 이미지와 동일하면 차단
		const currentHash = await sha256HexFromBase64(base64);
		if (acceptedLabelHash && currentHash === acceptedLabelHash) {
			overlay.open(({ isOpen, close }) => (
				<AlertDialog
					img={CaptureGuideImg}
					title="이미 업로드한 이미지입니다"
					body="라벨과 의류에 동일한 이미지는 사용할 수 없어요."
					isOpen={isOpen}
					close={close}
				/>
			));

			return;
		}

		const normalized = (extension === "jpg" ? "jpeg" : extension) as IMGFormat;

		// UI 즉시 업데이트: Stage 2에서는 저장만 수행 (분석 X)
		setClothesPreview(dataURL);
		setImageStatus((prev) => ({
			...prev,
			clothes: {
				format: normalized,
				data: dataURL,
				isValid: true,
				didFail: false,
			},
		}));
		setAcceptedClothesHash(currentHash);

		// 업로드 직후 서버 검증 실행 (라벨+의류 병렬)
		let shouldAutoAnalyze = false;
		try {
			setIsValidating(true);
			setShowOverlay(true);
			const snapshot = imageStatusRef.current;
			const hasLabel = Boolean(snapshot.label.data);
			const labelPromise = hasLabel
				? validateImage({
						type: "label",
						image: {
							format: snapshot.label.format as (typeof IMG_FORMAT)[number],
							data: snapshot.label.data,
						},
					})
				: Promise.resolve(false);
			const clothesPromise = validateImage({
				type: "clothes",
				image: { format: normalized, data: dataURL },
			});

			const [labelRes, clothesRes] = await Promise.allSettled([
				labelPromise,
				clothesPromise,
			]);
			const labelValid =
				labelRes.status === "fulfilled" ? Boolean(labelRes.value) : false;
			const clothesValid =
				clothesRes.status === "fulfilled" ? Boolean(clothesRes.value) : false;

			setImageStatus((prev) => ({
				...prev,
				label: { ...prev.label, isValid: labelValid, didFail: !labelValid },
				clothes: {
					...prev.clothes,
					isValid: clothesValid,
					didFail: !clothesValid,
				},
			}));

			if (labelValid && clothesValid) {
				shouldAutoAnalyze = true;
			}

			// 실패한 경우 해당 단계로 안내
			if (!labelValid && !clothesValid) {
				setStage(1);
			} else if (!labelValid) {
				setStage(1);
			} else if (!clothesValid) {
				setStage(2);
			}
		} catch (e) {
			console.error("이미지 검증(병렬) 중 오류:", e);
			setImageStatus((prev) => ({
				...prev,
				label: {
					...prev.label,
					isValid: prev.label.isValid && !!prev.label.data,
					didFail: !prev.label.data,
				},
				clothes: { ...prev.clothes, isValid: false, didFail: true },
			}));
			setStage(2);
		} finally {
			setIsValidating(false);
			setShowOverlay(false);
			if (shouldAutoAnalyze && !isAnalyzing) {
				await analyzeWithCurrentImages();
			}
		}
	};

	// 현재 저장된 이미지로 즉시 분석만 수행 (이미 검증된 경우에 사용)
	const analyzeWithCurrentImages = async () => {
		if (isAnalyzing) return;
		const snapshot = imageStatusRef.current;
		const hasLabel = Boolean(snapshot.label.data);
		if (!hasLabel || !snapshot.label.format) {
			setStage(1);
			return;
		}

		setShowOverlay(true);
		setIsAnalyzing(true);
		try {
			const labelFmt = snapshot.label.format;
			const labelData = snapshot.label.data;
			const clothesProvided = Boolean(snapshot.clothes.data);
			const clothesFmt: IMGFormat | null = clothesProvided
				? (snapshot.clothes.format ?? "jpeg")
				: null;
			const payload = {
				labelImage: { format: labelFmt, data: labelData },
				clothesImage:
					clothesProvided && clothesFmt
						? { format: clothesFmt, data: snapshot.clothes.data }
						: undefined,
			};
			const { laundry: analysed } = await createLaundryAnalysis(payload);

			tempLaundry.set({
				type: analysed.type,
				color: analysed.color,
				materials: analysed.materials,
				hasPrintOrTrims: analysed.hasPrintOrTrims,
				laundrySymbols: analysed.laundrySymbols,
				additionalInfo: analysed.additionalInfo,
				image: {
					label: { format: labelFmt, data: labelData },
					clothes:
						clothesProvided && clothesFmt
							? { format: clothesFmt, data: snapshot.clothes.data }
							: null,
				},
			});
			setStage(3);
			setIsUploadFailed(false);
			setLastLabelError(null);
		} catch (error: unknown) {
			console.error("분석 중 오류 발생:", error);
			setImageStatus((prev) => ({
				...prev,
				label: { ...prev.label, didFail: true, isValid: false },
			}));
			setAutoProceedAfterLabelUpload(false);
			setIsUploadFailed(true);
			setLastLabelError("분석에 실패했어요. 가이드에 맞춰 다시 촬영해주세요.");
			setStage(1);
		} finally {
			setIsAnalyzing(false);
			setShowOverlay(false);
		}
	};

	// Stage 2 CTA: 검증 -> 분석
	const runValidationAndAnalysis = async () => {
		// 검증/분석 중복 실행 방지 (오버레이 여부는 가드에 포함하지 않음)
		if (isAnalyzing || isValidating) return;

		setShowOverlay(true);

		// 1) 서버 검증 (병렬 실행). 라벨은 필수, 의류는 선택
		setIsValidating(true);
		const snapshot = imageStatusRef.current;
		const hasLabel = Boolean(snapshot.label.data);
		const clothesProvided = Boolean(snapshot.clothes.data);
		if (!hasLabel) {
			// 안전 장치: 라벨이 없으면 Stage 1로 이동
			setIsValidating(false);
			setShowOverlay(false);
			setStage(1);
			return;
		}

		const labelFormat = snapshot.label.format;
		if (!labelFormat) {
			// 안전 장치: 포맷 정보가 없으면 Stage 1로 이동
			setIsValidating(false);
			setShowOverlay(false);
			setStage(1);
			return;
		}

		const labelPromise = validateImage({
			type: "label",
			image: {
				format: labelFormat,
				data: snapshot.label.data,
			},
		});
		const clothesFormat = snapshot.clothes.format;
		const clothesFmtForValidation: IMGFormat = clothesFormat ?? "jpeg";
		const clothesPromise = clothesProvided
			? validateImage({
					type: "clothes",
					image: {
						format: clothesFmtForValidation,
						data: snapshot.clothes.data,
					},
				})
			: Promise.resolve(true);

		const [labelResult, clothesResult] = await Promise.allSettled([
			labelPromise,
			clothesPromise,
		]);
		const labelValid =
			labelResult.status === "fulfilled" ? Boolean(labelResult.value) : false;
		const clothesValid =
			clothesResult.status === "fulfilled"
				? Boolean(clothesResult.value)
				: false;

		// 상태 업데이트 (검증 결과 반영)
		setImageStatus((prev) => ({
			...prev,
			label: { ...prev.label, isValid: labelValid, didFail: !labelValid },
			clothes: {
				...prev.clothes,
				isValid: clothesProvided ? clothesValid : prev.clothes.isValid,
				didFail: clothesProvided ? !clothesValid : prev.clothes.didFail,
			},
		}));

		if (!labelValid && !clothesValid) {
			setImageStatus((prev) => ({
				...prev,
				label: { ...prev.label, didFail: true },
				clothes: { ...prev.clothes, didFail: true },
			}));
			setIsValidating(false);
			setShowOverlay(false);
			setStage(1);
			return;
		}
		if (!labelValid && clothesValid) {
			setImageStatus((prev) => ({
				...prev,
				label: { ...prev.label, didFail: true },
			}));
			// 라벨만 실패한 경우, 라벨 업로드 후 자동 진행
			setAutoProceedAfterLabelUpload(true);
			setIsValidating(false);
			setShowOverlay(false);
			setStage(1);
			return;
		}
		if (labelValid && !clothesValid) {
			setImageStatus((prev) => ({
				...prev,
				clothes: { ...prev.clothes, didFail: true },
			}));
			setIsValidating(false);
			setShowOverlay(false);
			setStage(2);
			return;
		}

		// 2) 분석 수행 (createLaundryAnalysis 사용)
		setIsAnalyzing(true);
		try {
			const labelFmt = snapshot.label.format;
			if (!labelFmt) {
				throw new Error("Label image format is missing");
			}
			const labelData = snapshot.label.data;
			const clothesFmt: IMGFormat | null = clothesProvided
				? (snapshot.clothes.format ?? "jpeg")
				: null;
			const payload = {
				labelImage: { format: labelFmt, data: labelData },
				clothesImage: clothesProvided
					? clothesFmt
						? { format: clothesFmt, data: snapshot.clothes.data }
						: undefined
					: undefined,
			};
			const { laundry: analysed } = await createLaundryAnalysis(payload);

			// 분석 결과 저장 후 Stage 3로 이동 (이미지는 현재 입력값 사용)
			tempLaundry.set({
				type: analysed.type,
				color: analysed.color,
				materials: analysed.materials,
				hasPrintOrTrims: analysed.hasPrintOrTrims,
				laundrySymbols: analysed.laundrySymbols,
				additionalInfo: analysed.additionalInfo,
				image: {
					label: { format: labelFmt, data: labelData },
					clothes:
						clothesProvided && clothesFmt
							? { format: clothesFmt, data: snapshot.clothes.data }
							: null,
				},
			});
			setStage(3);
			setIsUploadFailed(false);
			setLastLabelError(null);
		} catch (error: unknown) {
			console.error("분석 중 오류 발생:", error);
			// 분석 단계 실패는 라벨 이미지 실패로 간주하고 Stage 1로 이동
			setImageStatus((prev) => ({
				...prev,
				label: { ...prev.label, didFail: true, isValid: false },
			}));
			setAutoProceedAfterLabelUpload(false);
			setIsUploadFailed(true);
			setLastLabelError("분석에 실패했어요. 가이드에 맞춰 다시 촬영해주세요.");
			setStage(1);
		} finally {
			setIsAnalyzing(false);
			setIsValidating(false);
			setShowOverlay(false);
		}
	};

	useBlocker({
		shouldBlockFn: async ({ next }) => {
			if (laundry === null || next.fullPath !== "/") {
				return false;
			}

			const shouldBlock = await overlay.openAsync<boolean>(
				({ isOpen, close }) => {
					return (
						<ConfirmDialog
							img={CaptureGuideImg}
							title="정말 나가시겠어요?"
							body="라벨 촬영을 중단하면 분석 정보가 사라져요."
							isOpen={isOpen}
							confirm={() => close(false)}
							cancel={() => close(true)}
						/>
					);
				},
			);

			if (shouldBlock) {
				return true;
			} else {
				tempLaundry.clear();
				return false;
			}
		},
		enableBeforeUnload: true,
	});

	return (
		<div className="flex min-h-dvh flex-col justify-between bg-gray-3 px-[16px] pt-[54px] pb-[46px]">
			<div>
				<header className="flex">
					<div>Stepper</div>
					<Link to="/" className="ml-auto">
						<CloseIcon />
					</Link>
				</header>

				{/* 숨겨진 업로더: Step A/B에서 클릭으로 트리거 */}
				<LabelUploadArea
					ref={hiddenImageUploaderRef}
					accept="image/*"
					label="라벨"
					onUpload={handleLabelUploaded}
					onProcessingChange={(processing) => {
						// Stage 1의 라벨 업로드 시엔 전체 오버레이를 띄우지 않음
						setIsValidating(processing);
					}}
					deferPreview
					busy={isAnalyzing}
					image={labelPreview}
					maxSize={5 * 1024 * 1024}
					disabled={isAnalyzing}
					onError={(message) => {
						// 검증 실패 등 클라이언트 에러도 Step B로 전환
						setIsUploadFailed(true);
						setLastLabelError(message || "이미지 업로드에 실패했습니다.");
					}}
					className="hidden"
				/>

				{/* 이미지 검증 또는 분석 중 스피너 표시 */}
				{showOverlay && (
					<div
						aria-live="polite"
						className="fixed inset-0 z-50 flex h-dvh w-dvw flex-col items-center justify-center bg-main-skyblue/40"
					>
						<div className="h-[120px] w-[120px] animate-spin rounded-full border-12 border-main-blue-1 border-t-transparent" />
						<p className="mt-6 text-center text-subhead font-bold">
							평균 응답 시간인 <br />
							<span className="text-main-blue-1">30</span>초
							<br /> 정도만 기다려주세요
						</p>
					</div>
				)}

				{/* Stage 1: 라벨 업로드 */}
				{stage === 1 && (
					<section>
						<div className="mb-[60px]">
							<h2 className="mb-[18px] text-center text-title-2 font-semibold text-black-2">
								케어라벨을 촬영해주세요
							</h2>
							<p className="text-center text-body-1 text-dark-gray-1">
								옷 안쪽에 세탁기호와 소재가 <br /> 적혀있는 라벨을 촬영해주세요
							</p>
						</div>

						<div className="flex flex-col items-center gap-[16px] rounded-[24px] bg-white p-[35px]">
							<div className="w-1/2">
								<img
									src={LabelCaptureGuideImg}
									role="presentation"
									className="size-full"
								/>
							</div>
							<p className="text-center text-subhead font-medium text-black">
								라벨이 화면 안에 들어오게 찍어주세요.
							</p>
							<button
								onClick={() => hiddenImageUploaderRef.current?.triggerUpload()}
								disabled={isAnalyzing || isValidating}
								className="flex w-[130px] cursor-pointer items-center justify-center gap-[4px] rounded-[12px] bg-light-blue py-[19px] text-body-1 font-semibold text-main-blue-2 disabled:cursor-not-allowed disabled:opacity-60"
							>
								<PlusCircleIcon />
								케어라벨
							</button>
						</div>
					</section>
				)}

				{/* Stage 2: 의류 업로드(선택) + CTA */}
				{stage === 2 && (
					<section>
						<div className="mb-[48px]">
							<p className="mb-[18px] text-center text-title-2 font-semibold text-black-2">
								의류 사진도 올려볼까요?
							</p>
							<p className="text-center text-body-1 text-dark-gray-1">
								의류 사진은 선택 사항이에요. 아래 버튼으로 바로 결과를 볼 수도
								있어요.
							</p>
						</div>

						<div className="flex flex-col items-center gap-[16px] rounded-[24px] bg-white p-[35px]">
							<img src={ClothesCaptureGuideImg} role="presentation" />

							<div className="mb-[28px] flex justify-center gap-[16px]">
								{/* 의류 업로드 영역 (선택), 썸네일 미표시 */}
								<LabelUploadArea
									label="의류"
									onUpload={handleClotheUploaded}
									onProcessingChange={(processing) => {
										// 의류 업로드 처리 중에는 전체 오버레이 표시 및 CTA 비활성화를 위해 검증 상태 동기화
										setShowOverlay(processing);
										setIsValidating(processing);
									}}
									deferPreview
									maxSize={5 * 1024 * 1024}
									disabled={isAnalyzing}
									onError={(message) => {
										setShowOverlay(false);
										setIsValidating(false);
										setImageStatus((prev) => ({
											...prev,
											clothes: {
												...prev.clothes,
												isValid: false,
												didFail: true,
											},
										}));
										setLastLabelError(
											message || "이미지 업로드에 실패했습니다.",
										);
									}}
								/>
							</div>

							<button
								onClick={runValidationAndAnalysis}
								disabled={isAnalyzing || isValidating}
								className="flex w-full max-w-[360px] items-center justify-center gap-[4px] rounded-[12px] bg-main-blue-1 py-[18px] text-body-1 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
							>
								바로 결과보러 갈래요
							</button>
						</div>
					</section>
				)}

				{/* Stage 3: 분석 결과 표시 (기존 Step C) */}
				{stage === 3 && laundry && (
					<section>
						<div className="mb-[60px]">
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
						</div>

						<div className="flex flex-col items-center gap-[16px] rounded-[24px] bg-white p-[35px]">
							{/* 업로드 영역들 (결과 화면에서도 수정 가능) */}
							<div className="mb-[28px] flex justify-center gap-[16px]">
								<LabelUploadArea
									label="라벨"
									onUpload={handleLabelUploaded}
									onProcessingChange={(processing) =>
										setIsValidating(processing)
									}
									deferPreview
									busy={isAnalyzing}
									image={labelPreview}
									maxSize={5 * 1024 * 1024}
									disabled={isAnalyzing}
								/>

								<LabelUploadArea
									label="의류"
									onUpload={handleClotheUploaded}
									deferPreview
									image={clothesPreview}
									maxSize={5 * 1024 * 1024}
									disabled={isAnalyzing}
								/>
							</div>

							{/* 분석 정보 */}
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
											<img
												src={symbolUrl(`${symbol.code}.png`)}
												className="size-3/4"
											/>
										</li>
									))}
									{Array.from({
										length: 6 - laundry.laundrySymbols.length,
									}).map((_, index) => (
										<li
											key={index}
											className="flex aspect-square items-center justify-center rounded-[10px] border border-gray-bluegray-2 bg-white text-body-1 font-medium text-dark-gray-1"
										></li>
									))}
								</ul>
							</div>
						</div>
					</section>
				)}
			</div>

			<footer className="flex justify-between gap-[13px]">
				<button
					onClick={() => {
						navigate({ to: "/laundry/edit" });
					}}
					disabled={hasLaundry === false}
					className={cn(
						"grow rounded-[10px] bg-gray-bluegray-2 py-[18px] text-subhead font-medium text-dark-gray-2",
						"disabled:cursor-not-allowed disabled:border disabled:border-gray-2 disabled:bg-white disabled:text-gray-1",
					)}
				>
					수정할게요
				</button>
				<button
					onClick={() => {
						navigate({ to: "/analysing" });
					}}
					disabled={hasLaundry === false}
					className={cn(
						"flex grow items-center justify-center rounded-[10px] bg-main-blue-1 py-[18px] text-white",
						"disabled:cursor-not-allowed disabled:bg-gray-2 disabled:text-gray-1",
					)}
				>
					바로 세탁 방법 볼래요
				</button>
			</footer>
		</div>
	);
}
