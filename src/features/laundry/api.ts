import { queryOptions } from "@tanstack/react-query";
import {
	getLaundriesAllLocal,
	createHamperSolution,
	createLaundrySolution,
} from "@/entities/laundry/api";

import type { Laundry, LaundrySolutionRequest } from "@/entities/laundry/model";

export const laundrySolutionQueryOptions = (
	laundry: LaundrySolutionRequest,
) => {
	return queryOptions({
		queryKey: ["laundry-solution"],
		queryFn: async () => {
			const solutions = await createLaundrySolution(laundry);

			return solutions;
		},
	});
};

export const hamperQueryOptions = queryOptions({
	queryKey: ["hamper"],
	queryFn: getLaundriesAllLocal,
});

export const HamperSolutionQueryOptions = (
	laundryIds: Array<Laundry["id"]>,
) => {
	return queryOptions({
		queryKey: ["hamper-solution", laundryIds],
		queryFn: () => createHamperSolution({ laundryIds }),
	});
};
