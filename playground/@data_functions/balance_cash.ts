import { type DatabaseType } from "@database/db-instance";
import { balanceCash, baseTransactionType, itemValue } from "@database/schema";
import { getRealAmountValue } from "@playground/utils";
import { and, eq } from "drizzle-orm";

type DataType = Pick<typeof balanceCash.$inferInsert, "month" | "year"> & {
	amount: typeof itemValue.$inferInsert.amount;
	cashflow_type: typeof baseTransactionType.$inferSelect.cashflow_type;
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

export async function get_balance(
	db: DatabaseType,
	data: Pick<DataType, "month" | "year">
) {
	return (
		await db
			.select()
			.from(balanceCash)
			.where(
				and(eq(balanceCash.year, data.year), eq(balanceCash.month, data.month))
			)
	).shift();
}

export async function remove_balance(
	db: DatabaseType,
	balance_id: typeof balanceCash.$inferSelect.id
) {
	await db.delete(balanceCash).where(eq(balanceCash.id, balance_id));
}

export async function remove_amount_processed(
	db: DatabaseType,
	data: {
		balance_id: typeof balanceCash.$inferSelect.id;
		updated_planned_ammount: typeof balanceCash.$inferSelect.planned_amount;
		updated_executed_ammount: typeof balanceCash.$inferSelect.executed_amount;
	}
) {
	await db
		.update(balanceCash)
		.set({
			planned_amount: data.updated_planned_ammount,
			executed_amount: data.updated_executed_ammount,
		})
		.where(eq(balanceCash.id, data.balance_id));
}
export async function remove_amount_unprocessed(
	db: DatabaseType,
	data: {
		balance_id: typeof balanceCash.$inferSelect.id;
		updated_planned_ammount: typeof balanceCash.$inferSelect.planned_amount;
	}
) {
	await db
		.update(balanceCash)
		.set({
			planned_amount: data.updated_planned_ammount,
		})
		.where(eq(balanceCash.id, data.balance_id));
}
