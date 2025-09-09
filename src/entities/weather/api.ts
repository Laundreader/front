import { http, type HttpResponseSuccess } from "@/shared/api";

export type Weather = {
	temp: number;
	humidity: number;
	weather: {
		id: number;
		main: string;
		description: string;
		icon: string;
	};
};

type Position = {
	lat: number;
	lon: number;
};

export async function getWeather(position: Position): Promise<Weather> {
	const { data } = await http
		.get<
			HttpResponseSuccess<Weather>
		>("weather/current", { searchParams: position })
		.json();

	return data;
}

type Advice = { message: string };

export async function getLaundryAdvice(position: Position): Promise<Advice> {
	const { data } = await http
		.get<
			HttpResponseSuccess<Advice>
		>("weather/solution/dry", { searchParams: position })
		.json();

	return data;
}
