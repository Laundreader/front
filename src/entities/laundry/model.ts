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
		real?: { format: string; data: string }; // base64 문자열
		label: { format: string; data: string }; // base64 문자열
	};
}

export type LaundryBeforeAnalysis = Omit<Laundry, "id" | "solutions">;
export type LaundryAfterAnalysis = Omit<Laundry, "solutions">;
export type LaundryBasketSolutionRequest = Array<Laundry["id"]>;
export interface LaundryBasketSolutionResponse {
	groups: Array<{
		id: number;
		name: string;
		solution: string | null;
		laundryIds: Array<Laundry["id"]>;
	}>;
}

export interface LaundrySolutionRequest {
	materials: Array<string>;
	color: string;
	type: string;
	hasPrintOrTrims: boolean;
	additionalInfo?: Array<string>;
	laundrySymbols: Array<{
		code: string;
		description: string;
	}>;
	image?: {
		format: "png" | "jpg" | "jpeg";
		data: string; // base64 문자열
	};
}

export interface LaundrySolutionResponse {
	additionalInfo: Array<string>;
	solutions: Array<{
		name: "wash" | "dry" | "etc";
		contents: string;
	}>;
}
