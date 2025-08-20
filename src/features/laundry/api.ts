import { queryOptions } from "@tanstack/react-query";
import {
	getLaundries,
	getLaundriesAll,
	createHamperSolution,
	getLaundry,
	createLaundrySolution,
} from "@/entities/laundry/api";

import type { Laundry, LaundrySolutionRequest } from "@/entities/laundry/model";

export const laundryQueryOptions = (laundryId: Laundry["id"]) =>
	queryOptions({
		queryKey: ["laundry", laundryId],
		queryFn: () => getLaundry(laundryId),
	});

export const hamperQueryOptions = queryOptions({
	queryKey: ["hamper"],
	queryFn: getLaundriesAll,
});

export const HamperSolutionQueryOptions = (laundryIds: Array<Laundry["id"]>) =>
	queryOptions({
		queryKey: ["hamper-solution"],
		queryFn: async () => {
			const laundries = await getLaundries(laundryIds);

			return createHamperSolution({ laundries });
		},
	});

// export const laundrySolutionMutationOptions = mutationOptions({
// 	mutationKey: ["laundry-solution"],
// 	mutationFn: async (laundry: LaundrySolutionRequest) => {
// 		const solutions = await createLaundrySolution(laundry);

// 		return solutions;
// 	},
// });

export const laundrySolutionQueryOptions = (laundry: LaundrySolutionRequest) =>
	queryOptions({
		queryKey: ["laundry-solution"],
		queryFn: async () => {
			const solutions = await createLaundrySolution(laundry);

			return solutions;
		},
	});
