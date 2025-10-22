import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_user")({
	component: RouteComponent,
});

function RouteComponent() {
	return <Outlet />;
}
