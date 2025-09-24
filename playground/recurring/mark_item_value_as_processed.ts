import * as bup from "@data_functions/balance_update_pipeline";
import * as imt from "@data_functions/installment";
import * as iv from "@data_functions/item_value";
import { db, transactionsFn } from "@database/db-instance";
import { installment, itemValue } from "@database/schema";

export async function mark_item_value_as_processed(
	installment_id: typeof installment.$inferSelect.id,
	item_value_id: typeof itemValue.$inferSelect.id
) {
	transactionsFn.begin();
	try {
		const installment_founded = await imt.get(db, installment_id);
		if (installment_founded === undefined) {
			throw new Error(
				`Nenhuma transação parcelada encontrada (${installment_founded})`
			);
		}

		const item_value = await imt.get_item_value(
			db,
			installment_id,
			item_value_id
		);

		if (item_value === undefined) {
			throw new Error(`Nenhum valor de parcela encontrado (${item_value})`);
		}

		await iv.mark_as_processed(db, item_value.id);

		// ======================================
		// POST MARKED
		// ======================================
		const month = item_value.scheduled_at.getMonth();
		const year = item_value.scheduled_at.getFullYear();
		const data = {
			month,
			year,
			amount: item_value.amount,
			cashflow_type: installment_founded.cashflow_type,
		};

		if (installment_founded.transfer_method_code === "cash") {
			// Fluxo do dinheiro
			bup.balance_cash_update_pipeline(db, data);
		} else {
			// Fluxo do banco
			bup.balance_bank_update_pipeline(db, {
				...data,
				transaction_instrument_id:
					installment_founded.transaction_instrument_id,
			});
		}
		transactionsFn.commit();
	} catch (error) {
		transactionsFn.rollback();
		throw error;
	}
}
