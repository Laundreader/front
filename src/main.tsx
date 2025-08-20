import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { OverlayProvider } from "overlay-kit";
import { TempLaundryProvider } from "./entities/laundry/store/temp.tsx";
import * as TanStackQueryProvider from "./integrations/tanstack-query/root-provider.tsx";
// import reportWebVitals from "./reportWebVitals.ts";
import { routeTree } from "./routeTree.gen";
import "./styles.css";

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

// async function enableMocking() {
// 	if (import.meta.env.DEV === false) {
// 		return;
// 	}

// 	const { worker } = await import("./mocks/browser");

// 	return worker.start();
// }

// enableMocking().then(() => {
const rootElement = document.getElementById("app");
if (rootElement && !rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(
		<StrictMode>
			<TanStackQueryProvider.Provider {...TanStackQueryProviderContext}>
				<TempLaundryProvider>
					<OverlayProvider>
						<RouterProvider router={router} />
					</OverlayProvider>
				</TempLaundryProvider>
			</TanStackQueryProvider.Provider>
		</StrictMode>,
	);
}
// });

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
