import * as btt from "@data_functions/base_transaction_type";
import * as cat from "@data_functions/category";
import * as rec from "@data_functions/recurring";
import { db } from "@database/db-instance";

export async function update(
	recurring_id: rec.infer_select["id"],
	data: {
		description?: btt.infer_insert["description"];
		category?: cat.infer_insert["code"];
		current_amount?: rec.infer_select["current_amount"];
	}
) {
	const recurring_founded = await rec.get(db, recurring_id);
	if (recurring_founded === undefined) {
		throw new Error(
			`Nenhuma transação padrão encontrada (${recurring_founded})`
		);
	}

	const updates: {
		description?: btt.infer_insert["description"];
		fk_id_category?: cat.infer_insert["id"];
		current_amount?: rec.infer_select["current_amount"];
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
  
  if(data.current_amount !== undefined) {
    if(data.current_amount <= 0) {
      throw new Error(`O valor atual não pode ser negativo nem 0 (zero) (${data.current_amount})`);
    }
    updates.current_amount = data.current_amount;
  }

	if (
		updates.description !== undefined ||
		updates.fk_id_category !== undefined ||
		data.current_amount !== undefined
	) {
		await btt.update(db, recurring_founded.id, updates);
	}
}
