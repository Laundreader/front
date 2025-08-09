export interface CareLabelAnalysis {
	materials: Array<string>;
	color: string;
	type: string;
	hasPrintOrTrims: boolean;
	additionalInfo: Array<string>;
	laundrySymbols: {
		waterWashing: Array<LaundrySymbol>;
		bleaching: Array<LaundrySymbol>;
		ironing: Array<LaundrySymbol>;
		dryCleaning: Array<LaundrySymbol>;
		wetCleaning: Array<LaundrySymbol>;
		wringing: Array<LaundrySymbol>;
		naturalDrying: Array<LaundrySymbol>;
		tumbleDrying: Array<LaundrySymbol>;
	};
}

export interface LaundrySymbol {
	code: string;
	description: string;
}
