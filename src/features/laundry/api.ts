import { queryOptions } from "@tanstack/react-query";
import type { Laundry } from "@/entities/laundry/model";
import {
	getLaundryBasket,
	getLaundryBasketSolution,
} from "@/entities/laundry/api";

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
