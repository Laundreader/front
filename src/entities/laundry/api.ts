import { laundryStore } from "@/idb";

import type {
	Laundry,
	LaundryBasketSolutionRequest,
	LaundryBasketSolutionResponse,
	LaundrySolutionRequest,
	LaundrySolutionResponse,
} from "./model";

export async function getLaundryDetail(
	laundryId: Laundry["id"],
): Promise<Laundry> {
	const laundry = await laundryStore.get(laundryId);
	if (!laundry) {
		throw new Error(`Laundry with id ${laundryId} not found`);
	}

	return laundry as Laundry;
}

export async function getLaundrySolution(
	laundry: LaundrySolutionRequest,
): Promise<LaundrySolutionResponse> {
	const resposne = await fetch(
		`${import.meta.env.VITE_API_URL}/user-api/laundry-solution/single`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				laundry,
			}),
		},
	);

	if (!resposne.ok) {
		const text = await resposne.text().catch(() => "");
		throw new Error(
			`Failed to get laundry solution: ${resposne.status} ${text}`,
		);
	}
	return (await resposne.json()) as LaundrySolutionResponse;
}

export function addLaundryToBasket() {}

export async function getLaundryBasket(): Promise<Array<Laundry>> {
	return await laundryStore.values();
}

export async function deleteLaundryFromBasket(
	laundryIds: Array<Laundry["id"]>,
): Promise<void> {
	await laundryStore.delmany(laundryIds);
}

export async function getLaundryBasketSolution(
	laundryIds: LaundryBasketSolutionRequest,
): Promise<LaundryBasketSolutionResponse> {
	const response = await fetch(
		`${import.meta.env.VITE_API_URL}/user-api/laundry-solution/hamper`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(laundryIds),
		},
	);

	if (!response.ok) {
		const text = await response.text().catch(() => "");
		throw new Error(
			`Failed to get laundry basket solution: ${response.status} ${text}`,
		);
	}

	return (await response.json()) as LaundryBasketSolutionResponse;
}
