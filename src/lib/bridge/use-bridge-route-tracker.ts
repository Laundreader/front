import { useEffect } from "react";
import { useLocation } from "@tanstack/react-router";

export const useBridgeRouteTracker = () => {
	const location = useLocation();

	useEffect(() => {
		if (window.ReactNativeWebView) {
			const payload = {
				pathname: location.pathname,
				search: location.search,
				hash: location.hash,
				title: document.title,
			};

			window.ReactNativeWebView.postMessage(
				JSON.stringify({ type: "ROUTE_CHANGE", payload }),
			);
		}
	}, [location.pathname, location.search, location.hash]);
};
