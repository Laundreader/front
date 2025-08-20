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
import AnalysingBgImg from "@/assets/images/analysing-bg.png";
import CloseIcon from "@/assets/icons/close.svg?react";
import { QUZZES } from "@/shared/constant";
import BubblySadImg from "@/assets/images/bubbly-sad.png";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useQueryEffects } from "@/shared/utils/hook";
import AnalysisFailedBgImg from "@/assets/images/analysis-failed-bg.png";
import { ImgAnalysisStepEnum, imgAnalysisStepSearchSchema } from "./-schema";
import LabelCaptureGuideImg from "@/assets/images/label-capture-guide.png";
import ClothesCaptureGuideImg from "@/assets/images/clothes-capture-guide.png";
import PlusCircleIcon from "@/assets/icons/plus-circle.svg?react";

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
	console.log("라벨 분석 이미지 업로드 페이지");
	const tempLaundry = useTempLaundry();
	const navigate = useNavigate({ from: Route.fullPath });
	const laundry = tempLaundry.state;
	console.log("laundry", laundry);
	const { step } = Route.useSearch();

	const [imageStatus, setImageStatus] = useState<{
		label: ImageSlot;
		clothes: ImageSlot;
	}>({
		label: { image: null, isValid: false, didFail: false },
		clothes: { image: null, isValid: false, didFail: false },
	});
	const [shouldValidate, setShouldValidate] = useState(false);

	console.log(imageStatus);

	// const [step, setStep] = useState<
	// 	"label" | "clothes" | "analysis" | "analysing" | "error"
	// >("label");

	// MARK: 이미지 업로드 처리
	async function handleImageUpload(
		event: React.ChangeEvent<HTMLInputElement>,
		type: "label" | "clothes",
	) {
		console.log("이미치 처리 햰들러");
		const imageFile = event.target.files?.[0];
		console.log("이미지 파일:", imageFile);
		if (imageFile === undefined) {
			return;
		}

		const { format, imageDataUrl } = await processImage(imageFile, type);
		console.log("이미지 처리 완료:", format);

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
			navigate({ search: { step: ImgAnalysisStepEnum.enum.clothes } });
			return;
		}

		if (type === "label" && imageStatus.clothes.isValid) {
			navigate({ search: { step: ImgAnalysisStepEnum.enum.analysing } });
			setShouldValidate(true);
			return;
		}

		if (type === "clothes") {
			navigate({ search: { step: ImgAnalysisStepEnum.enum.analysing } });
			setShouldValidate(true);
		}
	}

	useEffect(() => {
		if (shouldValidate === false) {
			return;
		}

		(async () => {
			const isValid = await validateImages();
			if (isValid.label === false) {
				navigate({ search: { step: ImgAnalysisStepEnum.enum.label } });
				// setStep("label");
			} else if (isValid.clothes === false) {
				navigate({ search: { step: ImgAnalysisStepEnum.enum.clothes } });
				// setStep("clothes");
			} else if (isValid.label && isValid.clothes) {
				navigate({ search: { step: ImgAnalysisStepEnum.enum.analysing } });
				// setStep("analysing");
			}
			setShouldValidate(false);
		})();
	}, [shouldValidate]);

	console.log("STAGE", step);

	// MARK: 이미지 처리
	async function processImage(
		imageFile: File,
		type: "label" | "clothes",
	): Promise<{ format: "jpeg"; imageDataUrl: string; imageBase64: string }> {
		const options: Options = {
			maxSizeMB: type === "label" ? 2 : 0.5,
			maxWidthOrHeight: 2240,
			useWebWorker: true,
			fileType: "image/jpeg",
		};

		const compressedFile = await imageCompression(imageFile, options);
		console.log(`압축 결과 ${compressedFile.size / 1024 / 1024} MB`);
		console.log("imageFile type:", compressedFile.type);

		const imageDataUrl =
			await imageCompression.getDataUrlFromFile(compressedFile);
		const imageBase64 = imageDataUrl.split(",")[1];

		return { format: "jpeg", imageDataUrl, imageBase64 };
	}

	// MARK: 이미지 유효성 검사
	async function validateImages(): Promise<{
		label: boolean;
		clothes: boolean;
	}> {
		const labelStatus = imageStatus.label;
		const clothesStatus = imageStatus.clothes;
		console.log("Validating images...");
		console.log(labelStatus, clothesStatus);
		const labelPromise =
			labelStatus.image === null
				? Promise.resolve(false)
				: labelStatus.isValid
					? Promise.resolve(true)
					: validateImage({
							type: "label",
							image: {
								format: "jpeg",
								data: labelStatus.image.data,
							},
						});
		const clothesPromise =
			clothesStatus.image === null || clothesStatus.isValid
				? Promise.resolve(true)
				: validateImage({
						type: "clothes",
						image: {
							format: "jpeg",
							data: clothesStatus.image.data,
						},
					});

		const [labelResult, clothesResult] = await Promise.allSettled([
			labelPromise,
			clothesPromise,
		]);
		const isLabelValid =
			labelResult.status === "fulfilled" ? labelResult.value : false;
		const isClothesValid =
			clothesResult.status === "fulfilled" ? clothesResult.value : false;

		console.log("Label validation result:", isLabelValid);
		console.log("Clothes validation result:", isClothesValid);

		setImageStatus((prev) => ({
			...prev,
			label: {
				image: isLabelValid ? prev.label.image : null,
				isValid: isLabelValid,
				didFail:
					prev.label.didFail ||
					(isLabelValid === false && prev.label.didFail === false),
			},
			clothes: {
				image: isClothesValid ? prev.clothes.image : null,
				isValid: isClothesValid,
				didFail:
					prev.clothes.didFail ||
					(isClothesValid === false && prev.clothes.didFail === false),
			},
		}));

		return { label: isLabelValid, clothes: isClothesValid };
	}

	// MARK: 30초 퀴즈
	// 30초 카운트다운 (반복)
	const [seconds, setSeconds] = useState(30);

	useEffect(() => {
		if (step !== "analysing") {
			return;
		}

		const id = window.setInterval(() => {
			setSeconds((s) => (s <= 1 ? 30 : s - 1));
		}, 1000);

		return () => {
			window.clearInterval(id);
		};
	}, [step]);

	// OX 퀴즈: 무작위 순서로 출제, 정답 클릭 시 결과/해설 표기 후 3초 뒤 다음 문제
	const shuffledQuizzes = useMemo(() => {
		const arr = [...QUZZES];
		for (let i = arr.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[arr[i], arr[j]] = [arr[j], arr[i]];
		}
		return arr;
	}, []);

	const [quizIndex, setQuizIndex] = useState(0);
	const [selected, setSelected] = useState<null | boolean>(null);
	const advanceTimerRef = useRef<number | null>(null);
	const currentQuiz = shuffledQuizzes[quizIndex % shuffledQuizzes.length];

	const onAnswer = (choice: boolean) => {
		if (selected !== null) return; // 중복 클릭 방지
		setSelected(choice);
		// 3초 뒤 다음 문제로 이동
		advanceTimerRef.current = window.setTimeout(() => {
			setQuizIndex((i) => i + 1);
			setSelected(null);
		}, 3000);
	};

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

	// MARK: 분석 요청 쿼리
	const randomSessionIdQueryKeyRef = useRef(crypto.randomUUID());
	const randomSessionIdQueryKey = randomSessionIdQueryKeyRef.current;
	const analysisQuery = useQuery({
		queryKey: [randomSessionIdQueryKey],
		queryFn: () =>
			createLaundryAnalysis({
				label: { format: "jpeg", data: imageStatus.label.image!.data },
				clothes:
					imageStatus.clothes.image === null
						? undefined
						: {
								format: "jpeg",
								data: imageStatus.clothes.image.data,
							},
			}),
		enabled: step === "analysing",
	});

	useQueryEffects(analysisQuery, {
		onSuccess: (data) => {
			// const laundrySymbols: Array<LaundrySymbol> = data.laundry.laundrySymbols
			// 	? Object.values(data.laundry.laundrySymbols).flat()
			// 	: [];

			tempLaundry.set({
				...data.laundry,
				// laundrySymbols,
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
			// setStep("analysis");
		},
		onError: () => {
			navigate({ search: { step: ImgAnalysisStepEnum.enum.error } });
			// setStep("error");
		},
	});

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
			return shouldBlock;
		},
	});

	// MARK: 마크업
	return (
		<div className="flex min-h-dvh flex-col justify-between bg-gray-3 px-[16px] pt-[54px] pb-[46px]">
			<div className="contents">
				{/* 
        MARK: 라벨 업로드 단계
        */}
				{step === "label" && (
					<>
						<header className="flex">
							<Link to="/" className="ml-auto">
								<CloseIcon />
							</Link>
						</header>
						<section className="flex grow flex-col items-center justify-between">
							<div>
								<h2 className="mb-[18px] text-center text-title-2 font-semibold text-black-2">
									케어라벨을 촬영해주세요
								</h2>
								<p className="text-center text-body-1 text-dark-gray-1">
									옷 안쪽에 세탁기호와 소재가 <br /> 적혀있는 라벨을
									촬영해주세요
								</p>
							</div>

							<div className="flex aspect-square h-auto w-full flex-col items-center justify-evenly rounded-3xl bg-white p-3">
								<div className="w-1/2">
									<img
										src={LabelCaptureGuideImg}
										alt="케어라벨 촬영 가이드"
										className="h-full w-full object-contain"
									/>
								</div>
								<p className="text-center text-subhead font-medium text-dark-gray-1">
									라벨이 화면 안에 들어오게 찍어주세요.
								</p>
								<label
									htmlFor="label-image-upload"
									className="flex cursor-pointer items-center justify-center gap-1 rounded-xl bg-light-blue px-5 py-4 text-body-1 font-semibold text-main-blue-2"
								>
									<PlusCircleIcon />
									케어라벨 추가
								</label>
								<input
									id="label-image-upload"
									type="file"
									accept="image/*"
									onChange={(e) => handleImageUpload(e, "label")}
									className="hidden"
								/>
							</div>

							<div>
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
					</>
				)}

				{/* 
        MARK: 의류 업로드 단계 
        */}
				{step === "clothes" && (
					<>
						<header className="flex">
							<Link to="/" className="ml-auto">
								<CloseIcon />
							</Link>
						</header>
						<section className="flex grow flex-col items-center justify-between">
							<div>
								<p className="mb-[18px] text-center text-title-2 font-semibold text-black-2">
									의류를 촬영해주세요
								</p>
								<p className="text-center text-body-1 text-dark-gray-1">
									더 정확한 분석을 위해 <br />
									전체 의류 사진을 촬영해주세요.
								</p>
							</div>

							<div className="flex aspect-square h-auto w-full flex-col items-center justify-evenly rounded-3xl bg-white p-3">
								<div className="w-1/2">
									<img
										src={ClothesCaptureGuideImg}
										alt="의류 촬영 가이드"
										className="h-full w-full object-contain"
									/>
								</div>
								<p className="text-center text-subhead font-medium text-dark-gray-1">
									옷이 화면 안에 들어오게 찍어주세요.
								</p>
								<label
									htmlFor="clothes-image-upload"
									className="flex cursor-pointer items-center justify-center gap-1 rounded-xl bg-light-blue px-5 py-4 text-body-1 font-semibold text-main-blue-2"
								>
									<PlusCircleIcon />
									의류 추가
								</label>
								<input
									id="clothes-image-upload"
									type="file"
									accept="image/*"
									onChange={(e) => handleImageUpload(e, "clothes")}
									className="hidden"
								/>
							</div>
							{/* <div className="flex flex-col items-center gap-[16px] rounded-[24px] bg-white p-[35px]">
								<div className="mb-[28px] flex justify-center gap-[16px]">
									<div className="flex flex-col items-center gap-[16px] rounded-[24px] bg-white p-[35px]">
										<label
											htmlFor="clothes-image-upload"
											className="flex cursor-pointer items-center justify-center rounded-xl bg-light-blue px-5 py-4 text-body-1 font-semibold text-main-blue-2"
										>
											의류 추가
										</label>
										<input
											id="clothes-image-upload"
											type="file"
											accept="image/*"
											onChange={(e) => handleImageUpload(e, "clothes")}
											className="hidden"
										/>
									</div>
								</div>
							</div> */}
							<button
								onClick={validateImages}
								className="flex w-full max-w-[360px] items-center justify-center gap-[4px] rounded-[12px] bg-main-blue-1 py-[18px] text-body-1 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
							>
								바로 결과보러 갈래요
							</button>
						</section>
					</>
				)}

				{/* 
        MARK: 분석 중 단계
        */}
				{step === "analysing" && (
					<div
						className="absolute inset-0 h-dvh bg-cover bg-center bg-no-repeat"
						style={{ backgroundImage: `url(${AnalysingBgImg})` }}
					>
						<div className="absolute inset-0 flex flex-col justify-between px-[16px] pt-[54px] pb-[106px]">
							<div>
								<header className="mb-[24px]">
									<button
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
												navigate({ to: "/" });
											}
										}}
										className="ml-auto block w-fit"
									>
										<CloseIcon />
									</button>
								</header>
								<div className="mb-[42px] text-center text-title-1 font-semibold text-black-2">
									<p>
										똑똑한 세탁법을 위해
										<br /> 라벨을 분석하고 있어요
									</p>
								</div>

								<div className="flex flex-col items-center gap-4">
									{/* 30초 카운트다운 */}
									<div className="rounded-full bg-white/80 px-4 py-1 text-sm font-semibold text-dark-gray-1 shadow">
										{String(Math.floor(seconds / 60)).padStart(2, "0")}:
										{String(seconds % 60).padStart(2, "0")}
									</div>

									{/* OX 퀴즈 */}
									<div className="w-full max-w-[560px] rounded-2xl bg-white/85 p-4 shadow">
										<div className="mb-3 text-sm font-semibold text-deep-blue">
											OX 퀴즈
										</div>
										<p className="mb-4 text-base font-semibold text-dark-gray-1">
											{currentQuiz.question}
										</p>

										<div className="mb-2 flex items-center justify-center gap-4">
											<button
												type="button"
												onClick={() => onAnswer(true)}
												disabled={selected !== null}
												className={`h-12 w-12 rounded-full border text-lg font-bold transition-all ${
													selected === true
														? currentQuiz.answer
															? "border-green-500 bg-green-100 text-green-700"
															: "border-red-500 bg-red-100 text-red-700"
														: "border-dark-gray-2 bg-white text-dark-gray-1 hover:bg-gray-50"
												}`}
												aria-label="정답"
											>
												O
											</button>
											<button
												type="button"
												onClick={() => onAnswer(false)}
												disabled={selected !== null}
												className={`h-12 w-12 rounded-full border text-lg font-bold transition-all ${
													selected === false
														? currentQuiz.answer === false
															? "border-green-500 bg-green-100 text-green-700"
															: "border-red-500 bg-red-100 text-red-700"
														: "border-dark-gray-2 bg-white text-dark-gray-1 hover:bg-gray-50"
												}`}
												aria-label="오답"
											>
												X
											</button>
										</div>

										{selected !== null && (
											<div
												className={`mt-2 rounded-md px-3 py-2 text-sm ${
													selected === currentQuiz.answer
														? "bg-green-50 text-green-700"
														: "bg-red-50 text-red-700"
												}`}
											>
												<div className="font-semibold">
													{selected === currentQuiz.answer
														? "맞았어요!"
														: "틀렸어요..."}
												</div>
												<div className="mt-1 text-dark-gray-1">
													{currentQuiz.reason}
												</div>
												<div className="mt-1 text-xs text-dark-gray-2">
													3초 뒤 다음 문제로 넘어가요
												</div>
											</div>
										)}
									</div>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* 
        MARK: 분석 실패 단계
        */}
				{step === "error" && (
					<>
						<img
							src={AnalysisFailedBgImg}
							role="presentation"
							className="object-center"
						/>

						<section
							className="absolute inset-0 flex h-dvh flex-col gap-6 bg-cover bg-center bg-no-repeat p-4 pt-13 pb-11"
							style={{ backgroundImage: `url(${AnalysisFailedBgImg})` }}
						>
							<header>
								<Link
									to="/laundry-basket"
									replace
									className="ml-auto block w-fit"
								>
									<CloseIcon />
									<span className="sr-only">빨래바구니로 돌아가기</span>
								</Link>
							</header>

							<div className="flex grow flex-col justify-between">
								<div className="text-center text-title-1 font-semibold text-black-2">
									<p>분석하다 잠깐 오류가 있었어요</p>
									<p>다시 시도해볼까요?</p>
								</div>

								<button
									onClick={() => {
										navigate({
											search: { step: ImgAnalysisStepEnum.enum.analysing },
										});
										// setStep("analysing");
									}}
									className="flex h-[56px] items-center justify-center rounded-[10px] bg-black-2 text-subhead font-medium text-white"
								>
									다시 분석해주세요
								</button>
							</div>
						</section>
					</>
				)}

				{/* 
        MARK: 분석결과 검수 단계
        */}
				{step === "analysis" && laundry !== null && (
					<>
						<header className="flex">
							<Link to="/" className="ml-auto">
								<CloseIcon />
							</Link>
						</header>
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
								<div className="mb-[28px] flex justify-center gap-[16px]">
									{laundry.image.label.data && (
										<img
											src={laundry.image.label.data}
											alt=""
											className="relative aspect-square size-[130px] cursor-pointer rounded-[16px] border border-gray-bluegray-2 bg-gray-3"
										/>
									)}
									{laundry.image.clothes?.data && (
										<img
											src={laundry.image.clothes.data}
											alt=""
											className="relative aspect-square size-[130px] cursor-pointer rounded-[16px] border border-gray-bluegray-2 bg-gray-3"
										/>
									)}
								</div>

								{/* 분석 정보 */}
								<div className="flex flex-col items-center">
									<p className="mb-[12px] text-center text-subhead font-semibold text-black-2">
										이 세탁물의 소재는
										<br /> {laundry.materials.join(", ")}이에요
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
						</section>

						<footer className="mt-10 flex justify-between gap-4">
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
					</>
				)}
			</div>
		</div>
	);
}
