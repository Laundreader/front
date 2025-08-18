import { openDB } from "idb";

import type { DBSchema } from "idb";
import type { Laundry } from "../entities/laundry/model";

const IDB_NAME = "laundreader" as const;
const IDB_VERSION = 2 as const;
const LAUNDRY_STORE_NAME = "laundry" as const;

type LaundryV1 = Omit<Laundry, "image"> & {
	images: {
		label: { format: string; data: string };
		real?: { format: string; data: string };
	};
};

interface LaundreaderDB extends DBSchema {
	laundry: {
		key: number;
		value: Laundry;
	};
}

export const laundreaderIdb = await openDB<LaundreaderDB>(
	IDB_NAME,
	IDB_VERSION,
	{
		async upgrade(db, oldVersion, _newVersion, tx) {
			if (oldVersion < 1) {
				db.createObjectStore(LAUNDRY_STORE_NAME, {
					keyPath: "id",
					autoIncrement: true,
				});
			}

			if (oldVersion < 2) {
				let backup: Array<LaundryV1> = [];

				try {
					const oldStore = tx.objectStore(LAUNDRY_STORE_NAME);
					for await (const cursor of oldStore) {
						const val = cursor.value as unknown as LaundryV1;
						if (val.id !== undefined && val.solutions !== undefined) {
							backup.push(val);
						}
					}
				} catch {
					backup = [] as Array<LaundryV1>;
				}

				try {
					db.deleteObjectStore(LAUNDRY_STORE_NAME);
				} catch {}

				db.createObjectStore(LAUNDRY_STORE_NAME, {
					keyPath: "id",
					autoIncrement: true,
				});

				const newStore = tx.objectStore(LAUNDRY_STORE_NAME);

				for (const oldLaundry of backup) {
					const { images: oldImages, ...rest } = oldLaundry;
					const migrated = {
						...rest,
						image: {
							label: oldImages.label,
							clothes: oldImages.real ?? null,
						},
					} as Laundry;

					await newStore.put(migrated);
				}
			}
		},
	},
);

export const laundryStore = {
	get: async (id: Laundry["id"]): Promise<Laundry | undefined> =>
		await laundreaderIdb.get(LAUNDRY_STORE_NAME, id),

	getMany: async (ids: Array<Laundry["id"]>): Promise<Array<Laundry>> =>
		await Promise.all(
			ids.map(
				async (id) =>
					(await laundreaderIdb.get(LAUNDRY_STORE_NAME, id)) as Laundry,
			),
		),

	getAll: async (): Promise<Array<Laundry>> =>
		((await laundreaderIdb.getAll(LAUNDRY_STORE_NAME)) as Array<Laundry>) ?? [],

	add: async (value: Laundry): Promise<Laundry["id"]> => {
		// if (typeof (value as any)?.id === "number") {
		// 	await laundreaderIdb.put(LAUNDRY_STORE_NAME, value);
		// 	return value.id;
		// }
		const id = await laundreaderIdb.add(LAUNDRY_STORE_NAME, value);

		return id;
	},

	set: async ({
		id,
		value,
	}: {
		id?: Laundry["id"];
		value: unknown;
	}): Promise<Laundry["id"]> => {
		if (id === undefined) {
			const assignedId = (await laundreaderIdb.add(
				LAUNDRY_STORE_NAME,
				value as any,
			)) as number;
			return assignedId;
		}
		const record = { ...(value as object), id } as any;
		await laundreaderIdb.put(LAUNDRY_STORE_NAME, record);

		return id;
	},

	put: async (id: Laundry["id"], value: Partial<Laundry>): Promise<void> => {
		const prev = await laundreaderIdb.get(LAUNDRY_STORE_NAME, id);
		if (!prev) {
			return;
		}

		const next = { ...prev, ...value };
		await laundreaderIdb.put(LAUNDRY_STORE_NAME, next);
	},

	del: async (id: Laundry["id"]): Promise<void> => {
		await laundreaderIdb.delete(LAUNDRY_STORE_NAME, id);
	},

	delMany: async (ids: Array<Laundry["id"]>): Promise<void> => {
		const tx = laundreaderIdb.transaction(LAUNDRY_STORE_NAME, "readwrite");
		const store = tx.objectStore(LAUNDRY_STORE_NAME);
		await Promise.all(ids.map((key) => store.delete(key)));
		await tx.done;
	},
};
