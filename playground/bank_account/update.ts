import * as ba from "@data_functions/bank_account";
import * as ti from "@data_functions/transaction_instrument";
import * as tm from "@data_functions/transfer_method";
import { db } from "@database/db-instance";

export async function insertBankAccount(
	bank_id: ba.infer_select["id"],
	new_nickname: ba.infer_select["nickname"],
	methods_enable: tm.infer_select["code"][]
) {
	if (methods_enable.length === 0) {
		throw new Error(
			"É necessário informar pelo menos 1 método de transferência"
		);
	}

	const bank_account = await ba.get(db, bank_id);

	if (bank_account === undefined) {
		throw new Error("Nenhuma conta bancária foi encontrada para esse id.");
	}

	const transaction_instruments = await ba.get_all_transaction_instruments(
		db,
		bank_account.id
	);

	const methods_enable_set = new Set(methods_enable);
	const transaction_instrument_for_delete = transaction_instruments.filter(
		(transaction_instrument) => {
			return !methods_enable_set.has(transaction_instrument.code);
		}
	);

	const methods_for_insert = methods_enable.filter((method) => {
		const index = transaction_instruments.findIndex(({ code }) => {
			return code === method;
		});
		return index !== -1;
	});

	if (transaction_instrument_for_delete.length > 0) {
		await ti.delete_transfer_methods(
			db,
			transaction_instrument_for_delete.map(({ id }) => id)
		);
	}

	if (methods_for_insert.length > 0) {
		const transfer_methods = await tm.get_all_filtered_by_codes(
			db,
			methods_for_insert
		);

		if (transfer_methods.length !== methods_for_insert.length) {
			const invalids_method_codes = tm.diff_method_codes(
				transfer_methods,
				methods_for_insert
			);
			throw new Error(
				`Os métodos ${invalids_method_codes.join(", ")} não foram encontrados.`
			);
		}

		await ti.register_transfer_methods(
			db,
			transfer_methods.map((transfer_method) => ({
				fk_id_transfer_method: transfer_method.id,
				fk_id_bank_account: bank_account.id,
			}))
		);
	}

	await ba.update_nickname(db, {
		bank_id,
		nickname: new_nickname,
	});
}
