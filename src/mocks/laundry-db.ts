import { CARE_SYMBOLS, MATERIALS } from "@/entities/laundry/const";
import { mockData } from "./mock-data";

import type { LaundryLocal } from "@/entities/laundry/model";

let id = 1;

const allCareSymbols = [...CARE_SYMBOLS];
const allMaterials = [...MATERIALS];

const table = new Map<number, LaundryLocal>();

function create(payload: Omit<LaundryLocal, "id">): number {
	const newId = id++;
	const laundry = { id: newId, ...payload };
	table.set(newId, laundry);

	return newId;
}

function findById(id: LaundryLocal["id"]): LaundryLocal | undefined {
	return table.get(id);
}

function findManyByIds(ids: Array<LaundryLocal["id"]>): Array<LaundryLocal> {
	return ids
		.map((id) => table.get(id))
		.filter((laundry) => laundry !== undefined);
}

function findAll(): Array<LaundryLocal> {
	return Array(...table.values());
}

function deleteById(id: LaundryLocal["id"]): void {
	table.delete(id);
}

function seed(cnt: number) {
	for (let i = 0; i < cnt; i++) {
		create({
			materials: pickRandomUniqueElements(allMaterials, 1, 3),
			color: mockData.color.human(),
			type: mockData.commerce.productName(),
			image: {
				label: {
					format: "jpeg",
					data: mockData.image.urlPicsumPhotos({ width: 200, height: 200 }),
				},
				clothes: {
					format: "jpeg",
					data: mockData.image.urlPicsumPhotos({ width: 200, height: 200 }),
				},
			},
			additionalInfo: [mockData.lorem.sentence()],
			hasPrintOrTrims: mockData.datatype.boolean(),
			laundrySymbols: pickRandomUniqueElements(allCareSymbols, 1, 6),
			solutions: [
				{
					name: "wash",
					contents: mockData.lorem.paragraph(),
				},
				{
					name: "dry",
					contents: mockData.lorem.paragraph(),
				},
				{
					name: "etc",
					contents: mockData.lorem.paragraph(),
				},
			],
		});
	}
}

seed(20);

export const laundryDb = {
	create,
	findById,
	findManyByIds,
	findAll,
	deleteById,
};

function pickRandomUniqueElements<T>(
	array: T[],
	min: number,
	max: number,
): T[] {
	if (array.length < min) {
		return [];
	}

	const num = Math.min(max, array.length);
	const randomNum = Math.floor(Math.random() * (num - min + 1)) + min;
	const shuffled = mockData.helpers.shuffle(array);

	return shuffled.slice(0, randomNum);
}
