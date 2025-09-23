import * as ba from "@data_functions/bank_account";
import * as ti from "@data_functions/transaction_instrument";
import * as tm from "@data_functions/transfer_method";
import { db } from "@database/db-instance";

export async function insertBankAccount(
	nickname: ba.infer_insert["nickname"],
	methods_enable: tm.infer_select["code"][]
) {
	if (methods_enable.length === 0) {
		throw new Error(
			"É necessário informar pelo menos 1 método de transferência"
		);
	}

	const bank_account = await ba.insert(db, {
		nickname,
	});

	if (bank_account === undefined) {
		throw new Error("Erro ao criar conta bancária.");
	}

	const transfer_methods = await tm.get_all_filtered_by_codes(
		db,
		methods_enable
	);

	if (transfer_methods.length === 0) {
		throw new Error(
			"Não foi possível encontrar nenhum dos métodos de transferência informado."
		);
	}

	if (transfer_methods.length !== methods_enable.length) {
		const invalids_method_codes = tm.diff_method_codes(
			transfer_methods,
			methods_enable
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
