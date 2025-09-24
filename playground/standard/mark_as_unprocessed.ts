import * as bup from "@data_functions/balance_update_pipeline";
import * as iv from "@data_functions/item_value";
import * as std from "@data_functions/standard";
import { db, transactionsFn } from "@database/db-instance";
import { standard } from "@database/schema";

export async function mark_as_processed(
	standard_id: typeof standard.$inferSelect.id
) {
	transactionsFn.begin();
	try {
		const standard_founded = await std.get(db, standard_id);
		if (standard_founded === undefined) {
			throw new Error(
				`Nenhuma transação padrão encontrada (${standard_founded})`
			);
		}

		await iv.mark_as_unprocessed(db, standard_founded.item_value_id);

		// ======================================
		// POST MARKED
		// ======================================
		// atualizar saldo

		const month = standard_founded.scheduled_at.getMonth();
		const year = standard_founded.scheduled_at.getFullYear();
		const data = {
			month,
			year,
			amount: standard_founded.amount,
			cashflow_type: standard_founded.cashflow_type,
		};

		if (standard_founded.transfer_method_code === "cash") {
			// Fluxo do dinheiro
			bup.balance_cash_update_pipeline(db, data, false);
		} else {
			// Fluxo do banco
			bup.balance_bank_update_pipeline(
				db,
				{
					...data,
					transaction_instrument_id: standard_founded.transaction_instrument_id,
				},
				false
			);
		}
		transactionsFn.commit();
	} catch (error) {
		transactionsFn.rollback();
		throw error;
	}
}
