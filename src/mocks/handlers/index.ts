import { delay, http, passthrough } from "msw";
import { imageHandlers } from "./image";
import { laundryHandlers } from "./laundry";
import { weatherHandlers } from "./weather";
// import { chatHandlers } from "./chat";

const API_URL = import.meta.env.VITE_API_URL;

export const handlers = [
	http.all(`${API_URL}/*`, async () => {
		await delay(3000);
	}),
	...imageHandlers,
	...laundryHandlers,
	...weatherHandlers,
	// ...chatHandlers,
	http.all("*", () => {
		passthrough();
	}),
];
