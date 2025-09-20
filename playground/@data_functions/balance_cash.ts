import { type DatabaseType } from "@database/db-instance";
import { balanceCash, baseTransactionType, itemValue } from "@database/schema";
import { getRealAmountValue } from "@playground/utils";
import { and, eq } from "drizzle-orm";

type DataType = Pick<typeof balanceCash.$inferInsert, "month" | "year"> & {
	amount: typeof itemValue.$inferInsert.amount;
	cashflow_type: typeof baseTransactionType.$inferSelect.cashflow_type &
		(-1 | 1);
};

export async function add_amount(db: DatabaseType, data: DataType) {
	// Verificar se já existe supondo que já tenha ano, mes e amount (positivo/negativo)
	const existing = (
		await db
			.select()
			.from(balanceCash)
			.where(
				and(eq(balanceCash.year, data.year), eq(balanceCash.month, data.month))
			)
	).shift();
	const item_value_amount = getRealAmountValue(data.cashflow_type, data.amount);
	// Caso não exista
	if (existing === undefined) {
		// INSERINDO balance_cash
		await db
			.insert(balanceCash)
			.values([
				{
					month: data.month,
					year: data.year,
					planned_amount: item_value_amount,
					executed_amount: 0,
				},
			])
			.returning();
	} else {
		await db
			.update(balanceCash)
			.set({
				planned_amount: existing.planned_amount + item_value_amount,
			})
			.where(eq(balanceCash.id, existing.id));
	}
}

export async function remove_amount_processed(
	db: DatabaseType,
	data: DataType
) {
	// considero que já existe
	const [balance_cash] = await db
		.select()
		.from(balanceCash)
		.where(
			and(eq(balanceCash.year, data.year), eq(balanceCash.month, data.month))
		);

	if (balance_cash === undefined) {
		throw new Error(
			"Nenhum balanço de dinheiro foi encontrado para o período especificado."
		);
	}

	await db
		.update(balanceCash)
		.set({
			planned_amount: balance_cash.planned_amount + data.amount,
			executed_amount: balance_cash.executed_amount + data.amount,
		})
		.where(eq(balanceCash.id, balance_cash.id));
}
export async function remove_amount_unprocessed(
	db: DatabaseType,
	data: DataType
) {
	// considero que já existe
	const [balance_cash] = await db
		.select()
		.from(balanceCash)
		.where(
			and(eq(balanceCash.year, data.year), eq(balanceCash.month, data.month))
		);

	if (balance_cash === undefined) {
		throw new Error(
			"Nenhum balanço de dinheiro foi encontrado para o período especificado."
		);
	}

	await db
		.update(balanceCash)
		.set({
			planned_amount: balance_cash.planned_amount + data.amount,
		})
		.where(eq(balanceCash.id, balance_cash.id));
}
