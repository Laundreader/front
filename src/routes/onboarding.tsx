import { Fragment, useState } from "react";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import Onborading1Img from "@/assets/images/onboarding-1.avif";
import Onborading2Img from "@/assets/images/onboarding-2.avif";
import Onborading3Img from "@/assets/images/onboarding-3.avif";
import Onborading4Img from "@/assets/images/onboarding-4.avif";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding")({
	beforeLoad: () => {
		if (localStorage.getItem("laundreader-onboarding-closed") === "true") {
			throw redirect({ to: "/" });
		}
	},
	component: RouteComponent,
});

const ONBOARDING_CONTENTS = [
	{
		heading: ["케어라벨과 옷 촬영으로", "간편하게 세탁 방법 확인"],
		body: [
			"잘 모르는 옷 세탁 방법,",
			"옷과 라벨을 찍거나 입력하면",
			"AI가 분석해서 맞춤 세탁법 알려드려요.",
		],
		img: Onborading1Img,
	},
	{
		heading: ["같이 세탁해도 되는 옷끼리", "분류해서 세탁 솔루션 제공"],
		body: [
			"세탁할 옷들을 고르면,",
			"함께 돌릴 수 있는 옷끼리 모아주고",
			"안전한 세탁 방법까지 제안해드려요.",
		],
		img: Onborading2Img,
	},
	{
		heading: ["세탁이나 관리법이 헷갈릴 땐,", "실시간 세탁 도우미 AI 챗봇"],
		body: [
			"옷에 문제가 생겼거나",
			"세탁 메뉴얼을 봐도 헷갈릴 땐,",
			"‘버블리’가 궁금증을 빠르게 해결해드려요.",
		],
		img: Onborading3Img,
	},
	{
		heading: ["번거로운 검색없이 살펴보는", "세탁 관련 지식 백과"],
		body: [
			"어려운 케어라벨 기호부터",
			"소재별 세탁 방법까지,",
			"찾기 쉽게 세탁 지식을 한곳에 모았어요.",
		],
		img: Onborading4Img,
	},
];
const TOTAL_STEP_CNT = 4;

function RouteComponent() {
	const [step, setStep] = useState(0);
	const navigate = useNavigate();

	function handleClickNext() {
		if (step < TOTAL_STEP_CNT - 1) {
			setStep((prev) => prev + 1);
		} else {
			finishOnboarding();
		}
	}

	function finishOnboarding() {
		localStorage.setItem("laundreader-onboarding-closed", "true");
		navigate({ to: "/", replace: true });
	}

	return (
		<div className="absolute inset-0 z-10 flex h-screen flex-col justify-between bg-white p-4">
			<div>
				<button
					role="navigation"
					onClick={finishOnboarding}
					className="ml-auto block text-body-1 font-medium text-dark-gray-2"
				>
					건너뛰기
				</button>
			</div>

			<h2 className="text-center text-onboarding-heading text-dark-gray-1">
				{ONBOARDING_CONTENTS[step].heading.map((line, i, lines) => (
					<Fragment key={i}>
						{line}
						{i < lines.length - 1 && <br />}
					</Fragment>
				))}
			</h2>

			<p className="text-center text-onboarding-contents text-dark-gray-2">
				{ONBOARDING_CONTENTS[step].body.map((line, i, lines) => (
					<Fragment key={i}>
						{line}
						{i < lines.length - 1 && <br />}
					</Fragment>
				))}
			</p>

			<div className="-mx-4">
				<img src={ONBOARDING_CONTENTS[step].img} alt="" role="presentation" />
			</div>

			<Stepper total={TOTAL_STEP_CNT} current={step} />

			<button
				onClick={handleClickNext}
				className="h-14 w-full rounded-[10px] bg-main-blue-1 text-subhead font-medium text-white"
			>
				다음
			</button>
		</div>
	);
}

const Stepper = ({
	total,
	current,
	className,
}: {
	total: number;
	current: number;
	className?: string;
}) => {
	return (
		<div className={cn("flex items-center justify-center gap-2", className)}>
			{Array.from({ length: total }).map((_, idx) => (
				<div
					key={idx}
					className={cn(
						"size-2.5 rounded-full",
						idx === current ? "bg-main-blue-1" : "bg-gray-2",
					)}
				></div>
			))}
		</div>
	);
};
