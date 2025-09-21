import { type DatabaseType } from "@database/db-instance";
import { transactionInstrument, transferMethod } from "@database/schema";
import { and, eq } from "drizzle-orm";

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
		.where(
			and(
				eq(transferMethod.code, method_code),
				eq(transactionInstrument.is_enabled, true)
			)
		);
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

export type { DataInsert as infer_insert, DataSelect as infer_select };
