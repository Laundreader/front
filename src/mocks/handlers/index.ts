import { delay, http, passthrough } from "msw";
import { imageHandlers } from "./image";
import { laundryHandlers } from "./laundry";
import { chatHandlers } from "./chat";

const API_URL = import.meta.env.VITE_API_URL;

export const handlers = [
	http.all(`${API_URL}/laundry/solution/*`, async () => {
		await delay(10000);
		// passthrough();
	}),
	http.all(`${API_URL}/*`, async () => {
		await delay(3000);
	}),
	...imageHandlers,
	...laundryHandlers,
	...chatHandlers,
	http.all("*", () => {
		passthrough();
	}),
];
