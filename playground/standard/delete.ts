/*
-- ======================
-- TABELA: standard
-- OBS:
--   > As seguintes tabelas precisam ter dados:
--     - transaction_instrument 
--     - category
-- ======================
*/

import * as bb from "@data_functions/balance_bank";
import * as bc from "@data_functions/balance_cash";
import * as btt from "@data_functions/base_transaction_type";
import * as iv from "@data_functions/item_value";
import * as std from "@data_functions/standard";
import { db } from "@database/db-instance";
import { standard } from "@database/schema";
import { eq } from "drizzle-orm";

(async () => {
	// 1. Recuperar standard que será removido
	const standard_for_delete = await std.get(db, 1);
	if (standard_for_delete === undefined) {
		throw new Error("standard_id inexistente.");
	}

	await db.delete(standard).where(eq(standard.id, standard_for_delete.id));
	await btt.remove(db, standard_for_delete.id);
	await iv.remove(db, [standard_for_delete.id]);

	// ======================================
	// POST REMOVE
	// ======================================
	const month = standard_for_delete.scheduled_at.getMonth();
	const year = standard_for_delete.scheduled_at.getFullYear();

	const data = {
		month,
		year,
		amount: standard_for_delete.amount,
		cashflow_type: standard_for_delete.cashflow_type as -1 | 1,
	};

	if (standard_for_delete.transfer_method_code === "cash") {
		// remover do balanço de balance_cash
		if (standard_for_delete.was_processed) {
			await bc.remove_amount_processed(db, data);
		} else {
			await bc.remove_amount_unprocessed(db, data);
		}
	} else {
		// Garanto que existe, pois ele não é do tipo 'cash'
		const bank_id = standard_for_delete.bank_account_id!;

		const data_with_bank_id = {
			...data,
			bank_id,
		};

		if (standard_for_delete.was_processed) {
			await bb.remove_amount_processed(db, data_with_bank_id);
		} else {
			await bb.remove_amount_unprocessed(db, data_with_bank_id);
		}
	}

	console.log("standard removido!");
})();
