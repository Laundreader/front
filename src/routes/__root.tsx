import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import TanStackQueryLayout from "@/integrations/tanstack-query/layout.tsx";

import type { QueryClient } from "@tanstack/react-query";

interface MyRouterContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	component: () => (
		<>
			<div className="relative mx-auto h-full min-h-dvh w-full max-w-[393px]">
				<Outlet />
			</div>
			<TanStackRouterDevtools />
			<TanStackQueryLayout />
		</>
	),
});
