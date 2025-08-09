import { queryOptions } from "@tanstack/react-query";
import type { Laundry } from "@/entities/laundry/model";
import {
	getLaundryBasket,
	getLaundryBasketSolution,
	getLaundryDetail,
	getLaundrySolution,
} from "@/entities/laundry/api";


export const laundryQueryOptions = (laundryId: Laundry["id"]) =>
	queryOptions({
		queryKey: ["laundry", "detail", laundryId],
		queryFn: () => getLaundryDetail(laundryId),
		staleTime: 0,
		gcTime: 0,
	});

export const laundryBasketQueryOptions = queryOptions({
	queryKey: ["laundryBasket"],
	queryFn: getLaundryBasket,
});

export const laundryBasketSolutionQueryOptions = (
	laundryIds: Array<Laundry["id"]>,
) =>
	queryOptions({
		queryKey: ["laundryBasketSolution", laundryIds],
		queryFn: async () => {
			const basket = await getLaundryBasket();
			const validIds = new Set(basket.map((l) => l.id));
			const filtered = laundryIds.filter((id) => validIds.has(id));

			if (filtered.length === 0) {
				return { groups: [] };
			}

			return getLaundryBasketSolution(filtered);
		},
	});

export const laundrySolutionQueryOptions = (laundryId: Laundry["id"]) =>
	queryOptions({
		queryKey: ["laundrySolution", laundryId],
		staleTime: Number.POSITIVE_INFINITY,
		queryFn: async () => {
			const detail = await getLaundryDetail(laundryId);
			const req = {
				materials: detail.materials,
				color: detail.color,
				type: detail.type,
				hasPrintOrTrims: detail.hasPrintOrTrims,
				additionalInfo: detail.additionalInfo ?? [],
				laundrySymbols: detail.laundrySymbols,
				image: detail.images.real
					? {
							format: detail.images.real.format as "png" | "jpg" | "jpeg",
							data: detail.images.real.data,
						}
					: undefined,
			} as const;

			return getLaundrySolution(req);
		},
	});
