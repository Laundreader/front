import ky from "ky";

export type HttpResponseSuccess<T> = {
	data: T;
};
export type HttpResponseError = {
	error: string;
};

export const http = ky.create({
	prefixUrl: import.meta.env.VITE_API_URL,
	retry: 0,
	timeout: false,
});
