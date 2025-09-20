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
import * as cat from "@data_functions/category";
import * as iv from "@data_functions/item_value";
import * as std from "@data_functions/standard";
import * as ti from "@data_functions/transaction_instrument";
import * as tm from "@data_functions/transfer_method";
import { db } from "@database/db-instance";
import {
	getCashflowType,
	getRandomFutureDate,
	getRandomIndex,
	getRandomIntegerBetween,
} from "@playground/utils";

(async () => {
	const transfer_methods = await tm.get_all(db);
	const indexTM = getRandomIndex(transfer_methods.length); // Adicionar lógica interativa
	const method_choose = transfer_methods[indexTM];
	console.log({ transfer_methods, indexTM, method_choose });

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

	const categories = await cat.get_all(db);
	const indexC = getRandomIndex(categories.length); // Adicionar lógica interativa
	const selected_category = categories[indexC];
	console.log({ categories, indexC, selected_category });

	const description = "Minha descrição de teste"; // Adicionar lógica interativa

	// 1.5. Sortear o cashflow_type (-1 = saída, 1 = entrada)
	const cashflow_type = getCashflowType(); // Adicionar lógica interativa

	const base_transaction_type = await btt.insert(db, {
		description,
		cashflow_type,
		fk_id_category: selected_category.id,
		fk_id_transaction_instrument: selected_transaction_instrument.id,
	});

	const [item_value] = await iv.insert(db, {
		scheduled_at: getRandomFutureDate(getRandomIntegerBetween(0, 120)),
		amount: getRandomIntegerBetween(5, 100_000),
	});

	await std.insert(db, {
		id: base_transaction_type[0].id,
		fk_id_item_value: item_value.id,
	});

	// ======================================
	// POST INSERT
	// ======================================
	const month = item_value.scheduled_at.getMonth();
	const year = item_value.scheduled_at.getFullYear();

	// VERIFICAR EM QUAL BALANÇO ESSE ITEM DEVE SER INSERIDO
	if (selected_transaction_instrument.code === "cash") {
		// inserir no balanço de balance_cash
		await bc.add_amount(db, {
			month,
			year,
			amount: item_value.amount,
			cashflow_type: cashflow_type,
		});
	} else {
		// Verificar se já existe
		// Garanto que existe, pois ele não é do tipo 'cash'
		const bank_id = await ti.get_bank_id(
			db,
			selected_transaction_instrument.id
		);

		if (bank_id === null) {
			console.log({ selected_transaction_instrument });
			throw new Error(`Erro ao obter o valor de bank_id (${bank_id})`);
		}

		console.log("bank_id:", bank_id);

		await bb.add_amount(db, {
			month,
			year,
			amount: item_value.amount,
			bank_id,
			cashflow_type: cashflow_type,
		});
	}

	console.log("standard inserido!");
})();
