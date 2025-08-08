export interface Laundry {
	id: number;
	materials: Array<string>;
	color: string;
	type: string;
	hasPrintOrTrims: boolean;
	laundrySymbols: Array<{
		code: string;
		description: string;
	}>;
	additionalInfo?: Array<string>;
	solutions: Array<{
		name: "wash" | "dry" | "etc";
		contents: string;
	}>;
	images: {
		real?: string;
		label: string;
	};
}

export type LaundryBasketSolutionRequest = Array<Laundry["id"]>;
export interface LaundryBasketSolutionResponse {
	groups: Array<{
		id: number;
		name: string;
		solution: string | null;
		laundryIds: Array<Laundry["id"]>;
	}>;
}
