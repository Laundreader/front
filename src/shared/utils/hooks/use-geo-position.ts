import { useEffect, useMemo, useRef, useState } from "react";

type GeoErrorCode = "PERMISSION_DENIED" | "POSITION_UNAVAILABLE" | "TIMEOUT";

type GeoResult = {
	isLoading: boolean;
	isError: boolean;
	error: GeoErrorCode | null;
	data: { lat: number; lon: number } | null;
};

const errorCodeMap: Record<number, GeoErrorCode> = {
	1: "PERMISSION_DENIED",
	2: "POSITION_UNAVAILABLE",
	3: "TIMEOUT",
};

export function useGeoPosition(options?: PositionOptions): GeoResult {
	const [state, setState] = useState<GeoResult>({
		isLoading: true,
		isError: false,
		error: null,
		data: null,
	});

	const resolvedOptions = useMemo<PositionOptions>(
		() => ({
			enableHighAccuracy: false,
			maximumAge: 3_000,
			timeout: 10_000,
			...(options ?? {}),
		}),
		[options?.enableHighAccuracy, options?.maximumAge, options?.timeout],
	);

	const mountedRef = useRef(true);

	useEffect(() => {
		mountedRef.current = true;

		return () => {
			mountedRef.current = false;
		};
	}, []);

	useEffect(() => {
		if (typeof window === "undefined" || "geolocation" in navigator === false) {
			setState({
				isLoading: false,
				isError: true,
				error: "POSITION_UNAVAILABLE",
				data: null,
			});

			return;
		}

		const tryOnce = () => {
			setState((prev) => ({
				...prev,
				isLoading: true,
				isError: false,
				error: null,
			}));
			navigator.geolocation.getCurrentPosition(
				(pos) => {
					if (mountedRef.current === false) {
						return;
					}

					setState({
						isLoading: false,
						isError: false,
						error: null,
						data: { lat: pos.coords.latitude, lon: pos.coords.longitude },
					});
				},
				(err) => {
					if (mountedRef.current === false) {
						return;
					}

					const errorCode = errorCodeMap[err.code] ?? "POSITION_UNAVAILABLE";

					setState({
						isLoading: false,
						isError: true,
						error: errorCode,
						data: null,
					});
				},
				resolvedOptions,
			);
		};

		// 처음 시도
		tryOnce();

		// 권한 변경을 감시하다가 허용하면 재시도
		let cleanup: (() => void) | undefined;
		const hasPermissionsAPI =
			typeof navigator.permissions?.query === "function";

		if (hasPermissionsAPI) {
			navigator.permissions
				.query({ name: "geolocation" })
				.then((status: PermissionStatus) => {
					const onChange = () => {
						if (mountedRef.current === false) {
							return;
						}

						if (status.state === "granted") {
							tryOnce();
						}
					};
					status.addEventListener("change", onChange);
					cleanup = () => status.removeEventListener("change", onChange);
				})
				.catch(() => {
					// 미지원이나 막힌 브라우저 무시
				});
		}

		// 사용자가 창으로 복귀하면 설정을 바꿨을 지도 모르니 재시도
		const onFocus = () => tryOnce();
		const onVisible = () => {
			if (document.visibilityState === "visible") {
				tryOnce();
			}
		};

		window.addEventListener("focus", onFocus);
		document.addEventListener("visibilitychange", onVisible);

		return () => {
			cleanup?.();
			window.removeEventListener("focus", onFocus);
			document.removeEventListener("visibilitychange", onVisible);
		};
	}, [
		resolvedOptions.enableHighAccuracy,
		resolvedOptions.maximumAge,
		resolvedOptions.timeout,
	]);

	return state;
}
