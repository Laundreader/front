/// <reference types="vite-plugin-svgr/client" />

declare global {
	interface Window {
		ReactNativeWebView?: {
			postMessage: (message: string) => void;
		};
	}
}
