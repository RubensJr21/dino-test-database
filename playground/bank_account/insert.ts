import * as ba from "@data_functions/bank_account";
import { db } from "@database/db-instance";

export async function insertBankAccount(
	nickname: ba.infer_insert["nickname"]
) {
	await ba.insert(db, {
		nickname,
	});
}