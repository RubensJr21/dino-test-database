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
  category,
  itemValue,
  standard,
  transactionInstrument,
  transferMethod,
} from "@database/schema";
import { getCashflowType, getRealAmountValue } from "@playground/utils";
import { and, eq } from "drizzle-orm";

(async () => {
	// 1. Preparar base_transaction_type
	// 1.1. Selecionar um método de transferência
	const transfer_methods = await db.select().from(transferMethod);
	const randomIndexTM = Math.floor(Math.random() * transfer_methods.length);
	// Adicionar lógica interativa
	const method_choose = transfer_methods[randomIndexTM];

	// 1.2. Selecionar um instrumento de transferência
	const transaction_instruments = await db
		.select({
			id: transactionInstrument.id,
			code: transferMethod.code,
		})
		.from(transactionInstrument)
		.innerJoin(
			transferMethod,
			eq(transactionInstrument.fk_id_transfer_method, transferMethod.id)
		)
		.where(
			and(
				eq(transferMethod.code, method_choose.code),
				eq(transactionInstrument.is_enabled, true)
			)
		);

	const randomIndexTI = Math.floor(
		Math.random() * transaction_instruments.length
	);
	const selected_transaction_instrument =
		transaction_instruments[randomIndexTI];

	// 1.3. Selecionar uma categoria
	const categories = await db.select().from(category);
	const randomIndexC = Math.floor(Math.random() * categories.length);
	const selected_category = categories[randomIndexC];

	// 1.4. Criar descrição
	const description = "Minha descrição de teste";
	// 1.5. Sortear o cashflow_type (-1 = saída, 1 = entrada)
	const cashflow_type = getCashflowType();

	// INSERINDO base_transaction_type
	const base_transaction_type = await db
		.insert(baseTransactionType)
		.values({
			description,
			cashflow_type,
			fk_id_category: Number(selected_category.id),
			fk_id_transaction_instrument: Number(selected_transaction_instrument.id),
		})
		.returning();

	// 2. Preparar item_value
	// 2.1. Escolher data do para pagamento
	const scheduled_at = new Date(Math.random());
	// 2.2. Informar valor (amount)
	const amount = Math.trunc(Math.random() * 100_000);

	// INSERINDO item_value
	const item_value = await db
		.insert(itemValue)
		.values([
			{
				amount,
				scheduled_at,
			},
		])
		.returning();

	await db.insert(standard).values([
		{
			id: base_transaction_type[0].id,
			fk_id_item_value: item_value[0].id,
		},
	]);

	// ======================================
	// POST INSERT
	// ======================================

	const item_value_amount = getRealAmountValue(
		cashflow_type,
		item_value[0].amount
	);
	const month = item_value[0].scheduled_at.getMonth();
	const year = item_value[0].scheduled_at.getFullYear();

	// VERIFICAR EM QUAL BALANÇO ESSE ITEM DEVE SER INSERIDO
	if (selected_transaction_instrument.code === "cash") {
		// inserir no balanço de balance_cash

		// Verificar se já existe supondo que já tenha ano, mes e amount (positivo/negativo)
		const existing = await db
			.select()
			.from(balanceCash)
			.where(and(eq(balanceCash.year, year), eq(balanceCash.month, month)));

		if (existing.length === 0) {
			// Caso não exista
			// INSERINDO balance_cash
			await db
				.insert(balanceCash)
				.values([
					{
						month,
						year,
						planned_amount: item_value_amount,
						executed_amount: 0,
					},
				])
				.returning();
		} else {
			await db
				.update(balanceCash)
				.set({
					planned_amount: existing[0].planned_amount + amount,
				})
				.where(eq(balanceCash.id, existing[0].id));
		}
	} else {
		// atualizar balanço de balance_bank
		const transaction_instrument_choose = await db
			.select({
				id: transactionInstrument.id,
				code: transferMethod.code,
				bank_id: transactionInstrument.fk_id_bank_account,
			})
			.from(transactionInstrument)
			.innerJoin(
				transferMethod,
				eq(transactionInstrument.fk_id_transfer_method, transferMethod.id)
			)
			.where(eq(transferMethod.id, selected_transaction_instrument.id));

		// Verificar se já existe
		const bankId = transaction_instrument_choose[0].bank_id!;

		// supondo que já tenha ano, mes e amount (positivo/negativo)
		const existing = await db
			.select()
			.from(balanceBank)
			.where(
				and(
					eq(balanceBank.fk_id_bank_account, bankId),
					eq(balanceBank.year, year),
					eq(balanceBank.month, month)
				)
			);

		// INSERINDO balance_bank
		if (existing.length === 0) {
			// Caso não exista inserir
			const planned_amount = item_value_amount;
			await db
				.insert(balanceBank)
				.values([
					{
						// Aqui é garantido pela lógica que terá um bank
						fk_id_bank_account: transaction_instrument_choose[0].bank_id!,
						month,
						year,
						planned_amount,
						executed_amount: 0,
					},
				])
				.returning();
		} else {
			await db
				.update(balanceBank)
				.set({
					planned_amount: existing[0].planned_amount + item_value_amount,
				})
				.where(eq(balanceBank.id, existing[0].id));
		}
	}

	console.log("standard inserido!");
})();

// ================================================
// EXEMPLOS DE SQL
// ================================================

/*
INSERT INTO base_transaction_type (description, cashflow_type, fk_id_transaction_instrument, fk_id_category)
VALUES (
  'Exemplo de transação',
  1, 
  (
    SELECT id as transaction_instrument_id
    FROM transaction_instrument
    WHERE nickname = 'Pix Nubank'
  ), 
  (
    SELECT id as category_id
    FROM category
    WHERE code = 'health'
    LIMIT 1
  )
)
;

SELECT *
FROM transaction_instrument as ti
LEFT JOIN transfer_method as tm ON transfer_method.id = ti.fk_id_transfer_method
WHERE tm.code = "pix"
*/
