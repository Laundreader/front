import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { OverlayProvider } from "overlay-kit";
import { LaundryDraftProvider } from "@/entities/laundry/store/draft";
import { AuthProvider } from "@/features/auth/auth-provider.tsx";
import * as TanStackQueryProvider from "@/integrations/tanstack-query/root-provider.tsx";
import { routeTree } from "./routeTree.gen";
import "./styles.css";
// import reportWebVitals from "./reportWebVitals.ts";

const TanStackQueryProviderContext = TanStackQueryProvider.getContext();
const router = createRouter({
	routeTree,
	context: {
		...TanStackQueryProviderContext,
	},
	defaultPreload: "intent",
	scrollRestoration: true,
	defaultStructuralSharing: true,
	defaultPreloadStaleTime: 0,
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

async function enableMocking() {
	if (import.meta.env.DEV === false) {
		return;
	}

	const { worker } = await import("./mocks/browser");

	return worker.start({ onUnhandledRequest: "bypass" });
}

enableMocking().then(() => {
	const rootElement = document.getElementById("app");
	if (rootElement && !rootElement.innerHTML) {
		const root = ReactDOM.createRoot(rootElement);
		root.render(
			<StrictMode>
				<AuthProvider>
					<TanStackQueryProvider.Provider {...TanStackQueryProviderContext}>
						<LaundryDraftProvider>
							<OverlayProvider>
								<RouterProvider router={router} />;
							</OverlayProvider>
						</LaundryDraftProvider>
					</TanStackQueryProvider.Provider>
				</AuthProvider>
			</StrictMode>,
		);
	}
});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
