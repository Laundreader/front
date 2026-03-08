// hooks/useReportRouteToNative.ts
import { useEffect } from "react";
import { useLocation } from "@tanstack/react-router";
import { useNativeBridge } from "./use-native-bridge"; // 이전 질문에서 만든 훅

export const useReportRouteToNative = () => {
	const { sendMessage } = useNativeBridge();
	const location = useLocation();

	useEffect(() => {
		// 경로가 변경될 때마다 네이티브로 메시지 전송
		sendMessage({
			type: "ROUTE_CHANGE",
			payload: {
				path: location.pathname,
				search: location.search,
				fullUrl: window.location.href,
			},
		});
	}, [location.pathname, location.search, sendMessage]);
};
