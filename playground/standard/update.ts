import * as btt from "@data_functions/base_transaction_type";
import * as cat from "@data_functions/category";
import * as std from "@data_functions/standard";
import { db, transactionsFn } from "@database/db-instance";

export async function update(
	standard_id: std.infer_select["id"],
	data: {
		description?: btt.infer_insert["description"];
		category?: cat.infer_insert["code"];
	}
) {
	transactionsFn.beginTransaction();
	try {
		const standard_founded = await std.get(db, standard_id);
		if (standard_founded === undefined) {
			throw new Error(
				`Nenhuma transação padrão encontrada (${standard_founded})`
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
			await btt.update(db, standard_founded.id, updates);
		}

		transactionsFn.commitTransaction();
		console.log("standard atualizado!");
	} catch (error) {
		transactionsFn.rollbackTransaction();
		throw error;
	}
}
