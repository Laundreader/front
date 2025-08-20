import { openDB } from "idb";

import type { IDBPDatabase, DBSchema } from "idb";
import type { Laundry } from "../model";

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

let db: IDBPDatabase<LaundreaderDB> | null = null;
const dbPromise: Promise<IDBPDatabase<LaundreaderDB>> = openDB<LaundreaderDB>(
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

dbPromise
	.then((instance) => {
		db = instance;
	})
	.catch(() => {});

function withDb<T>(
	fn: (db: IDBPDatabase<LaundreaderDB>) => T | Promise<T>,
): Promise<T> {
	return db ? Promise.resolve(fn(db)) : dbPromise.then(fn);
}

export const laundryStore = {
	get: (id: Laundry["id"]): Promise<Laundry | undefined> =>
		withDb((db) => db.get(LAUNDRY_STORE_NAME, id)),

	getMany: (ids: Array<Laundry["id"]>): Promise<Array<Laundry>> => {
		return withDb((db) =>
			Promise.all(
				ids.map(
					async (id) => (await db.get(LAUNDRY_STORE_NAME, id)) as Laundry,
				),
			),
		);
	},

	getAll: (): Promise<Array<Laundry>> => {
		return withDb(
			async (db) =>
				((await db.getAll(LAUNDRY_STORE_NAME)) as Array<Laundry>) ?? [],
		);
	},

	add: (value: Omit<Laundry, "id">): Promise<Laundry["id"]> => {
		return withDb((db) => db.add(LAUNDRY_STORE_NAME, value as any));
	},

	set: async ({
		id,
		value,
	}: {
		id?: Laundry["id"];
		value: unknown;
	}): Promise<Laundry["id"]> => {
		return withDb(async (db) => {
			if (id === undefined) {
				const assignedId = (await db.add(
					LAUNDRY_STORE_NAME,
					value as any,
				)) as number;

				return assignedId;
			}

			const record = { ...(value as object), id } as any;
			await db.put(LAUNDRY_STORE_NAME, record);

			return id;
		});
	},

	put: (id: Laundry["id"], value: Partial<Laundry>): Promise<void> =>
		withDb(async (db) => {
			const prev = await db.get(LAUNDRY_STORE_NAME, id);
			if (prev === undefined) {
				return;
			}

			const next = { ...prev, ...value };
			await db.put(LAUNDRY_STORE_NAME, next);
		}),

	del: (id: Laundry["id"]): Promise<void> =>
		withDb((db) => db.delete(LAUNDRY_STORE_NAME, id)),

	delMany: (ids: Array<Laundry["id"]>): Promise<void> =>
		withDb(async (db) => {
			const tx = db.transaction(LAUNDRY_STORE_NAME, "readwrite");
			const store = tx.objectStore(LAUNDRY_STORE_NAME);
			await Promise.all(ids.map((key) => store.delete(key)));
			await tx.done;
		}),
};
