import { useState } from "react";
import { overlay } from "overlay-kit";
import { createFileRoute, useBlocker } from "@tanstack/react-router";
import BubblySadImg from "@/assets/images/bubbly-sad.avif";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useTempLaundry } from "@/entities/laundry/store/temp";
import { LabelUpload } from "./-ui/steps/label-upload";
import { LabelUploadRetry } from "./-ui/steps/label-upload-retry";
import { LabelUploadManual } from "./-ui/steps/label-upload-manual";
import { ClothesUpload } from "./-ui/steps/clothes-upload";
import { ClothesUploadRetry } from "./-ui/steps/clothes-upload-retry";
import { AnalysisLoading } from "./-ui/steps/analysis-loading";
import { AnalysisError } from "./-ui/steps/analysis-error";
import { AnalysisResult } from "./-ui/steps/analysis-result";
import { AnalysisResultEdit } from "./-ui/steps/analysis-result-edit";

export const Route = createFileRoute("/analysis")({
	component: RouteComponent,
});

type Step =
	| "label-upload"
	| "label-upload-retry"
	| "label-upload-manual"
	| "clothes-upload"
	| "clothes-upload-retry"
	| "analysis-loading"
	| "analysis-error"
	| "analysis-result"
	| "analysis-result-edit";

type ImageStatus = {
	label: { image: string | null; isValid: boolean; didManual: boolean };
	clothes: { image: string | null; isValid: boolean };
};

function RouteComponent() {
	const [step, setStep] = useState<Step>("label-upload");
	const [imageStatus, setImageStatus] = useState<ImageStatus>({
		label: {
			image: null,
			isValid: false,
			didManual: false,
		},
		clothes: {
			image: null,
			isValid: false,
		},
	});

	const tempLaundry = useTempLaundry();

	// MARK: 페이지 이탈 방지
	useBlocker({
		shouldBlockFn: async ({ next }) => {
			if (step === "label-upload" || next.fullPath === "/analysing") {
				return false;
			}

			const shouldBlock = await overlay.openAsync<boolean>(
				({ isOpen, close }) => {
					return (
						<ConfirmDialog
							img={BubblySadImg}
							title="정말 나가시겠어요?"
							body="페이지를 떠나면, 진행한 내용은 모두 사라져요."
							isOpen={isOpen}
							confirm={() => close(false)}
							cancel={() => close(true)}
						/>
					);
				},
			);

			if (shouldBlock === false) {
				tempLaundry.clear();
			}

			return shouldBlock;
		},
	});

	switch (step) {
		// MARK: 라벨 업로드
		case "label-upload":
			return (
				<LabelUpload
					onRegister={(imageDataUrl: string) => {
						setImageStatus((prev) => ({
							...prev,
							label: { ...prev.label, image: imageDataUrl },
						}));
						setStep("clothes-upload");
					}}
				/>
			);

		// MARK: 라벨 재업로드
		case "label-upload-retry":
			return (
				<LabelUploadRetry
					labelImage={imageStatus.label.image}
					onManual={() => setStep("label-upload-manual")}
					onRegister={(imageDataUrl: string) => {
						setImageStatus((prev) => ({
							...prev,
							label: { ...prev.label, image: imageDataUrl },
						}));

						if (imageStatus.clothes.isValid) {
							setStep("analysis-loading");
						} else {
							setStep("clothes-upload-retry");
						}
					}}
				/>
			);

		// MARK: 라벨 직접 입력
		case "label-upload-manual":
			return (
				<LabelUploadManual
					onDone={() => {
						setImageStatus((prev) => ({
							...prev,
							label: { image: null, isValid: true, didManual: true },
						}));

						// 직접 입력 & 의류 사진 무효 => 의류 재등록 단계로 이동
						// 직접 입력 & 의류 사진 유효 => 분석결과 단계로 이동
						if (imageStatus.clothes.image && imageStatus.clothes.isValid) {
							tempLaundry.set({
								...tempLaundry.state,
								image: {
									label: null,
									clothes: { data: imageStatus.clothes.image, format: "jpeg" },
								},
							});

							setStep("analysis-result");
						} else {
							setStep("clothes-upload-retry");
						}
					}}
					onExit={async () => {
						const willLeave = await overlay.openAsync(({ isOpen, close }) => {
							return (
								<ConfirmDialog
									img={BubblySadImg}
									title="정말 나가시겠어요?"
									body="페이지를 떠나면, 진행한 내용은 모두 사라져요."
									isOpen={isOpen}
									confirm={() => close(true)}
									cancel={() => close(false)}
								/>
							);
						});

						if (willLeave) {
							tempLaundry.clear();
							setStep("label-upload-retry");
						}
					}}
				/>
			);

		// MARK: 의류 업로드
		case "clothes-upload":
			return (
				<ClothesUpload
					onRegister={(imageDataUrl: string) => {
						setImageStatus((prev) => ({
							...prev,
							clothes: { ...prev.clothes, image: imageDataUrl },
						}));
						setStep("analysis-loading");
					}}
					onSkip={() => {
						setImageStatus((prev) => ({
							...prev,
							clothes: { image: null, isValid: true },
						}));
						setStep("analysis-loading");
					}}
				/>
			);

		// MARK: 의류 재업로드
		case "clothes-upload-retry":
			return (
				<ClothesUploadRetry
					clothesImage={imageStatus.clothes.image}
					onRegister={(imageDataUrl: string) => {
						setImageStatus((prev) => ({
							...prev,
							clothes: { ...prev.clothes, image: imageDataUrl },
						}));
						setStep("analysis-loading");
					}}
					onSkip={() => {
						setImageStatus((prev) => ({
							...prev,
							clothes: { image: null, isValid: true },
						}));

						// 직접 입력 & 의류 사진 스킵 => 분석결과 단계로 이동
						if (imageStatus.label.didManual) {
							setStep("analysis-result");
						} else {
							setStep("analysis-loading");
						}
					}}
				/>
			);

		// MARK: 분석 중
		case "analysis-loading":
			return (
				<AnalysisLoading
					imageStatus={imageStatus}
					onValidateDone={(isValid: { label: boolean; clothes: boolean }) => {
						setImageStatus((prev) => ({
							...prev,
							label: { ...prev.label, isValid: isValid.label },
							clothes: { ...prev.clothes, isValid: isValid.clothes },
						}));

						if (isValid.label === false) {
							setStep("label-upload-retry");
						} else if (isValid.clothes === false) {
							setStep("clothes-upload-retry");
						}
					}}
					onAnalysisDone={() => {
						setStep("analysis-result");
					}}
					onError={() => setStep("analysis-error")}
				/>
			);

		// MARK: 분석 중 오류
		case "analysis-error":
			return <AnalysisError onRetry={() => setStep("analysis-loading")} />;

		// MARK: 분석 결과
		case "analysis-result":
			return (
				<AnalysisResult
					imageStatus={imageStatus}
					onEdit={() => setStep("analysis-result-edit")}
				/>
			);

		// MARK: 분석 결과 수정
		case "analysis-result-edit":
			return (
				<AnalysisResultEdit
					onDone={() => setStep("analysis-result")}
					onExit={() => setStep("analysis-result")}
				/>
			);
		default:
			break;
	}
}
