import { createContext, use, useMemo, useReducer } from "react";

import type { ReactNode } from "react";
import type { Laundry } from "../model";

type TempLaundry = Omit<Laundry, "id" | "solutions"> & {
	didConfirmAnalysis: boolean;
};

type State = TempLaundry | null;

type Action =
	| { type: "SET"; payload: Partial<TempLaundry> }
	| { type: "CLEAR" };

const skeletonTempLaundry: TempLaundry = {
	type: "",
	color: "",
	materials: [],
	hasPrintOrTrims: false,
	laundrySymbols: [],
	additionalInfo: [],
	image: {
		label: null,
		clothes: null,
	},
	didConfirmAnalysis: false,
};

function reducer(state: State, action: Action): State {
	switch (action.type) {
		case "SET": {
			return state === null
				? {
						...skeletonTempLaundry,
						image: { ...skeletonTempLaundry.image },
						...action.payload,
					}
				: { ...state, image: { ...state.image }, ...action.payload };
		}
		case "CLEAR":
			return null;
		default:
			return state;
	}
}

type TempLaundryContextValue = {
	state: State;
	set: (payload: Partial<TempLaundry>) => void;
	clear: () => void;
};

const TempLaundryContext = createContext<TempLaundryContextValue | undefined>(
	undefined,
);

export function TempLaundryProvider({ children }: { children: ReactNode }) {
	const [state, dispatch] = useReducer(reducer, null);

	const value = useMemo<TempLaundryContextValue>(
		() => ({
			state,
			set: (payload) => dispatch({ type: "SET", payload }),
			clear: () => dispatch({ type: "CLEAR" }),
		}),
		[state],
	);

	return <TempLaundryContext value={value}>{children}</TempLaundryContext>;
}

export function useTempLaundry(): TempLaundryContextValue {
	const context = use(TempLaundryContext);
	if (context === undefined) {
		throw new Error("useTempLaundry must be used within TempLaundryProvider");
	}

	return context;
}
