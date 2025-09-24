/*
-- ======================
-- TABELA: standard
-- ======================
*/

import * as bb from "@data_functions/balance_bank";
import * as bc from "@data_functions/balance_cash";
import * as btt from "@data_functions/base_transaction_type";
import * as iv from "@data_functions/item_value";
import * as std from "@data_functions/standard";
import { db, transactionsFn } from "@database/db-instance";
import { standard } from "@database/schema";
import { getRealAmountValue } from "@playground/utils";

const remove = async (standard_id: typeof standard.$inferSelect.id) => {
	transactionsFn.begin();
	try {
		// 1. Recuperar standard que será removido
		const standard_for_delete = await std.get(db, standard_id);
		if (standard_for_delete === undefined) {
			throw new Error("standard_id inexistente.");
		}

		await std.remove(db, standard_for_delete.id);
		await btt.remove(db, standard_for_delete.id);
		await iv.remove(db, [standard_for_delete.item_value_id]);

		// ======================================
		// POST REMOVE
		// ======================================
		const month = standard_for_delete.scheduled_at.getMonth();
		const year = standard_for_delete.scheduled_at.getFullYear();

		const realAmount = getRealAmountValue(
			standard_for_delete.cashflow_type,
			standard_for_delete.amount,
			true
		);

		if (standard_for_delete.transfer_method_code === "cash") {
			const balance_cash = await bc.get_balance(db, {
				month,
				year,
			});

			if (balance_cash === undefined) {
				throw new Error(
					"Nenhum balanço de dineiro foi encontrado para o período especificado."
				);
			}

			// remover do balanço de balance_cash
			if (standard_for_delete.was_processed) {
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
			const bank_id = standard_for_delete.bank_account_id!;

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

			if (standard_for_delete.was_processed) {
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

		transactionsFn.commit();
		console.log("standard removido!");
	} catch (error) {
		transactionsFn.rollback();
		throw error;
	}
};

async function main() {
	const standard_id_for_delete = 1;
	remove(standard_id_for_delete);
}

main();
