import { cn } from "@/lib/utils";
import { QUZZES } from "@/shared/constant";
import { Link } from "@tanstack/react-router";
import { shuffle } from "es-toolkit";
import { useState, useRef, useMemo, useEffect } from "react";
import BubbleBgImg from "@/assets/images/bubble-bg.avif";
import CloseIcon from "@/assets/icons/close.svg?react";
import BubblyFrontImg from "@/assets/images/bubbly-front.avif";
import SignOIcon from "@/assets/icons/sign-o.svg?react";
import SignXIcon from "@/assets/icons/sign-x.svg?react";

export const Quiz = () => {
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
		const id = setInterval(() => {
			setSeconds((second) => (second <= 1 ? 30 : second - 1));
		}, 1000);

		return () => {
			clearInterval(id);
		};
	}, []);

	// 컴포넌트 언마운트 시 타이머 정리
	useEffect(() => {
		return () => {
			if (advanceTimerRef.current) {
				window.clearTimeout(advanceTimerRef.current);
			}
		};
	}, []);

	return (
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
				<Link to="/label-analysis" replace className="ml-auto block w-fit">
					<CloseIcon />
					<span className="sr-only">분석 중단하고 나가기</span>
				</Link>
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
					<div className="size-50 animate-bubble">
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
										<span className="text-title-1">맞았어요!</span>
									</>
								) : (
									<>
										<SignXIcon className="size-9" />
										<span className="text-title-1">틀렸어요...</span>
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
	);
};
