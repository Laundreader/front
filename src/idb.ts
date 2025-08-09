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

export const laundryStore = {
	clear: async () => clear(_laundryStore),
	del: async (id: number) => del(id, _laundryStore),
	get: async (id: number) => get(id, _laundryStore),
	set: async ({ id, value }: { id?: number; value: any }) => {
		if (id === undefined) {
			id = currId++;
		} else if (id >= currId) {
			currId = id + 1;
		}
		value[id] = id;
		set(id, value, _laundryStore);

		return id;
	},
	delmany: async (ids: Array<number>) => {
		await delMany(ids, _laundryStore);
	},
	getMany: async (ids: Array<number>) => {
		return await getMany(ids);
	},
	values: async () => {
		return await values(_laundryStore);
	},
};
