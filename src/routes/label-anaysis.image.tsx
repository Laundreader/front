import { ConfirmDialog } from "@/components/confirm-dialog";
import { validateImage } from "@/entities/image/api";
import { createLaundryAnalysis } from "@/entities/laundry/api";
import { useTempLaundry } from "@/entities/laundry/store/temp";
import { cn, symbolUrl } from "@/lib/utils";
import {
	createFileRoute,
	Link,
	useBlocker,
	useNavigate,
} from "@tanstack/react-router";
import { overlay } from "overlay-kit";
import imageCompression, { type Options } from "browser-image-compression";
import CloseIcon from "@/assets/icons/close.svg?react";
import { QUZZES } from "@/shared/constant";
import BubblySadImg from "@/assets/images/bubbly-sad.png";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useQueryEffect } from "@/shared/utils/hooks/use-query-effect";
import AnalysisFailedBgImg from "@/assets/images/analysis-failed-bg.png";
import { ImgAnalysisStepEnum, imgAnalysisStepSearchSchema } from "./-schema";
import LabelCaptureGuideImg from "@/assets/images/label-capture-guide.png";
import ClothesCaptureGuideImg from "@/assets/images/clothes-capture-guide.png";
import PlusCircleIcon from "@/assets/icons/plus-circle.svg?react";
import { shuffle } from "es-toolkit";
import BubblyFrontImg from "@/assets/images/bubbly-front.png";
import BubbleBgImg from "@/assets/images/bubble-bg.png";
import SignOIcon from "@/assets/icons/sign-o.svg?react";
import SignXIcon from "@/assets/icons/sign-x.svg?react";
import RotateCcwIcon from "@/assets/icons/rotate-ccw.svg?react";

type ImageSlot = {
	image: {
		format: "jpeg";
		data: string;
	} | null;
	isValid: boolean;
	didFail: boolean;
};

export const Route = createFileRoute("/label-anaysis/image")({
	validateSearch: imgAnalysisStepSearchSchema,
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate({ from: Route.fullPath });
	const { step } = Route.useSearch();

	const tempLaundry = useTempLaundry();
	const laundry = tempLaundry.state;

	const [imageStatus, setImageStatus] = useState<{
		label: ImageSlot;
		clothes: ImageSlot;
	}>({
		label: { image: null, isValid: false, didFail: false },
		clothes: { image: null, isValid: false, didFail: false },
	});
	const [shouldValidate, setShouldValidate] = useState(false);

	// MARK: 스텝 가드
	useEffect(() => {
		if (
			step !== "label" &&
			laundry === null &&
			imageStatus.label.image === null &&
			imageStatus.clothes.image === null
		) {
			navigate({ search: { step: ImgAnalysisStepEnum.enum.label } });
		}
	}, []);

	// MARK: 이미지 업로드 처리
	async function handleImageUpload(
		event: React.ChangeEvent<HTMLInputElement>,
		type: "label" | "clothes",
	) {
		const imageFile = event.target.files?.[0];
		if (imageFile === undefined) {
			return;
		}

		const { format, imageDataUrl } = await processImage(imageFile, type);

		setImageStatus((prev) => ({
			...prev,
			[type]: {
				image: {
					format: format,
					data: imageDataUrl,
				},
				isValid: false,
				didFail: prev[type].didFail,
			},
		}));

		if (type === "label" && imageStatus.clothes.image === null) {
			setShouldValidate(false);
			navigate({ search: { step: ImgAnalysisStepEnum.enum.clothes } });
			return;
		}

		if (type === "label" && imageStatus.clothes.isValid) {
			setShouldValidate(true);
			navigate({ search: { step: ImgAnalysisStepEnum.enum.analysing } });
			return;
		}

		if (type === "clothes") {
			setShouldValidate(true);
			navigate({ search: { step: ImgAnalysisStepEnum.enum.analysing } });
			return;
		}
	}

	// MARK: 이미지 검사 트리거
	useEffect(() => {
		if (shouldValidate === false) {
			return;
		}

		(async () => {
			const isValid = await validateImages();

			setImageStatus((prev) => ({
				...prev,
				label: {
					image: isValid.label ? prev.label.image : null,
					isValid: isValid.label,
					didFail:
						prev.label.didFail ||
						(isValid.label === false && prev.label.didFail === false),
				},
				clothes: {
					image: isValid.clothes ? prev.clothes.image : null,
					isValid: isValid.clothes,
					didFail:
						prev.clothes.didFail ||
						(isValid.clothes === false && prev.clothes.didFail === false),
				},
			}));

			if (isValid.label === false) {
				navigate({ search: { step: ImgAnalysisStepEnum.enum.label } });
			} else if (isValid.clothes === false) {
				navigate({ search: { step: ImgAnalysisStepEnum.enum.clothes } });
			} else if (isValid.label && isValid.clothes) {
				navigate({ search: { step: ImgAnalysisStepEnum.enum.analysing } });
			}

			setShouldValidate(false);
		})();
	}, [shouldValidate]);

	// MARK: 이미지 처리
	async function processImage(
		imageFile: File,
		type: "label" | "clothes",
	): Promise<{ format: "jpeg"; imageDataUrl: string }> {
		const options: Options = {
			maxSizeMB: type === "label" ? 2 : 0.5,
			maxWidthOrHeight: 2240,
			useWebWorker: true,
			fileType: "image/jpeg",
		};

		const compressedFile = await imageCompression(imageFile, options);
		const imageDataUrl =
			await imageCompression.getDataUrlFromFile(compressedFile);

		return { format: "jpeg", imageDataUrl };
	}

	// MARK: 이미지 유효성 검사
	const abortCtlrRef = useRef<AbortController>(new AbortController());

	async function validateImages(): Promise<{
		label: boolean;
		clothes: boolean;
	}> {
		const labelStatus = imageStatus.label;
		const clothesStatus = imageStatus.clothes;

		const labelPromise =
			labelStatus.image === null
				? Promise.resolve(false)
				: labelStatus.isValid
					? Promise.resolve(true)
					: validateImage(
							{
								type: "label",
								image: {
									format: "jpeg",
									data: labelStatus.image.data,
								},
							},
							{ signal: abortCtlrRef.current.signal },
						);
		const clothesPromise =
			clothesStatus.image === null || clothesStatus.isValid
				? Promise.resolve(true)
				: validateImage(
						{
							type: "clothes",
							image: {
								format: "jpeg",
								data: clothesStatus.image.data,
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

	// MARK: 분석 요청 쿼리
	const randomSessionIdQueryKeyRef = useRef(crypto.randomUUID());
	const randomSessionIdQueryKey = randomSessionIdQueryKeyRef.current;
	const analysisQuery = useQuery({
		queryKey: [randomSessionIdQueryKey],
		queryFn: ({ signal }) =>
			createLaundryAnalysis(
				{
					label: { format: "jpeg", data: imageStatus.label.image!.data },
					clothes:
						imageStatus.clothes.image === null
							? undefined
							: {
									format: "jpeg",
									data: imageStatus.clothes.image.data,
								},
				},
				{ signal },
			),
		enabled: imageStatus.label.isValid && imageStatus.clothes.isValid,
	});

	useQueryEffect(analysisQuery, {
		onSuccess: (data) => {
			tempLaundry.set({
				...data.laundry,
				image: {
					label: { format: "jpeg", data: imageStatus.label.image!.data },
					clothes:
						imageStatus.clothes.image === null
							? undefined
							: {
									format: "jpeg",
									data: imageStatus.clothes.image.data,
								},
				},
			});
			navigate({ search: { step: ImgAnalysisStepEnum.enum.analysis } });
		},
		onError: () => {
			navigate({ search: { step: ImgAnalysisStepEnum.enum.error } });
		},
	});

	// MARK: 30초 퀴즈
	// 30초 카운트다운 (반복)
	const [seconds, setSeconds] = useState(30);
	const [quizIndex, setQuizIndex] = useState(0);
	const [choice, setChoice] = useState<boolean | null>(null);

	const advanceTimerRef = useRef<number | null>(null);
	const shuffledQuizzes = useMemo(() => shuffle(QUZZES), []);
	const currentQuiz = shuffledQuizzes[quizIndex % shuffledQuizzes.length];

	function handleClickChoice(currentChoice: boolean) {
		// 중복 클릭 방지
		if (choice !== null) {
			return;
		}

		setChoice(currentChoice);

		// 3초 뒤 다음 문제로 이동
		advanceTimerRef.current = window.setTimeout(() => {
			setQuizIndex((i) => i + 1);
			setChoice(null);
		}, 3000);
	}

	// 30초 무한 반복
	useEffect(() => {
		if (step !== "analysing") {
			return;
		}

		const id = setInterval(() => {
			setSeconds((second) => (second <= 1 ? 30 : second - 1));
		}, 1000);

		return () => {
			clearInterval(id);
		};
	}, [step]);

	// 컴포넌트 언마운트 시 타이머 정리
	useEffect(() => {
		if (step !== "analysing") {
			return;
		}

		return () => {
			if (advanceTimerRef.current) {
				window.clearTimeout(advanceTimerRef.current);
			}
		};
	}, [step]);

	// MARK: 페이지 이탈 방지
	useBlocker({
		shouldBlockFn: async ({ current, next }) => {
			if (
				step === "label" ||
				current.fullPath === next.fullPath ||
				next.fullPath === "/laundry/edit" ||
				next.fullPath === "/analysing"
			) {
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
				abortCtlrRef.current.abort();
			}

			return shouldBlock;
		},
	});

	// MARK: 마크업
	return (
		<div
		// className="flex min-h-dvh flex-col justify-between bg-gray-3 px-[16px] pt-[54px] pb-[46px]"
		>
			<div className="contents">
				{/* 
        MARK: 라벨 업로드 단계
        */}
				{step === "label" && (
					<div className="grid h-dvh grid-rows-[auto_1fr] p-4">
						<header className="flex">
							<Link to="/" className="ml-auto">
								<CloseIcon />
							</Link>
						</header>

						<section className="grid min-h-0 grid-rows-[1fr_2fr_1fr]">
							<div className="flex flex-col items-center gap-4">
								<h2 className="text-center text-title-2 font-semibold text-black-2">
									케어라벨을 촬영해주세요
								</h2>
								<p className="text-center text-body-1 text-dark-gray-1">
									옷 안쪽에 세탁기호와 소재가 <br /> 적혀있는 라벨을
									촬영해주세요
								</p>
							</div>

							<div className="flex flex-col items-center justify-evenly rounded-3xl bg-white p-3">
								<div className="aspect-square w-1/2">
									<img
										src={LabelCaptureGuideImg}
										alt="케어라벨 촬영 가이드"
										className="aspect-square h-full w-full object-contain"
									/>
								</div>
								<p className="text-center text-subhead font-medium text-dark-gray-1">
									라벨이 화면 안에 들어오게 찍어주세요.
								</p>
								{imageStatus.label.didFail ? (
									<label
										htmlFor="label-image-upload"
										className="flex cursor-pointer items-center justify-center gap-1 rounded-xl bg-light-red px-5 py-4 text-body-1 font-semibold text-orange"
									>
										<RotateCcwIcon />
										다시 촬영
									</label>
								) : (
									<label
										htmlFor="label-image-upload"
										className="flex cursor-pointer items-center justify-center gap-1 rounded-xl bg-light-blue px-5 py-4 text-body-1 font-semibold text-main-blue-2"
									>
										<PlusCircleIcon />
										케어라벨 추가
									</label>
								)}
								<input
									id="label-image-upload"
									type="file"
									accept="image/*"
									onChange={(e) => handleImageUpload(e, "label")}
									className="hidden"
								/>
							</div>

							<div className="self-end">
								<Link
									to="/laundry/edit"
									className={cn(
										"flex w-full max-w-[360px] items-center justify-center gap-[4px] rounded-[12px] bg-main-blue-1 py-[18px] text-body-1 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60",
										imageStatus.label.didFail === false && "invisible",
									)}
								>
									직접 입력할게요
								</Link>
							</div>
						</section>
					</div>
				)}

				{/* 
        MARK: 의류 업로드 단계 
        */}
				{step === "clothes" && (
					<div className="grid h-dvh grid-rows-[auto_1fr] p-4">
						<header className="flex">
							<Link to="/" className="ml-auto">
								<CloseIcon />
							</Link>
						</header>

						<section className="grid min-h-0 grid-rows-[1fr_2fr_1fr]">
							<div>
								<p className="mb-[18px] text-center text-title-2 font-semibold text-black-2">
									의류를 촬영해주세요
								</p>
								<p className="text-center text-body-1 text-dark-gray-1">
									더 정확한 분석을 위해 <br />
									전체 의류 사진을 촬영해주세요.
								</p>
							</div>

							<div className="flex flex-col items-center justify-evenly rounded-3xl bg-white p-3">
								<div className="aspect-square w-1/2">
									<img
										src={ClothesCaptureGuideImg}
										alt="의류 촬영 가이드"
										className="aspect-square h-full w-full object-contain"
									/>
								</div>
								<p className="text-center text-subhead font-medium text-dark-gray-1">
									옷이 화면 안에 들어오게 찍어주세요.
								</p>
								{imageStatus.clothes.didFail ? (
									<label
										htmlFor="clothes-image-upload"
										className="flex cursor-pointer items-center justify-center gap-1 rounded-xl bg-light-red px-5 py-4 text-body-1 font-semibold text-orange"
									>
										<RotateCcwIcon />
										다시 촬영
									</label>
								) : (
									<label
										htmlFor="clothes-image-upload"
										className="flex cursor-pointer items-center justify-center gap-1 rounded-xl bg-light-blue px-5 py-4 text-body-1 font-semibold text-main-blue-2"
									>
										<PlusCircleIcon />
										의류 추가
									</label>
								)}
								<input
									id="clothes-image-upload"
									type="file"
									accept="image/*"
									onChange={(e) => handleImageUpload(e, "clothes")}
									className="hidden"
								/>
							</div>

							<button
								onClick={() => {
									setShouldValidate(true);
									navigate({
										search: { step: ImgAnalysisStepEnum.enum.analysing },
									});
								}}
								className="flex h-fit w-full max-w-[360px] items-center justify-center gap-[4px] self-end rounded-[12px] bg-main-blue-1 py-[18px] text-body-1 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
							>
								바로 결과보러 갈래요
							</button>
						</section>
					</div>
				)}

				{/* 
        MARK: 분석 중 단계
        */}
				{step === "analysing" && (
					<div
						style={{ backgroundImage: `url(${BubbleBgImg})` }}
						className="grid h-dvh grid-rows-[auto_1fr] bg-cover bg-center bg-no-repeat"
					>
						{/* 스텝바 */}
						<div className="grid grid-cols-3 p-4">
							<div className="col-start-2 flex items-center justify-self-center">
								<div className="relative">
									<div className="absolute top-1/2 right-0 z-10 size-3 translate-x-1/2 -translate-y-1/2 rounded-full bg-main-blue-1"></div>
								</div>
								<div className="relative">
									<div className="w-9 border border-dashed border-main-blue-1"></div>
									<div className="absolute top-1/2 right-0 z-10 size-3 translate-x-1/2 -translate-y-1/2 rounded-full bg-main-blue-1"></div>
								</div>
								<div className="relative">
									<div className="w-9 border border-dashed border-blue"></div>
									<div className="absolute top-1/2 right-0 z-10 size-3 translate-x-1/2 -translate-y-1/2 rounded-full bg-blue"></div>
								</div>
							</div>
							<Link
								to="/label-analysis"
								replace
								className="ml-auto block w-fit"
							>
								<CloseIcon />
								<span className="sr-only">분석 중단하고 나가기</span>
							</Link>
							{/* <button
								onClick={async () => {
									const shouldLeaave = await overlay.openAsync(
										({ isOpen, close }) => {
											return (
												<ConfirmDialog
													isOpen={isOpen}
													title="분석을 취소하시겠어요?"
													body="분석을 취소하면, 지금까지 입력한 정보가 모두 사라져요."
													img={BubblySadImg}
													cancel={() => close(false)}
													confirm={() => close(true)}
												/>
											);
										},
									);

									if (shouldLeaave) {
										navigate({ to: "/label-analysis" });
									}
								}}
								className="ml-auto block w-fit"
							>
								<CloseIcon />
								<span className="sr-only">분석 중단하고 나가기</span>
							</button> */}
						</div>

						<div className="grid grid-rows-[auto_1fr_auto] p-4 pt-0">
							<header className="text-center text-title-1 font-semibold break-keep text-black-2">
								똑똑한 세탁법을 위해
								<br /> 라벨을 분석하고 있어요
							</header>

							{/* 카운트 다운 */}
							<div className="flex flex-col items-center justify-center gap-8">
								<div className="w-fit overflow-hidden rounded-full bg-gradient-to-b from-white/40 to-white/10 p-px shadow-[0_0_40px_rgba(23,73,224,0.2)]">
									<div className="rounded-full bg-radial from-white/50 to-white/0 px-5 py-1 text-large-title font-semibold text-dark-gray-1 tabular-nums">
										<span className="bg-linear-270 from-[#5D9CFF] to-[#A48DFF] bg-clip-text text-transparent">
											{String(Math.floor(seconds / 60)).padStart(2, "0")}:
											{String(seconds % 60).padStart(2, "0")}
										</span>
									</div>
								</div>

								{/* 버블리 */}
								<div className="size-50">
									<img src={BubblyFrontImg} alt="" role="presentation" />
								</div>
							</div>

							{/* OX 퀴즈 */}
							{choice === null && (
								<div className="rounded-[40px] bg-gradient-to-b from-white/30 to-white/10 p-0.5 shadow-[0_0_40px_rgba(0,31,90,0.25)]">
									<div className="flex flex-col gap-6 rounded-[40px] bg-linear-150 from-white/25 to-[#EFB1FF]/5 p-6">
										{/* 문제 설명*/}
										<div className="flex gap-2 text-title-3 font-semibold">
											<span className="text-main-blue-2">Q{quizIndex + 1}</span>
											<p className="grow break-keep text-deep-blue">
												{currentQuiz.question}
											</p>
										</div>

										{/* 선택지 */}
										<div className="flex justify-around">
											<button
												aria-label="정답"
												disabled={choice !== null}
												onClick={() => handleClickChoice(true)}
											>
												<SignOIcon className="text-main-blue-1" />
											</button>
											<button
												aria-label="오답"
												disabled={choice !== null}
												onClick={() => handleClickChoice(false)}
											>
												<SignXIcon className="text-red" />
											</button>
										</div>
									</div>
								</div>
							)}

							{/* 결과 공개 */}
							{choice !== null && (
								<div className="rounded-[40px] bg-gradient-to-b from-white/30 to-white/10 p-0.5 shadow-[0_0_40px_rgba(0,31,90,0.25)]">
									<div className="flex flex-col gap-6 rounded-[40px] bg-linear-150 from-white/25 to-[#EFB1FF]/5 p-6">
										{/* 결과 */}
										<p
											className={cn(
												"flex items-center gap-4 text-title-1 font-semibold",
												choice === currentQuiz.answer
													? "text-main-blue-1"
													: "text-red",
											)}
										>
											{choice === currentQuiz.answer ? (
												<>
													<SignOIcon className="size-9" />
													맞았어요!
												</>
											) : (
												<>
													<SignXIcon className="size-9" />
													틀렸어요...
												</>
											)}
										</p>

										{/* 해설 */}
										<div className="flex justify-around text-title-3 font-semibold break-keep text-deep-blue">
											{currentQuiz.reason}
										</div>
									</div>
								</div>
							)}
						</div>
					</div>
				)}

				{/* 
        MARK: 분석 실패 단계
        */}
				{step === "error" && (
					<div
						style={{ backgroundImage: `url(${AnalysisFailedBgImg})` }}
						className="grid h-dvh grid-rows-[auto_1fr] flex-col bg-cover bg-center bg-no-repeat"
					>
						<header className="p-4">
							<Link
								to="/label-analysis"
								replace
								className="ml-auto block w-fit"
							>
								<CloseIcon />
								<span className="sr-only">분석 중단하고 나가기</span>
							</Link>
						</header>

						<section className="flex flex-col justify-between p-4">
							<div className="text-center text-title-1 font-semibold break-keep text-black-2">
								<p>분석하다 잠깐 오류가 있었어요</p>
								<p>다시 시도해볼까요?</p>
							</div>

							<button
								onClick={() => {
									navigate({
										search: { step: ImgAnalysisStepEnum.enum.analysing },
									});
								}}
								className="flex h-[56px] items-center justify-center rounded-[10px] bg-black-2 text-subhead font-medium text-white"
							>
								다시 분석해주세요
							</button>
						</section>
					</div>
				)}

				{/* 
        MARK: 분석결과 검수 단계
        */}
				{step === "analysis" && laundry !== null && (
					<div className="grid h-dvh grid-rows-[auto_1fr] p-4">
						<header className="flex">
							<Link to="/" className="ml-auto">
								<CloseIcon />
							</Link>
						</header>

						<section className="grid min-h-0 grid-rows-[1fr_2fr_1fr]">
							<div className="flex flex-col items-center gap-4">
								<h2 className="text-center text-title-2 font-semibold text-black-2">
									잠깐! 이 정보가 맞나요?
								</h2>
								<p className="text-center text-body-1 text-dark-gray-1">
									런드리더가 분석한 정보가 다르거나,
									<br />
									더욱 자세한 세탁법을 알고 싶다면
									<br />
									의류사진을 올리거나 정보를 더 알려주세요.
								</p>
							</div>

							<div className="flex flex-col items-center justify-evenly rounded-3xl bg-white p-4">
								<div className="flex justify-center gap-4">
									{laundry.image.label.data && (
										<img
											src={laundry.image.label.data}
											alt=""
											className="relative aspect-square size-30 cursor-pointer rounded-[16px] border border-gray-bluegray-2 bg-gray-3"
										/>
									)}
									{laundry.image.clothes?.data && (
										<img
											src={laundry.image.clothes.data}
											alt=""
											className="relative aspect-square size-30 cursor-pointer rounded-[16px] border border-gray-bluegray-2 bg-gray-3"
										/>
									)}
								</div>

								{/* 분석 정보 */}
								<div className="flex flex-col items-center">
									<p className="text-center text-subhead font-semibold text-black-2">
										이 세탁물의 소재는
									</p>
									<p className="text-center text-subhead font-semibold text-black-2">
										{laundry.materials.length === 0
											? "인식하지 못했어요."
											: laundry.materials.join(", ") + "예요."}
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
									<ul className="grid w-full grid-cols-6 gap-0.5">
										{laundry.laundrySymbols?.map((symbol) => (
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

							<footer className="flex justify-between gap-4 self-end">
								<Link
									to="/laundry/edit"
									className="flex grow items-center justify-center rounded-[12px] bg-gray-bluegray-2 py-[18px] text-body-1 font-semibold text-dark-gray-2"
								>
									수정할게요
								</Link>
								<Link
									to="/analysing"
									className="flex grow items-center justify-center rounded-[12px] bg-main-blue-1 py-[18px] text-body-1 font-semibold text-white"
								>
									바로 세탁 방법 볼래요
								</Link>
							</footer>
						</section>
					</div>
				)}
			</div>
		</div>
	);
}
