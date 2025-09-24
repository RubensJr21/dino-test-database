import * as btt from "@data_functions/base_transaction_type";
import * as cat from "@data_functions/category";
import * as imt from "@data_functions/installment";
import { db, transactionsFn } from "@database/db-instance";

export async function update(
	installment_id: imt.infer_select["id"],
	data: {
		description?: btt.infer_insert["description"];
		category?: cat.infer_insert["code"];
	}
) {
	transactionsFn.begin();
	try {
		const installment_founded = await imt.get(db, installment_id);
		if (installment_founded === undefined) {
			throw new Error(
				`Nenhuma transação padrão encontrada (${installment_founded})`
			);
		}

		const updates: {
			description?: btt.infer_insert["description"];
			fk_id_category?: cat.infer_insert["id"];
		} = {};

		if (data.description !== undefined) {
			if (data.description.trim().length === 0) {
				throw new Error(`A descrição não pode ser vazia (${data.description})`);
			}
			updates.description = data.description;
		}

		if (data.category !== undefined) {
			const category_founded = await cat.get_by_code(db, data.category);
			if (category_founded === undefined) {
				throw new Error(
					`Nenhuma categoria encontrada com code=${data.category} (${category_founded})`
				);
			}
			updates.fk_id_category = category_founded.id;
		}

		if (
			updates.description !== undefined ||
			updates.fk_id_category !== undefined
		) {
			await btt.update(db, installment_founded.id, updates);
		}
		transactionsFn.commit();
		console.log("installment atualizado!");
	} catch (error) {
		transactionsFn.rollback();
		throw error;
	}
}
