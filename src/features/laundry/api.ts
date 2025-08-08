import { queryOptions } from "@tanstack/react-query";
import {
	getLaundryBasket,
	getLaundryBasketSolution,
} from "@/entities/laundry/api";

import type { Laundry } from "@/entities/laundry/model";

export const laundryBasketQueryOptions = queryOptions({
	queryKey: ["laundryBasket"],
	queryFn: getLaundryBasket,
});

export const laundryBasketSolutionQueryOptions = (
	laundryIds: Array<Laundry["id"]>,
) =>
	queryOptions({
		queryKey: ["laundryBasketSolution", laundryIds],
		queryFn: () => getLaundryBasketSolution(laundryIds),
	});
