import { createFileRoute, useNavigate } from "@tanstack/react-router";
import LaundreaderLogoIcon from "@/assets/icons/laundreader-logo.svg?react";
import SplashBgImg from "@/assets/images/splash-bg.avif";

export const Route = createFileRoute("/splash")({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();

	return (
		<div
			style={{ backgroundImage: `url(${SplashBgImg})` }}
			className="absolute inset-0 z-10 flex h-screen flex-col justify-between bg-cover bg-center p-4"
		>
			<div className="flex grow flex-col items-center justify-center gap-9">
				<LaundreaderLogoIcon />
				<p className="text-4xl font-extrabold text-white">Laundreader</p>
			</div>
			<button
				onClick={() => {
					sessionStorage.setItem("laundreader-splash-closed", "true");
					navigate({ to: "/", replace: true });
				}}
				className="h-14 w-full rounded-xl bg-light-blue text-subhead font-semibold text-navy"
			>
				안전한 세탁 시작하기
			</button>
		</div>
	);
}
