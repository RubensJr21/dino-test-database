import { type DatabaseType } from "@database/db-instance";
import { balanceBank, baseTransactionType, itemValue } from "@database/schema";
import { and, eq } from "drizzle-orm";

type DataType = Pick<typeof balanceBank.$inferInsert, "month" | "year"> & {
	amount: typeof itemValue.$inferInsert.amount;
	cashflow_type: typeof baseTransactionType.$inferSelect.cashflow_type &
		(-1 | 1);
	bank_id: typeof balanceBank.$inferInsert.fk_id_bank_account;
};

export async function add_amount(db: DatabaseType, data: DataType) {
	// Verificar se já existe supondo que já tenha ano, mes e amount (positivo/negativo)
	const existing = (
		await db
			.select()
			.from(balanceBank)
			.where(
				and(
					eq(balanceBank.fk_id_bank_account, data.bank_id),
					eq(balanceBank.year, data.year),
					eq(balanceBank.month, data.month)
				)
			)
	).shift();
	// Caso não exista
	if (existing === undefined) {
		// INSERINDO balance_bank
		await db.insert(balanceBank).values([
			{
				month: data.month,
				year: data.year,
				planned_amount: data.amount,
				executed_amount: 0,
				fk_id_bank_account: data.bank_id,
			},
		]);
	} else {
		await db
			.update(balanceBank)
			.set({
				planned_amount: existing.planned_amount + data.amount,
			})
			.where(eq(balanceBank.id, existing.id));
	}
}

async function get_balance_bank(db: DatabaseType, data: DataType) {
	return (
		await db
			.select()
			.from(balanceBank)
			.where(
				and(
					eq(balanceBank.fk_id_bank_account, data.bank_id),
					eq(balanceBank.year, data.year),
					eq(balanceBank.month, data.month)
				)
			)
	).shift();
}

export async function remove_amount_processed(
	db: DatabaseType,
	data: DataType
) {
	const balance_bank = await get_balance_bank(db, data);

	if (balance_bank === undefined) {
		throw new Error(
			"Nenhum balanço desta conta bancária foi encontrado para o período especificado."
		);
	}

	await db
		.update(balanceBank)
		.set({
			planned_amount: balance_bank.planned_amount + data.amount,
			executed_amount: balance_bank.executed_amount + data.amount,
		})
		.where(eq(balanceBank.id, balance_bank.id));
}

export async function remove_amount_unprocessed(
	db: DatabaseType,
	data: DataType
) {
	const balance_bank = await get_balance_bank(db, data);

	if (balance_bank === undefined) {
		throw new Error(
			"Nenhum balanço desta conta bancária foi encontrado para o período especificado."
		);
	}

	await db
		.update(balanceBank)
		.set({
			planned_amount: balance_bank.planned_amount + data.amount,
		})
		.where(eq(balanceBank.id, balance_bank.id));
}
