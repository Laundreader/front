import { Outlet, createFileRoute } from "@tanstack/react-router";
import { TabNavigation } from "@/components/tab-navigation";
import { useIsWebView } from "@/lib/bridge/use-is-web-view";

export const Route = createFileRoute("/_with-nav-layout")({
	component: RouteComponent,
});

function RouteComponent() {
	const isWebView = useIsWebView();

	return (
		<>
			<div className="scrollbar-hidden min-h-dvh">
				<Outlet />
			</div>

			{!isWebView && <TabNavigation className="fixed bottom-0" />}
		</>
	);
}
