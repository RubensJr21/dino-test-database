import { type DatabaseType } from "@database/db-instance";
import { balanceBank, baseTransactionType, itemValue } from "@database/schema";
import { and, eq } from "drizzle-orm";

type DataType = {
	month: typeof balanceBank.$inferSelect.month;
	year: typeof balanceBank.$inferSelect.year;
	amount: typeof itemValue.$inferInsert.amount;
	cashflow_type: typeof baseTransactionType.$inferSelect.cashflow_type;
	bank_id: typeof balanceBank.$inferInsert.fk_id_bank_account;
};

export async function create_balance(db: DatabaseType, data: DataType) {
	await db
		.insert(balanceBank)
		.values([
			{
				month: data.month,
				year: data.year,
				planned_amount: data.amount,
				executed_amount: 0,
				fk_id_bank_account: data.bank_id,
			},
		])
		.returning();
}

export async function add_amount(
	db: DatabaseType,
	data: {
		id: typeof balanceBank.$inferSelect.id;
		updated_planned_amount: typeof balanceBank.$inferSelect.planned_amount;
	}
) {
	await db
		.update(balanceBank)
		.set({
			planned_amount: data.updated_planned_amount,
		})
		.where(eq(balanceBank.id, data.id));
}

export async function get_balance(
	db: DatabaseType,
	data: Pick<DataType, "bank_id" | "month" | "year">
) {
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

export async function remove_balance(
	db: DatabaseType,
	balance_id: typeof balanceBank.$inferSelect.id
) {
	await db.delete(balanceBank).where(eq(balanceBank.id, balance_id));
}

export async function remove_amount_processed(
	db: DatabaseType,
	data: {
		balance_id: typeof balanceBank.$inferSelect.id;
		updated_planned_ammount: typeof balanceBank.$inferSelect.planned_amount;
		updated_executed_ammount: typeof balanceBank.$inferSelect.executed_amount;
	}
) {
	await db
		.update(balanceBank)
		.set({
			planned_amount: data.updated_planned_ammount,
			executed_amount: data.updated_executed_ammount,
		})
		.where(eq(balanceBank.id, data.balance_id));
}

export async function remove_amount_unprocessed(
	db: DatabaseType,
	data: {
		balance_id: typeof balanceBank.$inferSelect.id;
		updated_planned_ammount: typeof balanceBank.$inferSelect.planned_amount;
	}
) {
	await db
		.update(balanceBank)
		.set({
			planned_amount: data.updated_planned_ammount,
		})
		.where(eq(balanceBank.id, data.balance_id));
}
