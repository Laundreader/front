import { useEffect, useRef } from "react";
import type { UseQueryResult } from "@tanstack/react-query";

type QueryEffectsOptions<TData, TError> = {
	onSuccess?: (data: TData) => void;
	onError?: (error: TError) => void;
	onSettled?: (data: TData | undefined, error: TError | null) => void;
};

export function useQueryEffects<TData, TError>(
	query: UseQueryResult<TData, TError>,
	options: QueryEffectsOptions<TData, TError>,
) {
	const { onSuccess, onError, onSettled } = options;

	// 이전 상태를 추적하기 위한 ref
	const prevStateRef = useRef({
		isSuccess: false,
		isError: false,
		data: undefined as TData | undefined,
		error: null as TError | null,
	});

	useEffect(() => {
		const { isSuccess, isError, data, error } = query;
		const prevState = prevStateRef.current;

		// 성공 상태 확인 및 콜백 실행 (새로운 성공 상태일 때만)
		if (isSuccess && onSuccess && !prevState.isSuccess) {
			onSuccess(data as TData);
		}

		// 에러 상태 확인 및 콜백 실행 (새로운 에러 상태일 때만)
		if (isError && onError && !prevState.isError) {
			onError(error as TError);
		}

		// 완료 상태(성공 또는 에러) 확인 및 콜백 실행 (새로운 완료 상태일 때만)
		if (
			(isSuccess || isError) &&
			onSettled &&
			!(prevState.isSuccess || prevState.isError)
		) {
			onSettled(data, error);
		}

		// 현재 상태 저장
		prevStateRef.current = { isSuccess, isError, data, error };
	}, [
		query.isSuccess,
		query.isError,
		query.data,
		query.error,
		onSuccess,
		onError,
		onSettled,
	]);

	return query;
}
