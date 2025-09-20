import { type DatabaseType } from "@database/db-instance";
import { itemValue } from "@database/schema";
import { inArray } from "drizzle-orm";

type Data = typeof itemValue.$inferInsert;

export async function insert(db: DatabaseType, data: Data | Data[]) {
	// Feito assim para permitir a inserção de vários ou apenas 1
	if (Array.isArray(data)) {
		return await db.insert(itemValue).values(data).returning();
	} else {
		return await db.insert(itemValue).values(data).returning();
	}
}

type ArrayNotEmpty<T> = [T, ...T[]]

export async function remove(
	db: DatabaseType,
	item_value_ids: ArrayNotEmpty<typeof itemValue.$inferSelect.id>
) {
	if(item_value_ids.length === 0){
		throw new Error("É necessário pelo menos 1 id para remover")
	}
	await db
			.delete(itemValue)
			.where(inArray(itemValue.id, item_value_ids));
}