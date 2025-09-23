import * as ba from "@data_functions/bank_account";
import { db } from "@database/db-instance";
import { bankAccount } from "@database/schema";

export async function insertBankAccount(
	nickname: typeof bankAccount.$inferInsert.nickname
) {
	await ba.insert(db, {
		nickname,
	});
}