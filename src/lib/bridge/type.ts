export type NativeNavigationTarget = "Login" | "Profile" | "Home";

export type WebToNativeMessage =
	| {
			type: "NAVIGATE_TO_NATIVE";
			payload: { screen: NativeNavigationTarget; params?: any };
	  }
	| { type: "GO_BACK_NATIVE" } // 웹의 히스토리가 끝났을 때 네이티브 종료 요청
	| { type: "TOKEN_EXPIRED" } // 예: 401 발생 시 네이티브 로그인 유도
	| {
			type: "ROUTE_CHANGE";
			payload: {
				path: string;
				search: {
					message?: string | undefined;
					success?: boolean | undefined;
					laundryIds?: number[] | undefined;
					laundryId?: number | null | undefined;
					nickname?: string | undefined;
					firstLogin?: boolean | undefined;
					code?: number | undefined;
					category?: "careSymbols" | "materials" | undefined;
					redirect?: string | undefined;
				};
				fullUrl: string;
			};
	  }; // 경로 변경 알림
