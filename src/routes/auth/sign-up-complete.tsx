import { createFileRoute, Link } from "@tanstack/react-router";
import ConfettiIcon from "@/assets/icons/confetti.svg?react";
import CheckIcon from "@/assets/icons/check.svg?react";

export const Route = createFileRoute("/auth/sign-up-complete")({
	component: RouteComponent,
});

function RouteComponent() {
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
					to="/"
					replace
					className="flex h-14 w-full items-center justify-center rounded-[10px] bg-main-blue-1 text-subhead font-medium text-white transition-colors hover:bg-main-blue-2 active:bg-main-blue-3"
				>
					확인했어요
				</Link>
			</footer>
		</div>
	);
}
