import { validateImage } from "@/entities/image/api";
import { analysisLaundryImages } from "@/entities/laundry/api";
import { useLaundryDraft } from "@/entities/laundry/store/draft";
import { useQueryEffect } from "@/shared/utils/hooks/use-query-effect";
import { useQuery } from "@tanstack/react-query";
import { useRef } from "react";
import { Quiz } from "../quiz";

type ImageStatus = {
	label: { image: string | null; isValid: boolean; didManual: boolean };
	clothes: { image: string | null; isValid: boolean };
};

export const AnalysisLoading = ({
	imageStatus,
	onValidateDone,
	onAnalysisDone,
	onError,
}: {
	imageStatus: ImageStatus;
	onValidateDone: (isValid: { label: boolean; clothes: boolean }) => void;
	onAnalysisDone: () => void;
	onError: () => void;
}) => {
	const laundryDraft = useLaundryDraft();

	// MARK: 이미지 유효성 검사
	const abortCtlrRef = useRef<AbortController>(new AbortController());

	async function validateImages(): Promise<{
		label: boolean;
		clothes: boolean;
	}> {
		const { label, clothes } = imageStatus;

		const labelPromise =
			label.isValid || label.didManual
				? Promise.resolve(true)
				: validateImage(
						{
							type: "label",
							image: {
								format: "jpeg",
								data: label.image!,
							},
						},
						{ signal: abortCtlrRef.current.signal },
					);
		const clothesPromise = clothes.isValid
			? Promise.resolve(true)
			: validateImage(
					{
						type: "clothes",
						image: {
							format: "jpeg",
							data: clothes.image!,
						},
					},
					{ signal: abortCtlrRef.current.signal },
				);

		const [labelResult, clothesResult] = await Promise.allSettled([
			labelPromise,
			clothesPromise,
		]);
		const isLabelValid =
			labelResult.status === "fulfilled" ? labelResult.value : false;
		const isClothesValid =
			clothesResult.status === "fulfilled" ? clothesResult.value : false;

		return { label: isLabelValid, clothes: isClothesValid };
	}

	const validationQueryKeyRef = useRef(crypto.randomUUID());
	const validationQueryKey = validationQueryKeyRef.current;
	const validationQuery = useQuery({
		queryKey: [validationQueryKey],
		queryFn: validateImages,
	});

	useQueryEffect(validationQuery, {
		onSuccess: (isValid) => {
			onValidateDone(isValid);
		},
	});

	// MARK: 분석 요청 쿼리
	const analysisQueryKeyRef = useRef(crypto.randomUUID());
	const analysisQueryKey = analysisQueryKeyRef.current;
	const analysisQuery = useQuery({
		queryKey: [analysisQueryKey],
		queryFn: ({ signal }) =>
			analysisLaundryImages(
				{
					label:
						imageStatus.label.image === null
							? null
							: { format: "jpeg", data: imageStatus.label.image },
					clothes:
						imageStatus.clothes.image === null
							? null
							: { format: "jpeg", data: imageStatus.clothes.image },
				},
				{ signal },
			),
		enabled: imageStatus.label.isValid && imageStatus.clothes.isValid,
	});

	useQueryEffect(analysisQuery, {
		onSuccess: (data) => {
			laundryDraft.set({
				...data.laundry,
				image: {
					label: imageStatus.label.image,
					clothes: imageStatus.clothes.image,
				},
			});
			onAnalysisDone();
		},
		onError: () => {
			onError();
		},
	});

	return <Quiz />;
};
