import * as ba from "@data_functions/bank_account";
import * as ti from "@data_functions/transaction_instrument";
import * as tm from "@data_functions/transfer_method";
import { db, transactionsFn } from "@database/db-instance";

function allCodesFounded<T, U>(vec_one: T[], vec_two: U[]) {
	return vec_one.length === vec_two.length;
}

function hasCodeToInsert<T>(vec: T[]) {
	return vec.length > 0;
}
function hasCodeToDisable<T>(vec: T[]) {
	return vec.length > 0;
}

export async function insertBankAccount(data: {
	id: ba.infer_select["id"];
	new_nickname?: ba.infer_select["nickname"];
	methods_enable: tm.infer_select["code"][];
}) {
  transactionsFn.begin();
	try {
		if (data.methods_enable.length === 0) {
			throw new Error(
				"É necessário informar pelo menos 1 método de transferência"
			);
		}

		const bank_account = await ba.get(db, data.id);

		if (bank_account === undefined) {
			throw new Error("Nenhuma conta bancária foi encontrada para esse id.");
		}

		// Os métodos de transferência obtidos serão comparados com os recebidos
		const transaction_instruments = await ba.get_all_transaction_instruments(
			db,
			bank_account.id
		);

		// Aqueles que estiverem cadastrados mas não estiverem na lista recebida serão desabilitados
		const methods_enable_set = new Set(data.methods_enable);
		const transaction_instrument_for_disable = transaction_instruments.filter(
			(transaction_instrument) => {
				return !methods_enable_set.has(transaction_instrument.code);
			}
		);

		if (hasCodeToDisable(transaction_instrument_for_disable)) {
			await ti.disable_transfer_methods(
				db,
				transaction_instrument_for_disable.map(({ id }) => id)
			);
		}

		// Aqueles que não estiverem cadastrados ainda serão verificados e inseridos se tudo estiver correto
		const methods_for_insert = data.methods_enable.filter((method) => {
			const index = transaction_instruments.findIndex(({ code }) => {
				return code === method;
			});
			return index === -1;
		});

		if (hasCodeToInsert(methods_for_insert)) {
			const transfer_methods = await tm.get_all_filtered_by_codes(
				db,
				methods_for_insert
			);

			if (allCodesFounded(transfer_methods, methods_for_insert)) {
				const invalids_method_codes = tm.diff_method_codes(
					transfer_methods,
					methods_for_insert
				);
				throw new Error(
					`Os métodos ${invalids_method_codes.join(
						", "
					)} não foram encontrados.`
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

		if (
			data.new_nickname !== undefined &&
			data.new_nickname !== bank_account.nickname
		) {
			await ba.update_nickname(db, {
				bank_id: bank_account.id,
				nickname: data.new_nickname,
			});
		}

    transactionsFn.commit();
	} catch (error) {
    transactionsFn.rollback();
		throw error;
	}
}
