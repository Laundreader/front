import {
	Link,
	Navigate,
	createFileRoute,
	useBlocker,
} from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import AnalysingBgImg from "@/assets/images/analysing-bg.png";
import CloseIcon from "@/assets/icons/close.svg?react";
import { Loader } from "@/components/loader";
import {
	HamperSolutionQueryOptions,
	laundrySolutionQueryOptions,
} from "@/features/laundry/api";
import { QUZZES } from "@/shared/constant";
import { useTempLaundry } from "@/entities/laundry/store/temp";
import { laundryIdsSearchSchema } from "./-schema";
import { overlay } from "overlay-kit";
import { ConfirmDialog } from "@/components/confirm-dialog";
import BubblySadImg from "@/assets/images/bubbly-sad.png";
import { useEffect, useMemo, useRef, useState } from "react";
import type { LaundrySolutionRequest } from "@/entities/laundry/model";

export const Route = createFileRoute("/analysing")({
	validateSearch: laundryIdsSearchSchema,
	errorComponent: () => <Navigate to="/laundry-basket" replace />,
	component: RouteComponent,
});

function RouteComponent() {
	console.log("분석중 페이지");
	const { laundryIds } = Route.useSearch();
	const tempLaundry = useTempLaundry();
	console.log("세탁물 상태", tempLaundry.state);

	if (laundryIds.length === 0 && tempLaundry.state === null) {
		return <Navigate to="/label-analysis" replace />;
	}

	const isSingle = tempLaundry.state !== null;

	let laundry: LaundrySolutionRequest["laundry"] | null = null;
	if (tempLaundry.state) {
		const { image, ...rest } = tempLaundry.state;
		laundry = rest;
	}

	console.log("이미지 제외한 세탁물", laundry);

	const queryClient = useQueryClient();
	const singleQuery = useQuery({
		...laundrySolutionQueryOptions({ laundry: laundry! }),
		enabled: isSingle && laundry !== null,
	});
	const basketQuery = useQuery({
		...HamperSolutionQueryOptions(laundryIds),
		enabled: isSingle === false,
	});

	const isError = singleQuery.isError || basketQuery.isError;
	const isSuccess = singleQuery.isSuccess || basketQuery.isSuccess;

	// 30초 카운트다운 (반복)
	const [seconds, setSeconds] = useState(30);
	useEffect(() => {
		const id = window.setInterval(() => {
			setSeconds((s) => (s <= 1 ? 30 : s - 1));
		}, 1000);
		return () => window.clearInterval(id);
	}, []);

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
		return () => {
			if (advanceTimerRef.current) {
				window.clearTimeout(advanceTimerRef.current);
			}
		};
	}, []);

	useBlocker({
		shouldBlockFn: async ({ next }) => {
			if (next.fullPath !== "/laundry-basket") {
				return true;
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
				{ overlayId: "leave-confirm-dialog" },
			);

			if (shouldBlock) {
				return true;
			}

			tempLaundry.clear();
			queryClient.cancelQueries({
				queryKey: [isSingle ? "laundry-solution" : "hamper-solution"],
				exact: true,
			});

			return false;
		},
		withResolver: true,
	});

	if (isError) {
		return <Navigate to="/analysis-failed" replace />;
	}

	if (isSuccess) {
		overlay.unmount("leave-confirm-dialog");

		if (isSingle) {
			return <Navigate to="/laundry-solution" replace />;
		} else {
			return (
				<Navigate
					to="/laundry-basket-analysis-result"
					search={{ laundryIds }}
					replace
				/>
			);
		}
	}

	return (
		<div
			className={`min-h-dvh bg-cover bg-center bg-no-repeat`}
			style={{ backgroundImage: `url(${AnalysingBgImg})` }}
		>
			<div className="absolute inset-0 flex flex-col justify-between px-[16px] pt-[54px] pb-[106px]">
				<div>
					<header className="mb-[24px]">
						<Link to="/laundry-basket" className="ml-auto block w-fit">
							<CloseIcon />
							<span className="sr-only">빨래바구니로 돌아가기</span>
						</Link>
					</header>
					<div className="mb-[42px] text-center text-title-1 font-semibold text-black-2">
						<p>모든 정보를 확인했어요!</p>
						<p>지금부터 알려주신 내용으로</p>
						<p>맞춤형 세탁법을 알려드릴게요</p>
					</div>

					<div className="flex flex-col items-center gap-4">
						<Loader />
						{/* 30초 카운트다운 */}
						<div className="rounded-full bg-white/80 px-4 py-1 text-sm font-semibold text-dark-gray-1 shadow">
							⏱ {String(Math.floor(seconds / 60)).padStart(2, "0")}:
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
									aria-label="정답 O"
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
									aria-label="오답 X"
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

				{/* <div>
					<span className="mb-[12px] block text-large-title font-semibold text-deep-blue">
						Tip!
					</span>
					<p className="text-title-2 font-semibold text-dark-gray-1">
						{randomTip}
					</p>
				</div> */}
			</div>
		</div>
	);
}
