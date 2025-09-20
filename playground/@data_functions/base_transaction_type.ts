import { type DatabaseType } from "@database/db-instance";
import { baseTransactionType } from "@database/schema";
import { eq } from "drizzle-orm";

type Data = typeof baseTransactionType.$inferInsert;

export async function insert(db: DatabaseType, data: Data | Data[]) {
	// Feito assim para permitir a inserção de vários ou apenas 1
	if (Array.isArray(data)) {
		return await db.insert(baseTransactionType).values(data).returning();
	} else {
		return await db.insert(baseTransactionType).values(data).returning();
	}
}

export async function remove(
	db: DatabaseType,
	base_transaction_id: typeof baseTransactionType.$inferSelect.id
) {
	await db
		.delete(baseTransactionType)
		.where(eq(baseTransactionType.id, base_transaction_id));
}
