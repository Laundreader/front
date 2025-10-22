import { useEffect, useRef } from "react";
import {
	createFileRoute,
	Link,
	Navigate,
	redirect,
} from "@tanstack/react-router";
import { authCallbackSearchSchema } from "@/entities/auth/model";
import { redirectStorage } from "@/shared/lib/redirect-storage";
import ConfettiIcon from "@/assets/icons/confetti.svg?react";
import CheckIcon from "@/assets/icons/check.svg?react";
import { useAuth } from "@/features/auth/use-auth";

export const Route = createFileRoute("/auth/callback")({
	validateSearch: authCallbackSearchSchema,
	// beforeLoad: () => {
	// 	if (authStore.get().isAuthenticated) {
	// 		throw redirect({ to: "/" });
	// 	}
	// },
	onError: () => {
		throw redirect({ to: "/" });
	},
	component: RouteComponent,
});

function RouteComponent() {
	const search = Route.useSearch();
	const auth = useAuth();
	const redirectRef = useRef<string>(redirectStorage.fallback);

	useEffect(() => {
		if (search.success) {
			auth.login().then(() => {
				redirectRef.current = redirectStorage.get();
				redirectStorage.clear();
			});
		}
	}, []);

	if (search.success === false) {
		return (
			<div>
				로그인에 실패했습니다: {search.message}(code: {search.code})
			</div>
		);
	}

	if (search.firstLogin) {
		return (
			<div className="grid min-h-dvh grid-rows-[1fr_auto] bg-white">
				<div className="self-center">
					<div className="relative w-full">
						<ConfettiIcon className="absolute -top-1/1 w-full" />
						<div className="flex flex-col items-center justify-center gap-12">
							<div className="flex size-25 items-center justify-center rounded-full bg-main-blue-1">
								<CheckIcon className="h-15 w-15 text-white" />
							</div>

							<p className="text-center text-onboarding-heading font-bold text-dark-gray-1">
								가입이 완료되었어요!
							</p>
						</div>
					</div>
				</div>

				<footer className="w-full self-end px-4 pb-8">
					<Link
						to={redirectRef.current}
						replace
						className="flex h-14 w-full items-center justify-center rounded-[10px] bg-main-blue-1 text-subhead font-medium text-white transition-colors hover:bg-main-blue-2 active:bg-main-blue-3"
					>
						확인했어요
					</Link>
				</footer>
			</div>
		);
	}

	return <Navigate to={redirectRef.current} replace />;
}
