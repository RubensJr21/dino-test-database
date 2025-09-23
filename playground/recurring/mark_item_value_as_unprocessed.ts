import * as bup from "@data_functions/balance_update_pipeline";
import * as iv from "@data_functions/item_value";
import * as rec from "@data_functions/recurring";
import { db } from "@database/db-instance";
import { itemValue, recurring } from "@database/schema";

export async function mark_item_value_as_processed(
	recurring_id: typeof recurring.$inferSelect.id,
	item_value_id: typeof itemValue.$inferSelect.id
) {
	const recurring_founded = await rec.get(db, recurring_id);
	if (recurring_founded === undefined) {
		throw new Error(
			`Nenhuma transação parcelada encontrada (${recurring_founded})`
		);
	}

	const item_value = await rec.get_item_value(
		db,
		recurring_id,
		item_value_id
	);
  
	if (item_value === undefined) {
		throw new Error(`Nenhum valor de parcela encontrado (${item_value})`);
	}

	await iv.mark_as_unprocessed(db, item_value.id);

	// ======================================
	// POST MARKED
	// ======================================
	// atualizar saldo

	const month = item_value.scheduled_at.getMonth();
	const year = item_value.scheduled_at.getFullYear();
	const data = {
		month,
		year,
		amount: item_value.amount,
		cashflow_type: recurring_founded.cashflow_type,
	};

	if (recurring_founded.transfer_method_code === "cash") {
		// Fluxo do dinheiro
		bup.balance_cash_update_pipeline(db, data, true);
	} else {
		// Fluxo do banco
		bup.balance_bank_update_pipeline(
			db,
			{
				...data,
				transaction_instrument_id:
					recurring_founded.transaction_instrument_id,
			},
			true
		);
	}
}
