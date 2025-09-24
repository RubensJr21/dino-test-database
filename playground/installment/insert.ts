/*
-- ======================
-- TABELA: installment
-- OBS:
--   > As seguintes tabelas precisam ter dados:
--     - transfer_method
--     - transaction_instrument 
--     - category
-- ======================
*/

import * as bip from "@data_functions/balance_insert_pipeline";
import * as btt from "@data_functions/base_transaction_type";
import * as cat from "@data_functions/category";
import * as imt from "@data_functions/installment";
import * as iv from "@data_functions/item_value";
import * as rt from "@data_functions/recurrence_type";
import * as ti from "@data_functions/transaction_instrument";
import * as tm from "@data_functions/transfer_method";
import { db, transactionsFn } from "@database/db-instance";
import {
  drawCashflowType,
  randomIndex,
  randomIntBetween,
  randomRangeDate,
} from "@playground/utils";

interface DataType {
	description: btt.infer_insert["description"];
	cashflow_type: btt.infer_insert["cashflow_type"];
	category_id: btt.infer_insert["fk_id_category"];

	transaction_instrument_id: ti.infer_select["id"];

	transfer_method_code: tm.infer_select["code"];

	start_date: imt.infer_insert["start_date"];

	installments_number: imt.infer_select["installments_number"];
	total_amount: imt.infer_select["total_amount"];
}

const insert = async (data: DataType) => {
	transactionsFn.beginTransaction();
	try {
		const base_transaction_type = await btt.insert(db, {
			description: data.description,
			cashflow_type: data.cashflow_type,
			fk_id_category: data.category_id,
			fk_id_transaction_instrument: data.transaction_instrument_id,
		});

		const [installment] = await imt.insert(db, {
			id: base_transaction_type[0].id,
			start_date: data.start_date,
			installments_number: data.installments_number,
			total_amount: data.total_amount,
		});

		const scheduled_at = data.start_date;

		const items_values: Array<{
			item_value_id: number;
			month: number;
			year: number;
		}> = [];

		const installments = imt.calculate_installments(
			data.total_amount,
			data.installments_number
		);

		for (let i = 0; i < data.installments_number; i++) {
			const [item_value] = await iv.insert(db, {
				scheduled_at,
				// Fazendo assim o primeiro item terá o valor dele
				// E para as execuções seguintes o valor ficará fixado em 1 (posição 2)
				amount: installments[Math.min(i, 1)],
			});

			await imt.register_item_value(db, {
				fk_id_installment: installment.id,
				fk_id_item_value: item_value.id,
			});
			const month = item_value.scheduled_at.getMonth();
			const year = item_value.scheduled_at.getFullYear();

			items_values.push({
				item_value_id: item_value.id,
				month,
				year,
			});

			// ======================================
			// POST INSERT
			// ======================================
			// VERIFICAR EM QUAL BALANÇO ESSE ITEM DEVE SER INSERIDO
			if (data.transfer_method_code === "cash") {
				bip.balance_cash_insert_pipeline(db, {
					month,
					year,
					cashflow_type: data.cashflow_type,
					amount: item_value.amount,
				});
			} else {
				bip.balance_bank_insert_pipeline(db, {
					month,
					year,
					cashflow_type: data.cashflow_type,
					amount: item_value.amount,
					transaction_instrument_id: data.transaction_instrument_id,
				});
			}
			console.log("installment inserido!");
		}
		transactionsFn.commitTransaction();
	} catch (error) {
		transactionsFn.rollbackTransaction();
		throw error;
	}
};

async function main() {
	// ESCOLHENDO TRANSFER_METHOD
	const transfer_methods = await tm.get_all(db);
	const indexTM = randomIndex(transfer_methods.length); // Adicionar lógica interativa
	const method_choose = transfer_methods[indexTM];
	console.log({ transfer_methods, indexTM, method_choose });

	// ESCOLHENDO TRANSACTION_INSTRUMENT
	const transaction_instruments = await ti.get_all_filtered_by_transfer_method(
		db,
		method_choose.code
	);
	const indexTI = randomIndex(transaction_instruments.length); // Adicionar lógica interativa
	const selected_transaction_instrument = transaction_instruments[indexTI];
	console.log({
		transaction_instruments,
		indexTI,
		selected_transaction_instrument,
	});

	// ESCOLHENDO CATEGORY
	const categories = await cat.get_all(db);
	const indexC = randomIndex(categories.length); // Adicionar lógica interativa
	const selected_category = categories[indexC];
	console.log({ categories, indexC, selected_category });

	// ESCOLHENDO RECURRENCE_TYPE
	const recurrence_types = await rt.get_all(db);
	const indexRT = randomIndex(recurrence_types.length); // Adicionar lógica interativa
	const selected_recurrence_type = recurrence_types[indexRT];
	console.log({ recurrence_types, indexRT, selected_recurrence_type });

	const description = "Minha descrição de teste"; // Adicionar lógica interativa
	const cashflow_type = drawCashflowType(); // Adicionar lógica interativa

	const rangeDate = randomRangeDate();

	const total_amount = randomIntBetween(5_000, 200_000);

	const installments_number = randomIntBetween(1, 2);

	await insert({
		description,
		cashflow_type,
		category_id: selected_category.id,
		transaction_instrument_id: selected_transaction_instrument.id,
		transfer_method_code: selected_transaction_instrument.code,
		total_amount,
		start_date: rangeDate.start_date,
		installments_number,
	});
}

main();
