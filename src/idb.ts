import {
	clear,
	createStore,
	del,
	delMany,
	get,
	getMany,
	set,
	values,
} from "idb-keyval";

const _laundryStore = createStore("laundreader", "laundry");

let currId = 1;
let initialized = false;

async function ensureInitialized() {
	if (initialized) {
		return;
	}

	try {
		const existingStore = await values(_laundryStore);
		// 값에 id가 없으면 넣어주기
		const maxId = existingStore.reduce((max, v: any) => {
			const vid = typeof v?.id === "number" ? v.id : 0;

			return vid > max ? vid : max;
		}, 0);

		currId = Math.max(currId, maxId + 1);
	} catch (e) {
		// 무시하고 기본 currId 유지
	} finally {
		initialized = true;
	}
}

export const laundryStore = {
	clear: async () => await clear(_laundryStore),
	del: async (id: number) => await del(id, _laundryStore),
	get: async (id: number) => await get(id, _laundryStore),
	set: async ({ id, value }: { id?: number; value: any }) => {
		if (id === undefined) {
			await ensureInitialized();
			id = currId++;
		} else if (id >= currId) {
			currId = id + 1;
		}
		// id를 값에 추가
		value.id = id;
		await set(id, value, _laundryStore);

		return id;
	},
	delmany: async (ids: Array<number>) => {
		await delMany(ids, _laundryStore);
	},
	getMany: async (ids: Array<number>) => {
		return await getMany(ids, _laundryStore);
	},
	values: async () => {
		return await values(_laundryStore);
	},
};
