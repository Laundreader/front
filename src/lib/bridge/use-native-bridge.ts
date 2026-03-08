import { useCallback } from "react";

import type { WebToNativeMessage } from "./type";

// TypeScript 전역 객체 확장
declare global {
	interface Window {
		ReactNativeWebView?: {
			postMessage: (message: string) => void;
		};
	}
}

export function useNativeBridge() {
	const sendMessage = useCallback((message: WebToNativeMessage) => {
		if (window.ReactNativeWebView) {
			// 객체를 JSON 문자열로 변환하여 전송
			window.ReactNativeWebView.postMessage(JSON.stringify(message));
		} else {
			console.warn("Not in a WebView environment:", message);
		}
	}, []);

	return { sendMessage };
}
