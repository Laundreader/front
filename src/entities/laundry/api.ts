import type {
	Laundry,
	LaundryBasketSolutionRequest,
	LaundryBasketSolutionResponse,
	LaundrySolutionRequest,
	LaundrySolutionResponse,
} from "./model";
import { laundryStore } from "@/idb";

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
			body: JSON.stringify(laundry),
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
	const values = (await laundryStore.values()) as Array<unknown>;

	const withSolutions = values.filter((v): v is Laundry => {
		const lv = v as Partial<Laundry> | undefined;
		if (!lv || !Array.isArray(lv.solutions)) return false;
		if (lv.solutions.length < 3) return false;

		// 솔루션 3개가 다 있는지 확인
		const map = new Map<string, string>();
		for (const s of lv.solutions as any[]) {
			if (
				s &&
				(s.name === "wash" || s.name === "dry" || s.name === "etc") &&
				typeof s.contents === "string" &&
				s.contents.trim().length > 0
			) {
				map.set(s.name, s.contents);
			}
		}

		return map.has("wash") && map.has("dry") && map.has("etc");
	});

	return withSolutions;
}

export async function deleteLaundryFromBasket(
	laundryIds: Array<Laundry["id"]>,
): Promise<void> {
	await laundryStore.delmany(laundryIds);
}

export async function getLaundryBasketSolution(
	laundryIds: LaundryBasketSolutionRequest,
): Promise<LaundryBasketSolutionResponse> {
	// IDB에서 해당 세탁물들을 가져와 images를 제외
	const records = await Promise.all(
		laundryIds.map(async (id) => {
			const rec = (await laundryStore.get(id)) as Laundry | undefined;
			return rec ? { ...rec } : undefined;
		}),
	);

	const payload = records
		.filter((r): r is Laundry => Boolean(r))
		.map((r) => {
			const { images: _omitImages, ...rest } = r;
			return rest;
		});

	const response = await fetch(
		`${import.meta.env.VITE_API_URL}/user-api/laundry-solution/hamper`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ laundry: payload }),
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
