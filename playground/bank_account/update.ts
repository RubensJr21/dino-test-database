import * as ba from "@data_functions/bank_account";
import { db } from "@database/db-instance";

export async function insertBankAccount(
  bank_id: ba.infer_select["id"],
	new_nickname: ba.infer_select["nickname"]
) {
	await ba.update_nickname(db, {
    bank_id,
		nickname: new_nickname,
	});
}