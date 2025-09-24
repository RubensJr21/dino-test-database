/*
-- ======================
-- TABELA: installment
-- ======================
*/

import * as bb from "@data_functions/balance_bank";
import * as bc from "@data_functions/balance_cash";
import * as btt from "@data_functions/base_transaction_type";
import * as imt from "@data_functions/installment";
import * as iv from "@data_functions/item_value";
import { db, transactionsFn } from "@database/db-instance";
import { installment } from "@database/schema";
import { getRealAmountValue } from "@playground/utils";

const remove = async (installment_id: typeof installment.$inferSelect.id) => {
	transactionsFn.beginTransaction();
	try {
		const installment_for_delete = await imt.get(db, installment_id);
		if (installment_for_delete === undefined) {
			throw new Error("installment_id inexistente.");
		}

		await imt.remove(db, installment_for_delete.id);
		await btt.remove(db, installment_for_delete.id);

		// Para cada item
		const item_values = await imt.get_all_item_values(
			db,
			installment_for_delete.id
		);

		if (item_values.length === 0) {
			throw new Error(
				"Nenhum item valor foi encontrado para essa transação parcelada."
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

			const realAmount = getRealAmountValue(
				installment_for_delete.cashflow_type,
				item_value.amount,
				true
			);

			if (item_value.transfer_method_code === "cash") {
				const balance_cash = await bc.get_balance(db, {
					month,
					year,
				});

				if (balance_cash === undefined) {
					throw new Error(
						"Nenhum balanço de dinheiro foi encontrado para o período especificado."
					);
				}

				// remover do balanço de balance_cash
				if (item_value.was_processed) {
					await bc.remove_amount_processed(db, {
						balance_id: balance_cash.id,
						updated_planned_amount: balance_cash.planned_amount + realAmount,
						updated_executed_amount: balance_cash.executed_amount + realAmount,
					});
				} else {
					await bc.remove_amount_unprocessed(db, {
						balance_id: balance_cash.id,
						updated_planned_amount: balance_cash.planned_amount + realAmount,
					});
				}
			} else {
				// Garanto que existe, pois ele não é do tipo 'cash'
				const bank_id = item_value.bank_account_id!;

				const balance_bank = await bb.get_balance(db, {
					bank_id,
					month,
					year,
				});

				if (balance_bank === undefined) {
					throw new Error(
						"Nenhum balanço desta conta bancária foi encontrado para o período especificado."
					);
				}

				if (item_value.was_processed) {
					await bb.remove_amount_processed(db, {
						balance_id: balance_bank.id,
						updated_planned_amount: balance_bank.planned_amount + realAmount,
						updated_executed_amount: balance_bank.executed_amount + realAmount,
					});
				} else {
					await bb.remove_amount_unprocessed(db, {
						balance_id: balance_bank.id,
						updated_planned_amount: balance_bank.planned_amount + realAmount,
					});
				}
			}
		});
		transactionsFn.commitTransaction();
		console.log("installment removido!");
	} catch (error) {
		transactionsFn.rollbackTransaction();
		throw error;
	}
};

async function main() {
	const installment_id_for_delete = 1;
	remove(installment_id_for_delete);
}

main();
