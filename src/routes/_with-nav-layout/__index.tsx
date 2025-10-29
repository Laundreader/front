import { Fragment } from "react";
import { Link, createFileRoute, redirect } from "@tanstack/react-router";
import ChevronRightIcon from "@/assets/icons/chevron-right.svg?react";
import MainBgImg from "@/assets/images/main-bg.avif";
import BubblyFrontImg from "@/assets/images/bubbly-front.avif";
import LabelGradientIcon from "@/assets/icons/label-gradient.svg?react";
import CareSymbolGradientIcon from "@/assets/icons/care-symbol-gradient.svg?react";
import HamperGradientIcon from "@/assets/icons/hamper-gradient.svg?react";
import ArrowRightIcon from "@/assets/icons/arrow-right.svg?react";
import ChatBotBalloonIcon from "@/assets/icons/chat-bot-balloon.svg?react";
import {
	queryOptions,
	skipToken,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import {
	getLaundryAdvice,
	getWeather,
	type Weather,
} from "@/entities/weather/api";
import {
	useGeoPosition,
	type GeoPos,
} from "@/shared/utils/hooks/use-geo-position";
import { useQueryEffect } from "@/shared/utils/hooks/use-query-effect";

import type { ComponentProps } from "react";
import type { LinkComponentProps } from "@tanstack/react-router";
import { ProfileButton } from "@/entities/user/ui/profile-button";
// import { useAuth } from "@/features/auth/auth-provider";
import { laundryApi, laundryApiLocal } from "@/entities/laundry/api";
import { useAuth } from "@/features/auth/use-auth";

export const Route = createFileRoute("/_with-nav-layout/")({
	beforeLoad: () => {
		const shouldShowSplash =
			Boolean(sessionStorage.getItem("laundreader-splash-closed")) === false;
		if (shouldShowSplash) {
			throw redirect({
				to: "/splash",
				replace: true,
			});
		}

		const shouldShowOnboarding =
			Boolean(localStorage.getItem("laundreader-onboarding-closed")) === false;
		if (shouldShowOnboarding) {
			throw redirect({
				to: "/onboarding",
				replace: true,
			});
		}
	},
	component: App,
});

function App() {
	const { auth } = useAuth();
	const geoPos = useGeoPosition();
	const queryClient = useQueryClient();

	const weatherQueryOptions = (position: GeoPos | null) => {
		return queryOptions({
			queryKey: ["weather", truncPos(position)],
			queryFn: position ? () => getWeather(position) : skipToken,
			staleTime: 1 * 60 * 60 * 1000,
			gcTime: 1 * 60 * 60 * 1000,
			placeholderData: queryClient.getQueryData<Weather>([
				"weather",
				truncPos(position),
			]),
		});
	};

	const laundryAdviceQueryOptions = (position: GeoPos | null) => {
		return queryOptions({
			queryKey: ["laundry-advice", truncPos(position)],
			queryFn: position ? () => getLaundryAdvice(position) : skipToken,
			staleTime: 1 * 60 * 60 * 1000,
			gcTime: 1 * 60 * 60 * 1000,
			placeholderData: queryClient.getQueryData<{ message: string }>([
				"laundry-advice",
				truncPos(position),
			]),
		});
	};
	const weatherQuery = useQuery(weatherQueryOptions(geoPos.data));
	useQueryEffect(weatherQuery, {
		onSuccess: (data) => {
			queryClient.setQueryData(["weather", null], data);
		},
	});

	const laundryAdviceQuery = useQuery(laundryAdviceQueryOptions(geoPos.data));
	useQueryEffect(laundryAdviceQuery, {
		onSuccess: (data) => {
			queryClient.setQueryData(["laundry-advice", null], data);
		},
	});

	const hamperQuery = useQuery({
		queryKey: ["hamper"],
		queryFn: auth.isAuthenticated
			? laundryApi.getLaundriesAll
			: laundryApiLocal.getLaundriesAll,
	});

	const isPermissionDenied = geoPos.error === "PERMISSION_DENIED";

	return (
		<div
			style={{ backgroundImage: `url(${MainBgImg})` }}
			className="grid min-h-screen grid-rows-[auto_1fr] bg-cover bg-top bg-no-repeat"
		>
			{/*
				MARK: 날씨 
			*/}
			<header className="flex justify-between p-4">
				<div className="flex w-fit items-center gap-2 rounded-xl bg-white/30 px-3 py-1 text-body-2 font-semibold text-deep-blue">
					{isPermissionDenied &&
						weatherQuery.data === undefined &&
						"위치 권한을 허용해주세요."}
					{weatherQuery.isLoading && "날씨를 알아보고 있어요..."}
					{weatherQuery.isError && "날씨를 알 수 없어요."}
					{weatherQuery.data && (
						<>
							<div className="size-6">
								<img
									src={`https://openweathermap.org/img/wn/${weatherQuery.data.weather.icon}@2x.png`}
								/>
							</div>
							<p>{weatherQuery.data.weather.description}</p>
							<p>{Math.trunc(weatherQuery.data.temp)}°C</p>
							<p>습도 {weatherQuery.data.humidity}%</p>
						</>
					)}
				</div>

				<ProfileButton />
			</header>

			<div className="grid min-h-0 grid-rows-[0.5fr_1fr] gap-4 px-4">
				{/*
					MARK: 버블리 
				*/}
				<section className="flex flex-col items-center justify-end gap-8">
					<div
						className={cn(
							"rounded-xl bg-gradient-to-b from-white/40 to-white/0 p-px shadow-[0_4px_20px_rgba(24,16,67,0.1)]",
							"after:absolute after:left-1/2 after:size-0 after:-translate-x-1/2 after:border-x-7 after:border-y-13 after:border-transparent after:border-t-white",
						)}
					>
						<p className="rounded-xl bg-gradient-to-b from-white/60 from-0% via-white/80 via-70% to-white to-100% px-4 py-3 text-body-1 font-medium break-keep text-deep-blue">
							{isPermissionDenied &&
								laundryAdviceQuery.data === undefined &&
								"위치를 몰라 날씨를 알 수가 없어요..."}
							{laundryAdviceQuery.isLoading && "여기 날씨를 보니까..."}
							{laundryAdviceQuery.isError && "할 말을 떠올리지 못했어요..."}
							{laundryAdviceQuery.data && laundryAdviceQuery.data.message}
						</p>
					</div>

					<div className="size-40 animate-bubble overflow-hidden rounded-full shadow-[0_3.33px_33.33px_rgba(52,55,141,0.2)]">
						<img src={BubblyFrontImg} alt="버블리 캐릭터" />
					</div>
				</section>

				{/*
					MARK: 내비게이션 블록
				*/}
				<nav className="min-h-0 self-end pb-26">
					<ul className="grid grid-cols-4 grid-rows-[auto_auto_auto] gap-4">
						<li className="col-span-full">
							<NavBlock
								to="/label-analysis"
								className="flex items-center gap-3"
							>
								<div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-navy">
									<LabelGradientIcon />
								</div>
								<div>
									<Title content="딱 맞는 세탁 방법 확인하기" />
									<Description
										contents={[
											"어떻게 세탁해야 할지 모르겠다면?",
											"지금 바로 올바른 세탁법 알아보세요!",
										]}
									/>
								</div>
								<div className="ml-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-[#5D9DFF] to-[#B67AFF]">
									<ArrowRightIcon className="text-white" />
								</div>
							</NavBlock>
						</li>
						<li className="col-span-full">
							<NavBlock to="/chat" className="flex items-center gap-3">
								<div className="size-8 shrink-0">
									<ChatBotBalloonIcon />
								</div>
								<div>
									<Title content="세탁하다가 궁금한 게 있으신가요?" />
									<Description
										contents={["세탁도우미 챗봇 버블리에게 언제든지 물어봐요"]}
									/>
								</div>
								<ChevronRightIcon className="ml-auto shrink-0 text-white" />
							</NavBlock>
						</li>
						<li className="col-span-2">
							<NavBlock to="/laundry-basket">
								<div className="mb-2 flex items-center gap-2">
									<div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-navy">
										<HamperGradientIcon />
									</div>
									<span className="text-title-3 font-semibold text-main-blue-1">
										{hamperQuery.data?.length}개
									</span>
								</div>
								<div className="flex items-center justify-between">
									<Title content="빨래바구니" />
									<div className="w-4 overflow-hidden">
										<ChevronRightIcon className="shrink-0 text-white" />
									</div>
								</div>
								<Description
									contents={["한번에 세탁하기 전,", "문제 없나 확인해요!"]}
								/>
							</NavBlock>
						</li>
						<li className="col-span-2 justify-self-stretch">
							<NavBlock to="/wiki" className="flex flex-col">
								<div className="mb-2 flex size-8 shrink-0 items-center justify-center rounded-lg bg-navy">
									<CareSymbolGradientIcon />
								</div>
								<div className="flex items-center justify-between">
									<Title content="세탁백과" />
									<div className="w-4 overflow-hidden">
										<ChevronRightIcon className="text-white" />
									</div>
								</div>
								<Description
									contents={["라벨 속 기호나 소재별로 세탁법이 궁금하다면?"]}
								/>
							</NavBlock>
						</li>
					</ul>
				</nav>
			</div>
		</div>
	);
}

const NavBlock = ({
	to,
	children,
	className,
	...props
}: LinkComponentProps) => {
	return (
		<div className="h-full rounded-2xl bg-gradient-to-b from-white/40 to-white/10 p-px shadow-[0_0_16px_rgba(24,16,67,0.25)]">
			<Link
				to={to}
				className={cn(
					"block h-full rounded-2xl bg-gradient-to-b from-white/60 to-white/50 p-4",
					className,
				)}
				{...props}
			>
				{children}
			</Link>
		</div>
	);
};

const Title = ({
	content,
	...props
}: ComponentProps<"h3"> & { content: string }) => {
	return (
		<h3 className="text-subhead font-semibold break-keep text-navy" {...props}>
			{content}
		</h3>
	);
};

const Description = ({
	contents,
	...props
}: ComponentProps<"p"> & { contents: Array<string> }) => {
	return (
		<p
			className="text-body-2 font-medium break-keep text-dark-gray-2"
			{...props}
		>
			{contents.map((line, i) => (
				<Fragment key={i}>
					<span>{line}</span>
					{i < contents.length - 1 && <br />}
				</Fragment>
			))}
		</p>
	);
};

function truncPos(position: GeoPos | null) {
	if (position === null) {
		return position;
	}

	return {
		lat: position.lat.toFixed(6),
		lon: position.lon.toFixed(6),
	};
}
