import { useState, useEffect } from "react";

export function useIsWebView() {
	const [isWebView, setIsWebView] = useState(false);

	useEffect(() => {
		// 컴포넌트가 마운트된 후(클라이언트 사이드)에 확인
		if (typeof window !== "undefined" && window.ReactNativeWebView) {
			setIsWebView(true);
		}
	}, []);

	return isWebView;
}
