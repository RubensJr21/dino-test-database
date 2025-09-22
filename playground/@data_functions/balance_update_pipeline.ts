import * as bb from "@data_functions/balance_bank";
import * as bc from "@data_functions/balance_cash";
import * as ti from "@data_functions/transaction_instrument";
import { type DatabaseType } from "@database/db-instance";
import {
  balanceBank,
  balanceCash,
  baseTransactionType,
  itemValue,
  transactionInstrument,
} from "@database/schema";
import { getRealAmountValue } from "@playground/utils";

type monthType = typeof balanceBank.$inferSelect.month &
	typeof balanceCash.$inferSelect.month;
type yearType = typeof balanceBank.$inferSelect.year &
	typeof balanceCash.$inferSelect.year;

type BaseData = {
	month: monthType;
	year: yearType;
	amount: typeof itemValue.$inferSelect.amount;
	cashflow_type: typeof baseTransactionType.$inferSelect.cashflow_type;
};

type CashData = BaseData;
type BankData = BaseData & {
	transaction_instrument_id: typeof transactionInstrument.$inferSelect.id;
};

export async function balance_bank_update_pipeline(
	db: DatabaseType,
	data: BankData,
	removing: boolean = false
) {
	const { month, year, amount } = data;

	const realAmount = getRealAmountValue(data.cashflow_type, amount, removing);

	// Garanto que existe, pois ele não é do tipo 'cash'
	const bank_id = await ti.get_bank_id(db, data.transaction_instrument_id);

	if (bank_id === null) {
		throw new Error(`Erro ao obter o valor de bank_id (${bank_id})`);
	}

	console.log("bank_id:", bank_id);

	const balance_bank = await bb.get_balance(db, {
		month,
		year,
		bank_id,
	});

	if (balance_bank === undefined) {
		throw new Error("Nenhum balanço bancário nesse período foi encontrado.");
	}

	await bb.apply_executed_amount(db, {
		id: balance_bank.id,
		updated_executed_amount: balance_bank.executed_amount + realAmount,
	});
}

export async function balance_cash_update_pipeline(
	db: DatabaseType,
	data: CashData,
	removing: boolean = false
) {
	const { month, year, amount } = data;

	const realAmount = getRealAmountValue(data.cashflow_type, amount, removing);

	const balance_cash = await bc.get_balance(db, {
		month,
		year,
	});

	if (balance_cash === undefined) {
		throw new Error("Nenhum balanço bancário nesse período foi encontrado.");
	}

	await bc.apply_executed_amount(db, {
		id: balance_cash.id,
		updated_executed_amount: balance_cash.executed_amount + realAmount,
	});
}
