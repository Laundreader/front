import { createContext, use, useMemo, useReducer } from "react";

import type { ReactNode } from "react";
import type { Laundry } from "../model";
import type { DeepPartial } from "@/shared/utils/type";

export type TempLaundry = Omit<Laundry, "id" | "solutions">;

type State = TempLaundry | null;

type Action =
	| { type: "SET"; payload: DeepPartial<TempLaundry> }
	| { type: "CLEAR" };

function mergeDeep<T extends Record<string, any>>(
	target: T,
	patch: DeepPartial<T>,
): T {
	const result: any = { ...target };
	for (const key of Object.keys(patch) as Array<keyof T>) {
		const value = patch[key];
		if (value === undefined) continue;
		if (
			value &&
			typeof value === "object" &&
			!Array.isArray(value) &&
			target &&
			typeof (target as any)[key] === "object" &&
			!Array.isArray((target as any)[key])
		) {
			(result as any)[key] = mergeDeep((target as any)[key], value as any);
		} else {
			(result as any)[key] = value as any;
		}
	}

	return result as T;
}

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
};

function reducer(state: State, action: Action): State {
	switch (action.type) {
		case "SET":
			return state === null
				? mergeDeep(skeletonTempLaundry, action.payload)
				: mergeDeep(state, action.payload);
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
