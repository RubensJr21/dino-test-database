/*
-- ======================
-- TABELA: recurring
-- OBS:
--   > As seguintes tabelas precisam ter dados:
--     - recurrence_type
--     - transfer_method
--     - transaction_instrument 
--     - category
-- ======================
*/

import * as bb from "@data_functions/balance_bank";
import * as bc from "@data_functions/balance_cash";
import * as btt from "@data_functions/base_transaction_type";
import * as cat from "@data_functions/category";
import * as iv from "@data_functions/item_value";
import * as rt from "@data_functions/recurrence_type";
import * as rec from "@data_functions/recurring";
import * as ti from "@data_functions/transaction_instrument";
import * as tm from "@data_functions/transfer_method";
import { db } from "@database/db-instance";
import {
  getCashflowType,
  getRandomIndex,
  getRandomIntegerBetween,
  getRandomRangeDate,
} from "@playground/utils";

interface DataType {
	description: btt.infer_insert["description"];
	cashflow_type: btt.infer_insert["cashflow_type"];
	category_id: btt.infer_insert["fk_id_category"];
	transaction_instrument_id: ti.infer_select["id"];
	transfer_method_code: tm.infer_select["code"];
	recurrence_type_id: rt.infer_select["id"];
	amount: iv.infer_insert["amount"];
	start_date: rec.infer_insert["start_date"];
	end_date?: rec.infer_insert["end_date"];
}

const insert = async (data: DataType) => {
	const base_transaction_type = await btt.insert(db, {
		description: data.description,
		cashflow_type: data.cashflow_type,
		fk_id_category: data.category_id,
		fk_id_transaction_instrument: data.transaction_instrument_id,
	});

	const [recurring] = await rec.insert(db, {
		id: base_transaction_type[0].id,
		start_date: data.start_date,
		end_date: data.end_date ?? null,
		current_amount: data.amount,
		fk_id_recurrence_type: data.recurrence_type_id,
	});

	const scheduled_at = data.start_date;

	const [item_value] = await iv.insert(db, {
		scheduled_at,
		amount: data.amount,
	});

	await rec.register_item_value(db, {
		fk_id_recurring: recurring.id,
		fk_id_item_value: item_value.id,
	});

	// ======================================
	// POST INSERT
	// ======================================
	const month = item_value.scheduled_at.getMonth();
	const year = item_value.scheduled_at.getFullYear();

	// VERIFICAR EM QUAL BALANÇO ESSE ITEM DEVE SER INSERIDO
	if (data.transfer_method_code === "cash") {
		// inserir no balanço de balance_cash
		await bc.add_amount(db, {
			month,
			year,
			amount: item_value.amount,
			cashflow_type: data.cashflow_type,
		});
	} else {
		// Verificar se já existe
		// Garanto que existe, pois ele não é do tipo 'cash'
		const bank_id = await ti.get_bank_id(db, data.transaction_instrument_id);

		if (bank_id === null) {
			throw new Error(`Erro ao obter o valor de bank_id (${bank_id})`);
		}

		console.log("bank_id:", bank_id);

		await bb.add_amount(db, {
			month,
			year,
			amount: item_value.amount,
			bank_id,
			cashflow_type: data.cashflow_type,
		});
	}

	console.log("recurring inserido!");
};

async function main() {
	// ESCOLHENDO TRANSFER_METHOD
	const transfer_methods = await tm.get_all(db);
	const indexTM = getRandomIndex(transfer_methods.length); // Adicionar lógica interativa
	const method_choose = transfer_methods[indexTM];
	console.log({ transfer_methods, indexTM, method_choose });

	// ESCOLHENDO TRANSACTION_INSTRUMENT
	const transaction_instruments = await ti.get_all_filtered_by_transfer_method(
		db,
		method_choose.code
	);
	const indexTI = getRandomIndex(transaction_instruments.length); // Adicionar lógica interativa
	const selected_transaction_instrument = transaction_instruments[indexTI];
	console.log({
		transaction_instruments,
		indexTI,
		selected_transaction_instrument,
	});

	// ESCOLHENDO CATEGORY
	const categories = await cat.get_all(db);
	const indexC = getRandomIndex(categories.length); // Adicionar lógica interativa
	const selected_category = categories[indexC];
	console.log({ categories, indexC, selected_category });

	// ESCOLHENDO RECURRENCE_TYPE
	const recurrence_types = await rt.get_all(db);
	const indexRT = getRandomIndex(recurrence_types.length); // Adicionar lógica interativa
	const selected_recurrence_type = recurrence_types[indexRT];
	console.log({ recurrence_types, indexRT, selected_recurrence_type });

	const description = "Minha descrição de teste"; // Adicionar lógica interativa
	const cashflow_type = getCashflowType(); // Adicionar lógica interativa

	const rangeDate = getRandomRangeDate();

	const amount = getRandomIntegerBetween(5, 100_000);

	await insert({
		description,
		cashflow_type,
		category_id: selected_category.id,
		transaction_instrument_id: selected_transaction_instrument.id,
		transfer_method_code: selected_transaction_instrument.code,
		recurrence_type_id: selected_recurrence_type.id,
		amount,
		start_date: rangeDate.start_date,
		end_date: rangeDate.end_date,
	});
}

main();
