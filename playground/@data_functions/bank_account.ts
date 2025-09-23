import { DatabaseType } from "@database/db-instance";
import { bankAccount } from "@database/schema";
import { eq } from "drizzle-orm";

type DataInsert = typeof bankAccount.$inferInsert;
type DataSelect = typeof bankAccount.$inferSelect;

export async function insert(db: DatabaseType, data: DataInsert) {
	return await db.insert(bankAccount).values(data).returning();
}

export async function update_nickname(
	db: DatabaseType,
	data: {
		bank_id: DataSelect["id"];
		nickname: DataSelect["nickname"];
	}
) {
	await db
		.update(bankAccount)
		.set({ nickname: data.nickname })
		.where(eq(bankAccount.id, data.bank_id));
}