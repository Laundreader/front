import { delay, http, passthrough } from "msw";
import { API_URL } from "@/shared/api";
import { authHandlers } from "./auth";
import { imageHandlers } from "./image";
import { laundryHandlers } from "./laundry";
import { weatherHandlers } from "./weather";
import { userHandlers } from "./user";
import { hamperHandlers } from "./hamper";
// import { chatHandlers } from "./chat";

export const handlers = [
	http.all(`${API_URL}/*`, async () => {
		await delay(1000);
	}),
	...authHandlers,
	...imageHandlers,
	...laundryHandlers,
	...weatherHandlers,
	...userHandlers,
	...hamperHandlers,
	// ...chatHandlers,
	http.all("*", () => {
		passthrough();
	}),
];
