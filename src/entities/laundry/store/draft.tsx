import { createContext, use, useMemo, useReducer } from "react";

import type { ReactNode } from "react";
import type { Laundry } from "../model";

type LaundryDraft = Omit<Laundry, "id" | "solutions"> & {
	didConfirmAnalysis: boolean;
};

type State = LaundryDraft | null;

type Action =
	| { type: "SET"; payload: Partial<LaundryDraft> }
	| { type: "CLEAR" };

const LaundryDraftDefault: LaundryDraft = {
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
						...LaundryDraftDefault,
						image: { ...LaundryDraftDefault.image },
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

type LaundryDraftContextValue = {
	state: State;
	set: (payload: Partial<LaundryDraft>) => void;
	clear: () => void;
};

const LaundryDraftContext = createContext<LaundryDraftContextValue | undefined>(
	undefined,
);

export function LaundryDraftProvider({ children }: { children: ReactNode }) {
	const [state, dispatch] = useReducer(reducer, null);

	const value = useMemo<LaundryDraftContextValue>(
		() => ({
			state,
			set: (payload) => dispatch({ type: "SET", payload }),
			clear: () => dispatch({ type: "CLEAR" }),
		}),
		[state],
	);

	return <LaundryDraftContext value={value}>{children}</LaundryDraftContext>;
}

export function useLaundryDraft(): LaundryDraftContextValue {
	const context = use(LaundryDraftContext);
	if (context === undefined) {
		throw new Error("useLaundryDraft must be used within LaundryDraftProvider");
	}

	return context;
}
