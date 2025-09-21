/*
-- ======================
-- TABELA: recurring
-- ======================
*/

import * as bb from "@data_functions/balance_bank";
import * as bc from "@data_functions/balance_cash";
import * as btt from "@data_functions/base_transaction_type";
import * as iv from "@data_functions/item_value";
import * as rec from "@data_functions/recurring";
import { db } from "@database/db-instance";
import { recurring } from "@database/schema";
import { eq } from "drizzle-orm";

const remove = async (recurring_id: typeof recurring.$inferSelect.id) => {
	const recurring_for_delete = await rec.get(db, recurring_id);
	if (recurring_for_delete === undefined) {
		throw new Error("recurring_id inexistente.");
	}

	await db.delete(recurring).where(eq(recurring.id, recurring_for_delete.id));
	await btt.remove(db, recurring_for_delete.id);

	// Para cada item
	const item_values = await rec.get_all_item_values(
		db,
		recurring_for_delete.id
	);

	if (item_values.length === 0) {
		throw new Error(
			"Nenhum item valor foi encontrado para essa transação recorrente."
		);
	}

	await iv.remove(
		db,
		item_values.map(({ id }) => id) as [
			iv.infer_select["id"],
			...iv.infer_select["id"][]
		]
	);

	// ======================================
	// POST REMOVE
	// ======================================
	// Para cada item_value a ser removido é necessário remover o valor no mês do ano
	item_values.forEach(async (item_value) => {
		const month = item_value.scheduled_at.getMonth();
		const year = item_value.scheduled_at.getFullYear();

		const data = {
			month,
			year,
			amount: item_value.amount,
			cashflow_type: item_value.cashflow_type,
		};

		if (item_value.transfer_method_code === "cash") {
			// remover do balanço de balance_cash
			if (item_value.was_processed) {
				await bc.remove_amount_processed(db, data);
			} else {
				await bc.remove_amount_unprocessed(db, data);
			}
		} else {
			// Garanto que existe, pois ele não é do tipo 'cash'
			const bank_id = item_value.bank_account_id!;

			const data_with_bank_id = {
				...data,
				bank_id,
			};

			if (item_value.was_processed) {
				await bb.remove_amount_processed(db, data_with_bank_id);
			} else {
				await bb.remove_amount_unprocessed(db, data_with_bank_id);
			}
		}
	});
  console.log("recurring removido!");
};

async function main() {
	const recurring_id_for_delete = 1;
	remove(recurring_id_for_delete);
}

main();