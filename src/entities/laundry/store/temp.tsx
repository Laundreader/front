import { createContext, use, useMemo, useReducer } from "react";
import { mergeWith } from "es-toolkit";

import type { ReactNode } from "react";
import type { Laundry } from "../model";
import type { DeepPartial } from "@/shared/utils/type";

export type TempLaundry = Omit<Laundry, "id" | "solutions"> & {
	didConfirmAnalysis: boolean;
};

type State = TempLaundry | null;

type Action =
	| { type: "SET"; payload: DeepPartial<TempLaundry> }
	| { type: "CLEAR" };

const skeletonTempLaundry: TempLaundry = {
	type: "",
	color: "",
	materials: [],
	hasPrintOrTrims: false,
	laundrySymbols: [],
	additionalInfo: [],
	image: {
		label: { format: "jpeg", data: "" } as const,
		clothes: null,
	},
	didConfirmAnalysis: false,
};

function mergeState(
	prev: TempLaundry,
	next: DeepPartial<TempLaundry>,
): TempLaundry {
	const nextState = mergeWith(prev, next, (prevValue, nextValue) => {
		if (
			Array.isArray(prevValue) &&
			Array.isArray(nextValue) &&
			nextValue.length === 0
		) {
			return nextValue;
		} else {
			return undefined;
		}
	});

	return { ...nextState };
}

function reducer(state: State, action: Action): State {
	switch (action.type) {
		case "SET": {
			return state === null
				? mergeState(skeletonTempLaundry, action.payload)
				: mergeState(state, action.payload);
		}
		case "CLEAR":
			return null;
		default:
			return state;
	}
}

export type TempLaundryContextValue = {
	state: State;
	set: (payload: DeepPartial<TempLaundry>) => void;
	clear: () => void;
};

const TempLaundryContext = createContext<TempLaundryContextValue | undefined>(
	undefined,
);

export function TempLaundryProvider({
	children,
	initialValue = null,
}: {
	children: ReactNode;
	initialValue?: State;
}) {
	const [state, dispatch] = useReducer(reducer, initialValue);

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
