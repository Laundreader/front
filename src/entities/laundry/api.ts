import { http } from "@/shared/api";
import { laundryStore } from "@/entities/laundry/store/persist";

import type { Options } from "ky";
import type { HttpResponseSuccess } from "@/shared/api";
import type {
	Laundry,
	LaundryAnalysisRequest,
	LaundryAnalysisResponse,
	HamperSolutionRequest,
	HamperSolutionResponse,
	LaundrySolutionRequest,
	LaundrySolutionResponse,
	Solution,
	SolutionGroup,
} from "./model";

// MARK: 세탁물 분석
export async function createLaundryAnalysis(
	payload: LaundryAnalysisRequest,
	options?: Options,
): Promise<LaundryAnalysisResponse> {
	const response = await http
		.post<
			HttpResponseSuccess<LaundryAnalysisResponse>
		>("laundry/analysis", { ...options, json: payload })
		.json();

	return response.data;
}

// MARK: 단일 세탁물 상세
export async function getLaundry(laundryId: Laundry["id"]): Promise<Laundry> {
	const laundry = await laundryStore.get(laundryId);
	if (laundry === undefined) {
		throw new Error(`Laundry with id ${laundryId} not found`);
	}

	return laundry;
}

export async function getLaundries(
	laundryIds: Array<Laundry["id"]>,
): Promise<Array<Laundry>> {
	const laundries = await laundryStore.getMany(laundryIds);

	return laundries;
}

// MARK: 단일 세탁물 솔루션
export async function createLaundrySolution(
	payload: LaundrySolutionRequest,
): Promise<Array<Solution>> {
	const response = await http
		.post<
			HttpResponseSuccess<LaundrySolutionResponse>
		>("laundry/solution/single", { json: payload })
		.json();

	return response.data.laundry.solutions;
}

// MARK: 빨래바구니에 세탁물 추가
export async function addLaundryToHamper(laundry: Laundry): Promise<void> {
	await laundryStore.add(laundry);
}

// MARK: 빨래바구니의 세탁물 목록
export async function getLaundriesAll(): Promise<Array<Laundry>> {
	return await laundryStore.getAll();
}

// MARK: 빨래바구니에서 세탁물 삭제
export async function deleteLaundries(
	laundryIds: Array<Laundry["id"]>,
): Promise<void> {
	await laundryStore.delMany(laundryIds);
}

// MARK: 빨래바구니 솔루션
export async function createHamperSolution(
	payload: HamperSolutionRequest,
): Promise<Array<SolutionGroup>> {
	const response = await http
		.post<
			HttpResponseSuccess<HamperSolutionResponse>
		>("laundry/solution/hamper", { json: payload })
		.json();

	return response.data.groups;
}
