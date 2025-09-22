import { type DatabaseType } from "@database/db-instance";
import { balanceCash, itemValue } from "@database/schema";
import { and, eq } from "drizzle-orm";

type DataType = {
	month: typeof balanceCash.$inferSelect.month;
	year: typeof balanceCash.$inferSelect.year;
	amount: typeof itemValue.$inferInsert.amount;
};

export async function create_balance(db: DatabaseType, data: DataType) {
	// INSERINDO balance_cash
	await db
		.insert(balanceCash)
		.values([
			{
				month: data.month,
				year: data.year,
				planned_amount: data.amount,
				executed_amount: 0,
			},
		])
		.returning();
}

export async function add_amount(
	db: DatabaseType,
	data: {
		id: typeof balanceCash.$inferSelect.id;
		updated_planned_amount: typeof balanceCash.$inferSelect.planned_amount;
	}
) {
	await db
		.update(balanceCash)
		.set({
			planned_amount: data.updated_planned_amount,
		})
		.where(eq(balanceCash.id, data.id));
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
