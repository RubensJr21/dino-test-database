import { integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";

// ======================
// category
// ======================
export const category = sqliteTable("category", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	code: text("code").notNull(),
});

// ======================
// transfer_method
// ======================
export const transferMethod = sqliteTable("transfer_method", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	code: text("code").notNull(),
});

// ======================
// bank_account
// ======================
export const bankAccount = sqliteTable("bank_account", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	nickname: text("nickname").notNull(),
});

// ======================
// transaction_instrument
// ======================
export const transactionInstrument = sqliteTable("transaction_instrument", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	fk_id_transfer_method: integer("fk_id_transfer_method")
		.notNull()
		.references(() => transferMethod.id),
	fk_id_bank_account: integer("fk_id_bank_account").references(
		() => bankAccount.id
	),
	is_enabled: integer("is_enabled", { mode: "boolean" })
		.notNull()
		.default(true),
});

// ======================
// base_transaction_type
// ======================
export const baseTransactionType = sqliteTable("base_transaction_type", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	description: text("description").notNull(),
	cashflow_type: integer("cashflow_type").$type<Cashflow_Type>().notNull(),
	fk_id_transaction_instrument: integer("fk_id_transaction_instrument")
		.notNull()
		.references(() => transactionInstrument.id),
	fk_id_category: integer("fk_id_category")
		.notNull()
		.references(() => category.id),
});

// ======================
// item_value
// ======================
export const itemValue = sqliteTable("item_value", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	scheduled_at: integer("scheduled_at", { mode: "timestamp" }).notNull(),
	amount: integer("amount").notNull(), // centavos
	was_processed: integer("was_processed", { mode: "boolean" })
		.notNull()
		.default(false),
});

// ======================
// standard
// ======================
export const standard = sqliteTable("standard", {
	id: integer("id")
		.primaryKey({ autoIncrement: true })
		.references(() => baseTransactionType.id),
	fk_id_item_value: integer("fk_id_item_value")
		.notNull()
		.references(() => itemValue.id),
});

// ======================
// recurrence_type
// ======================
export const recurrenceType = sqliteTable("recurrence_type", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	code: text("code").notNull().unique(),
});

// ======================
// recurring
// ======================
export const recurring = sqliteTable("recurring", {
	id: integer("id")
		.primaryKey({ autoIncrement: true })
		.references(() => baseTransactionType.id),
	start_date: integer("start_date", { mode: "timestamp" }).notNull(),
	end_date: integer("end_date", { mode: "timestamp" }),
	current_amount: integer("current_amount").notNull(), // centavos
	fk_id_recurrence_type: integer("fk_id_recurrence_type")
		.notNull()
		.references(() => recurrenceType.id),
});

// ======================
// recurring_item_value
// ======================
export const recurringItemValue = sqliteTable("recurring_item_value", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	fk_id_recurring: integer("fk_id_recurring")
		.notNull()
		.references(() => recurring.id),
	fk_id_item_value: integer("fk_id_item_value")
		.notNull()
		.references(() => itemValue.id),
});

// ======================
// installment
// ======================
export const installment = sqliteTable("installment", {
	id: integer("id")
		.primaryKey({ autoIncrement: true })
		.references(() => baseTransactionType.id),
	start_date: integer("start_date", { mode: "timestamp" }).notNull(),
	installments_number: integer("installments_number").notNull(),
	total_amount: integer("total_amount").notNull(), // centavos
});

// ======================
// installment_item_value
// ======================
export const installmentItemValue = sqliteTable("installment_item_value", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	fk_id_installment: integer("fk_id_installment")
		.notNull()
		.references(() => installment.id),
	fk_id_item_value: integer("fk_id_item_value")
		.notNull()
		.references(() => itemValue.id),
});

// ======================
// balance_bank
// ======================
export const balanceBank = sqliteTable(
	"balance_bank",
	{
		id: integer("id").primaryKey({ autoIncrement: true }),
		fk_id_bank_account: integer("fk_id_bank_account")
			.notNull()
			.references(() => bankAccount.id),
		month: integer("month").notNull(),
		year: integer("year").notNull(),
		planned_amount: integer("planned_amount").notNull(),
		executed_amount: integer("executed_amount").notNull(),
	},
	(table) => ({
		uniq: unique().on(table.fk_id_bank_account, table.month, table.year),
	})
);

// ======================
// balance_cash
// ======================
export const balanceCash = sqliteTable(
	"balance_cash",
	{
		id: integer("id").primaryKey({ autoIncrement: true }),
		month: integer("month").notNull(),
		year: integer("year").notNull(),
		planned_amount: integer("planned_amount").notNull(),
		executed_amount: integer("executed_amount").notNull(),
	},
	(table) => ({
		uniq: unique().on(table.month, table.year),
	})
);
