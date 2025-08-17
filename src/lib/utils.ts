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

export async function sha256HexFromBase64(base64: string): Promise<string> {
	const binary = atob(base64);
	const len = binary.length;
	const bytes = new Uint8Array(len);

	for (let i = 0; i < len; i++) {
		bytes[i] = binary.charCodeAt(i);
	}

	const hashBuffer = await crypto.subtle.digest("SHA-256", bytes);
	const hashArray = Array.from(new Uint8Array(hashBuffer));

	return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
