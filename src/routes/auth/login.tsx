import {
	createFileRoute,
	Link,
	redirect,
	useRouter,
} from "@tanstack/react-router";
import ChevronLeftIcon from "@/assets/icons/chevron-left.svg?react";
import LaundreaderLogoIcon from "@/assets/icons/laundreader-logo.svg?react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/tooltip";
import { NaverLoginButton } from "@/entities/auth/ui/naver-login-button";
import { redirectStorage } from "@/shared/lib/redirect-storage";
import { authStore } from "@/entities/auth/store";

export const Route = createFileRoute("/auth/login")({
	beforeLoad: () => {
		if (authStore.get().isAuthenticated) {
			throw redirect({ to: "/" });
		}
	},
	validateSearch: (search: Record<string, unknown>): { redirect: string } => {
		return { redirect: String(search.redirect) ?? "/" };
	},
	component: RouteComponent,
});

function RouteComponent() {
	const router = useRouter();
	const search = Route.useSearch();

	return (
		<div className="flex flex-col items-center px-4 py-6">
			<header className="w-full">
				<Link
					to=".."
					className="mr-auto block size-6"
					onClick={(e) => {
						e.preventDefault();
						router.history.back();
						return false;
					}}
				>
					<ChevronLeftIcon />
					<span className="sr-only">뒤로 가기</span>
				</Link>
			</header>

			<LaundreaderLogoIcon className="mt-11 text-main-blue-1" />

			<p className="mt-6 text-4xl font-extrabold text-main-blue-1">
				Laundreader
			</p>

			<p className="mt-6 text-center text-title-3 font-semibold text-dark-gray-2">
				런드리더에서 세탁 방법과
				<br />
				의류 관리 방법을 쉽게 알려드려요!
			</p>

			<Tooltip>
				<TooltipContent className="rounded-sm bg-main-skyblue fill-main-skyblue px-2 py-1">
					<p className="text-caption font-semibold text-main-blue-1">
						3초 만에 시작하기
					</p>
				</TooltipContent>
				<TooltipTrigger>
					<NaverLoginButton
						onClick={() => {
							redirectStorage.set(search.redirect);
						}}
						className="mt-23"
					/>
				</TooltipTrigger>
			</Tooltip>
		</div>
	);
}
