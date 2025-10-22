import { useEffect } from "react";
import {
	createFileRoute,
	Link,
	redirect,
	useNavigate,
} from "@tanstack/react-router";
import LaundreaderLogoIcon from "@/assets/icons/laundreader-logo.svg?react";
import SplashBgImg from "@/assets/images/splash-bg.avif";
import { NaverLoginButton } from "@/entities/auth/ui/naver-login-button";
import { redirectStorage } from "@/shared/lib/redirect-storage";
import { useAuth } from "@/features/auth/use-auth";

export const Route = createFileRoute("/splash")({
	beforeLoad: () => {
		if (sessionStorage.getItem("laundreader-splash-closed") === "true") {
			throw redirect({ to: "/" });
		}
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { auth } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		let timer: number;

		if (auth.isAuthenticated) {
			timer = window.setTimeout(() => {
				navigate({ to: "/", replace: true });
			}, 2000);
		}

		return () => {
			if (timer) {
				window.clearTimeout(timer);
			}
		};
	}, []);

	useEffect(() => {
		return () => {
			sessionStorage.setItem("laundreader-splash-closed", "true");
		};
	}, []);

	return (
		<div
			style={{ backgroundImage: `url(${SplashBgImg})` }}
			className="absolute inset-0 z-10 flex h-screen flex-col items-stretch justify-center bg-cover bg-center p-4"
		>
			<div className="flex flex-col items-center">
				<div className="flex grow flex-col items-center justify-center gap-9">
					<LaundreaderLogoIcon className="text-white" />
					<p className="text-4xl font-extrabold text-white">Laundreader</p>
				</div>

				{auth.isAuthenticated === false && (
					<>
						<NaverLoginButton
							onClick={() => {
								redirectStorage.set("/");
							}}
							className="mt-20"
						/>
						<Link
							to="/"
							replace
							className="mt-4 text-body-1 font-semibold text-white"
						>
							로그인 없이 사용해보기
						</Link>
					</>
				)}
			</div>
		</div>
	);
}
