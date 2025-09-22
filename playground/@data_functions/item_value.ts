import { type DatabaseType } from "@database/db-instance";
import { itemValue } from "@database/schema";
import { eq, inArray } from "drizzle-orm";

type DataInsert = typeof itemValue.$inferInsert;
type DataSelect = typeof itemValue.$inferSelect;

export async function insert(
	db: DatabaseType,
	data: DataInsert | DataInsert[]
) {
	// Feito assim para permitir a inserção de vários ou apenas 1
	if (Array.isArray(data)) {
		return await db.insert(itemValue).values(data).returning();
	} else {
		return await db.insert(itemValue).values(data).returning();
	}
}

type ArrayNotEmpty<T> = [T, ...T[]];

export async function remove(
	db: DatabaseType,
	item_value_ids: ArrayNotEmpty<typeof itemValue.$inferSelect.id>
) {
	if (item_value_ids.length === 0) {
		throw new Error("É necessário pelo menos 1 id para remover");
	}
	await db.delete(itemValue).where(inArray(itemValue.id, item_value_ids));
}

export async function mark_as_processed(
	db: DatabaseType,
	item_value_id: typeof itemValue.$inferSelect.id
) {
	await db
		.update(itemValue)
		.set({ was_processed: true })
		.where(eq(itemValue.id, item_value_id));
}

export async function mark_as_unprocessed(
	db: DatabaseType,
	item_value_id: typeof itemValue.$inferSelect.id
) {
	await db
		.update(itemValue)
		.set({ was_processed: true })
		.where(eq(itemValue.id, item_value_id));
}

export type { DataInsert as infer_insert, DataSelect as infer_select };

