import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ClassValue } from "clsx";

export function cn(...inputs: Array<ClassValue>) {
	return twMerge(clsx(inputs));
}

export function imgUrl(imgName: string): string {
	return import.meta.env.VITE_IMG_URL + imgName;
}

export function symbolUrl(symbolName: string): string {
	return import.meta.env.VITE_SYMBOL_URL + symbolName;
}
