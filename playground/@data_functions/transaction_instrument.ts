import { type DatabaseType } from "@database/db-instance";
import { transactionInstrument, transferMethod } from "@database/schema";
import { eq, inArray } from "drizzle-orm";

type DataInsert = typeof transactionInstrument.$inferInsert;
type DataSelect = typeof transactionInstrument.$inferSelect;

export async function get_all_filtered_by_transfer_method(
	db: DatabaseType,
	method_code: typeof transferMethod.$inferSelect.code
) {
	return await db
		.select({
			id: transactionInstrument.id,
			code: transferMethod.code,
		})
		.from(transactionInstrument)
		.innerJoin(
			transferMethod,
			eq(transactionInstrument.fk_id_transfer_method, transferMethod.id)
		)
		.where(eq(transferMethod.code, method_code));
}

export async function get_bank_id(
	db: DatabaseType,
	transaction_instrument_id: typeof transactionInstrument.$inferSelect.id
) {
	const [{ bank_id }] = await db
		.select({
			bank_id: transactionInstrument.fk_id_bank_account,
		})
		.from(transactionInstrument)
		.where(eq(transactionInstrument.id, transaction_instrument_id));
	return bank_id;
}

export async function register_transfer_methods(
	db: DatabaseType,
	data: DataInsert | DataInsert[]
) {
	// Feito assim para permitir a inserção de vários ou apenas 1
	if (Array.isArray(data)) {
		return await db.insert(transactionInstrument).values(data).returning();
	} else {
		return await db.insert(transactionInstrument).values(data).returning();
	}
}

type TransactionInstrumentId = typeof transactionInstrument.$inferSelect.id;

export async function delete_transfer_methods(
	db: DatabaseType,
	data: TransactionInstrumentId | TransactionInstrumentId[]
) {
	// Feito assim para permitir a inserção de vários ou apenas 1
	if (Array.isArray(data)) {
		return await db
			.delete(transactionInstrument)
			.where(inArray(transactionInstrument.id, data))
			.returning();
	} else {
		return await db
			.delete(transactionInstrument)
			.where(eq(transactionInstrument.id, data))
			.returning();
	}
}

export type { DataInsert as infer_insert, DataSelect as infer_select };

