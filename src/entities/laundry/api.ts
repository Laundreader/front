import { laundryStore } from "@/entities/laundry/store/persist";
import { http, httpPublic } from "@/shared/api";
import imageCompression from "browser-image-compression";

import type { Options } from "ky";
import type { HttpResponseSuccess } from "@/shared/api";
import type {
	LaundryLocal,
	LaundryAnalysisRequest,
	LaundryAnalysisResponse,
	HamperSolutionRequest,
	HamperSolutionResponse,
	LaundrySolutionRequest,
	LaundrySolutionResponse,
	Solution,
	SolutionGroup,
	Laundry,
	AddLaundryToHamperRequest,
} from "./model";

// MARK: 세탁물 분석
export async function analysisLaundryImages(
	payload: LaundryAnalysisRequest,
	options?: Options,
): Promise<LaundryAnalysisResponse> {
	const response = await httpPublic
		.post<
			HttpResponseSuccess<LaundryAnalysisResponse>
		>("laundry/analysis", { ...options, json: payload })
		.json();

	return response.data;
}

// MARK: 단일 세탁물 상세
export async function getLaundryLocal(
	laundryId: LaundryLocal["id"],
): Promise<Laundry> {
	const laundry = await laundryStore.get(laundryId);
	if (laundry === undefined) {
		throw new Error(`Laundry with id ${laundryId} not found`);
	}

	return convertLocalToRemote(laundry);
}

async function getLaundry(laundryId: Laundry["id"]): Promise<Laundry> {
	const response = await http
		.get<HttpResponseSuccess<Laundry>>(`laundry/${laundryId}`)
		.json();

	return response.data;
}

// MARK: 단일 세탁물 솔루션
export async function createLaundrySolution(
	payload: LaundrySolutionRequest,
): Promise<Array<Solution>> {
	const response = await httpPublic
		.post<
			HttpResponseSuccess<LaundrySolutionResponse>
		>("laundry/solution", { json: payload })
		.json();

	return response.data.laundry.solutions;
}

// MARK: 빨래바구니에 세탁물 추가
export async function saveLaundryLocal(
	laundry: Omit<LaundryLocal, "id">,
): Promise<LaundryLocal["id"]> {
	const id = await laundryStore.add(laundry);

	return id;
}

export async function saveLaundry(
	laundry: AddLaundryToHamperRequest,
): Promise<Laundry["id"]> {
	const formData = new FormData();

	const { image, ...rest } = laundry;
	if (image.label) {
		const labelImageFile = await imageCompression.getFilefromDataUrl(
			image.label,
			"label.jpeg",
		);
		formData.append("label", labelImageFile, "label.jpeg");
	}
	if (image.clothes) {
		const clothesImageFile = await imageCompression.getFilefromDataUrl(
			image.clothes,
			"clothes.jpeg",
		);
		formData.append("clothes", clothesImageFile, "clothes.jpeg");
	}

	formData.append(
		"laundry",
		new Blob([JSON.stringify(rest)], { type: "application/json" }),
	);

	const response = await http
		.post<
			HttpResponseSuccess<{ id: Laundry["id"] }>
		>("laundry", { body: formData })
		.json();

	return response.data.id;
}

// MARK: 빨래바구니의 세탁물 목록
export async function getLaundriesAllLocal(): Promise<
	Array<{ id: number; thumbnail: string }>
> {
	try {
		const laundries = await laundryStore.getAll();

		return laundries
			.map((laundry) => {
				const converted = convertLocalToRemote(laundry);

				return {
					id: converted.id,
					thumbnail: converted.image.clothes ?? converted.image.label ?? "",
				};
			})
			.reverse();
	} catch (error) {
		return [];
	}
}

async function getLaundriesAll(): Promise<
	Array<{ id: number; thumbnail: string | null }>
> {
	const response = await http
		.get<
			HttpResponseSuccess<{
				hamper: Array<{ id: number; thumbnail: string | null }>;
			}>
		>("hamper", { throwHttpErrors: false })
		.json();

	const laundries = response.data.hamper;

	return laundries;
}

// MARK: 빨래바구니에서 세탁물 삭제
export async function deleteLaundry(laundryId: Laundry["id"]): Promise<void> {
	await http.delete(`laundry/${laundryId}`);
}
export async function deleteLaundryLocal(
	laundryId: Laundry["id"],
): Promise<void> {
	await laundryStore.del(laundryId);
}

// MARK: 빨래바구니 솔루션
export async function createHamperSolution(
	payload: HamperSolutionRequest,
): Promise<Array<SolutionGroup>> {
	const response = await http
		.post<
			HttpResponseSuccess<HamperSolutionResponse>
		>("hamper/solution", { json: payload })
		.json();

	return response.data.groups;
}

export const laundryApiLocal = {
	getLaundry: getLaundryLocal,
	getLaundriesAll: getLaundriesAllLocal,
	deleteLaundry: deleteLaundryLocal,
	saveLaundry: saveLaundryLocal,
};

export const laundryApi = {
	getLaundry,
	getLaundriesAll,
	deleteLaundry,
	createLaundryAnalysis: analysisLaundryImages,
	createLaundrySolution,
	saveLaundry,
	createHamperSolution,
};

function convertLocalToRemote(laundry: LaundryLocal): Laundry {
	const {
		id,
		type,
		color,
		materials,
		laundrySymbols,
		solutions,
		hasPrintOrTrims,
		additionalInfo,
		image,
	} = laundry;

	return {
		id,
		type,
		color,
		materials,
		laundrySymbols,
		solutions,
		hasPrintOrTrims,
		additionalInfo,
		image: {
			label: image.label?.data ?? null,
			clothes: image.clothes?.data ?? null,
		},
	};
}
