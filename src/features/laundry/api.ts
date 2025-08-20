import { queryOptions } from "@tanstack/react-query";
import {
	getLaundries,
	getLaundriesAll,
	createHamperSolution,
	getLaundry,
	createLaundrySolution,
} from "@/entities/laundry/api";

import type { Laundry, LaundrySolutionRequest } from "@/entities/laundry/model";

export const laundryQueryOptions = (laundryId: Laundry["id"]) => {
	return queryOptions({
		queryKey: ["laundry", laundryId],
		queryFn: () => getLaundry(laundryId),
	});
};

export const laundrySolutionQueryOptions = (
	laundry: LaundrySolutionRequest,
) => {
	return queryOptions({
		queryKey: ["laundry-solution", laundry.laundry],
		queryFn: async () => {
			const solutions = await createLaundrySolution(laundry);

			return solutions;
		},
	});
};

export const hamperQueryOptions = queryOptions({
	queryKey: ["hamper"],
	queryFn: getLaundriesAll,
});

export const HamperSolutionQueryOptions = (
	laundryIds: Array<Laundry["id"]>,
) => {
	return queryOptions({
		queryKey: ["hamper-solution", laundryIds],
		queryFn: async () => {
			const laundries = await getLaundries(laundryIds);

			const laundriesWithoutImage = laundries.map(({ image, ...rest }) => rest);

			return createHamperSolution({ laundries: laundriesWithoutImage });
		},
	});
};
