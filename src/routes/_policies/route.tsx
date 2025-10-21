import {
	createFileRoute,
	Outlet,
	useRouterState,
} from "@tanstack/react-router";
import { POLICY } from "./-constants";
import { Policy } from "./-ui";

export const Route = createFileRoute("/_policies")({
	component: RouteComponent,
});

const policyTitle: Record<string, string> = {
	"/consent-form": POLICY.consentForm.title,
	"/privacy-policy": POLICY.privacyPolicy.title,
	"/terms-of-service": POLICY.termsOfService.title,
};

function RouteComponent() {
	const destPathname = useRouterState({
		select: (state) => state.location.pathname,
	});
	const title = policyTitle[destPathname];

	return (
		<div className="flex min-h-dvh flex-col items-stretch overflow-x-hidden">
			<Policy.Header title={title} />
			<main className="flex grow flex-col gap-4 px-4 pt-8 pb-15">
				<Outlet />
			</main>
		</div>
	);
}
