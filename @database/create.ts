import { randomIntBetween } from "@playground/utils";
import { db } from "./db-instance";
import {
  bankAccount,
  category,
  recurrenceType,
  transactionInstrument,
  transferMethod,
} from "./schema";

(async () => {
	await populate_system_tables(db);
	await populate_initial_tests_values(db);
})();

export async function populate_system_tables(
	database: typeof db
): Promise<void> {
	await database
		.insert(category)
		.values([
			{ code: "education" },
			{ code: "health" },
			{ code: "entertainment" },
			{ code: "food" },
			{ code: "housing" },
			{ code: "transportation" },
			{ code: "services" },
			{ code: "shopping" },
			{ code: "taxes" },
			{ code: "others" },
		]);

	await database
		.insert(transferMethod)
		.values([{ code: "pix" }, { code: "debit" }, { code: "cash" }]);

	await database
		.insert(recurrenceType)
		.values([{ code: "monthly" }, { code: "yearly" }]);
}

export async function populate_initial_tests_values(
	database: typeof db
): Promise<void> {
	const bank_accounts = await database
		.insert(bankAccount)
		.values([
			{ nickname: "Nubank Conta Corrente" },
			{ nickname: "Itaú Conta Corrente" },
			{ nickname: "Caixa Poupança" },
		])
		.returning({ id: bankAccount.id });

	const transfer_methods = await database.select().from(transferMethod);

	const NUMBERS_OF_TI = randomIntBetween(2, 15);
	console.log({ NUMBERS_OF_TI });
	for (let i = 0; i < NUMBERS_OF_TI; i++) {
		// Selecionar método de transferência
		const randomIndexTM = Math.floor(Math.random() * transfer_methods.length);
		const selected_transfer_method = transfer_methods[randomIndexTM];

		// Caso não seja cash selecionar o banco
		let selected_bank_account_id;
		if (selected_transfer_method.code === "cash") {
			selected_bank_account_id = null;
		} else {
			const randomIndexBA = Math.floor(Math.random() * transfer_methods.length);
			selected_bank_account_id = bank_accounts[randomIndexBA].id;
		}

		await database.insert(transactionInstrument).values([
			{
				fk_id_transfer_method: selected_transfer_method.id,
				fk_id_bank_account: selected_bank_account_id,
			},
		]);
	}
}
