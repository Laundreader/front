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
			<div className="relative mx-auto h-[852px] max-w-[393px] bg-light-gray-1">
				<Outlet />
			</div>
			<TanStackRouterDevtools />
			<TanStackQueryLayout />
		</>
	),
});
