import { delay, http } from "msw";
import { imageHandlers } from "./image";
import { laundryHandlers } from "./laundry";

export const handlers = [
	http.all("*", async () => {
		await delay(1000);
	}),
	...imageHandlers,
	...laundryHandlers,
];
