/*
-- ======================
-- TABELA: standard
-- OBS:
--   > As seguintes tabelas precisam ter dados:
--     - transaction_instrument 
--     - category
-- ======================
*/

import { db } from "@database/db-instance";
import {
  balanceBank,
  balanceCash,
  baseTransactionType,
  itemValue,
  standard,
  transactionInstrument,
  transferMethod,
} from "@database/schema";
import { getRealAmountValue } from "@playground/utils";
import { and, eq } from "drizzle-orm";

(async () => {
	// 1. Recuperar standard que será removido
	const [standard_for_delete] = await db
		.select({
			id: standard.id,

			cashflow_type: baseTransactionType.cashflow_type,

			item_value_id: standard.fk_id_item_value,
			amount: itemValue.amount,
			scheduled_at: itemValue.scheduled_at,
			was_processed: itemValue.was_processed,

			transaction_instrument_id: transactionInstrument.id,
			bank_account_id: transactionInstrument.fk_id_bank_account,

			transfer_method_code: transferMethod.code,
		})
		.from(standard)
		.innerJoin(baseTransactionType, eq(baseTransactionType.id, standard.id))
		.innerJoin(
			transactionInstrument,
			eq(
				transactionInstrument.id,
				baseTransactionType.fk_id_transaction_instrument
			)
		)
		.innerJoin(
			transferMethod,
			eq(transferMethod.id, transactionInstrument.fk_id_transfer_method)
		)
		.innerJoin(itemValue, eq(itemValue.id, standard.fk_id_item_value));
	// 2. Deletar dados relacionados do banco de dados
	// 2.1. Deletar base_transaction_type
	await db
		.delete(baseTransactionType)
		.where(eq(baseTransactionType.id, standard_for_delete.id));
	// 2.2. Deletar item_value
	await db
		.delete(itemValue)
		.where(eq(itemValue.id, standard_for_delete.item_value_id));
	// 2.4. Deletar standard
	await db.delete(standard).where(eq(standard.id, standard_for_delete.id));

	// 2.4. Atualizar balance_cash ou balance_bank
	const item_value_amount =
		getRealAmountValue(
			standard_for_delete.cashflow_type as -1 | 1,
			standard_for_delete.amount
		) * -1; // para não precisar verificar se tem que somar ou subtrair do saldo

	const month = standard_for_delete.scheduled_at.getMonth();
	const year = standard_for_delete.scheduled_at.getFullYear();
	if (standard_for_delete.transfer_method_code === "cash") {
		// inserir no balanço de balance_cash
		const [balance_cash] = await db
			.select()
			.from(balanceCash)
			.where(and(eq(balanceCash.year, year), eq(balanceCash.month, month)));

		if (standard_for_delete.was_processed) {
			await db
				.update(balanceCash)
				.set({
					planned_amount: balance_cash.planned_amount + item_value_amount,
					executed_amount: balance_cash.executed_amount + item_value_amount,
				})
				.where(eq(balanceCash.id, balance_cash.id));
		} else {
			await db
				.update(balanceCash)
				.set({
					planned_amount: balance_cash.planned_amount + item_value_amount,
				})
				.where(eq(balanceCash.id, balance_cash.id));
		}
	} else {
		const [transaction_instrument_choose] = await db
			.select({
				bank_id: transactionInstrument.fk_id_bank_account,
			})
			.from(transactionInstrument)
			.innerJoin(
				transferMethod,
				eq(transactionInstrument.fk_id_transfer_method, transferMethod.id)
			)
			.where(
				eq(transferMethod.id, standard_for_delete.transaction_instrument_id)
			);

		const bankId = transaction_instrument_choose.bank_id!;

		const [balance_bank] = await db
			.select()
			.from(balanceBank)
			.where(
				and(
					eq(balanceBank.fk_id_bank_account, bankId),
					eq(balanceBank.year, year),
					eq(balanceBank.month, month)
				)
			);

		if (standard_for_delete.was_processed) {
			await db
				.update(balanceBank)
				.set({
					planned_amount: balance_bank.planned_amount + item_value_amount,
					executed_amount: balance_bank.executed_amount + item_value_amount,
				})
				.where(eq(balanceBank.id, balance_bank.id));
		} else {
			await db
				.update(balanceBank)
				.set({
					planned_amount: balance_bank.planned_amount + item_value_amount,
				})
				.where(eq(balanceBank.id, balance_bank.id));
		}
	}
})();
// "Minha descrição de teste"
