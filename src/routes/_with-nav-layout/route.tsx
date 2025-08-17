import { Outlet, createFileRoute } from "@tanstack/react-router";
import { TabNavigation } from "@/components/tab-navigation";

export const Route = createFileRoute("/_with-nav-layout")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<>
			<div className="scrollbar-hidden h-full overflow-y-auto">
				<Outlet />
			</div>
			<TabNavigation className="fixed bottom-0" />
		</>
	);
}
