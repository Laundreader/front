import { HttpResponse, http } from "msw";
import { API_URL } from "@/shared/api";

import type { Weather } from "@/entities/weather/api";
import type { HttpResponseSuccess } from "@/shared/api";
import { mockData } from "../mock-data";

export const weatherHandlers = [
	// MARK: 날씨 정보
	http.get(API_URL + "/weather/current", async () => {
		const result: HttpResponseSuccess<Weather> = {
			data: {
				temp: mockData.number.float({ min: -20, max: 40, fractionDigits: 1 }),
				humidity: mockData.number.int({ min: 0, max: 100 }),
				weather: {
					id: 803,
					main: "Clouds",
					description: "튼구름",
					icon: "04d",
				},
			},
		};

		return HttpResponse.json(result);
	}),

	// MARK: 세탁 건조 조언
	http.get(API_URL + "/weather/solution/dry", async () => {
		const result: HttpResponseSuccess<{ message: string }> = {
			data: {
				message: mockData.lorem.paragraph(1),
			},
		};

		return HttpResponse.json(result);
	}),
];
