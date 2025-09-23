import { DatabaseType } from "@database/db-instance";
import {
  bankAccount,
  transactionInstrument,
  transferMethod,
} from "@database/schema";
import { eq } from "drizzle-orm";

type DataInsert = typeof bankAccount.$inferInsert;
type DataSelect = typeof bankAccount.$inferSelect;

export async function insert(db: DatabaseType, data: DataInsert) {
	return (await db.insert(bankAccount).values(data).returning()).shift();
}

export async function get(db: DatabaseType, bank_id: DataSelect["id"]) {
	return (
		await db.select().from(bankAccount).where(eq(bankAccount.id, bank_id))
	).shift();
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

export async function get_all_transaction_instruments(
	db: DatabaseType,
	bank_id: DataSelect["id"]
) {
	return await db
		.select({
			id: transactionInstrument.id,
      transfer_method_id: transactionInstrument.fk_id_transfer_method,
			code: transferMethod.code,
		})
		.from(transactionInstrument)
		.innerJoin(
			transferMethod,
			eq(transactionInstrument.fk_id_transfer_method, transferMethod.id)
		)
		.where(eq(transactionInstrument.fk_id_bank_account, bank_id));
}

export type { DataInsert as infer_insert, DataSelect as infer_select };

