import { type DatabaseType } from "@database/db-instance";
import {
  baseTransactionType,
  installment,
  installmentItemValue,
  itemValue,
  transactionInstrument,
  transferMethod
} from "@database/schema";
import { eq } from "drizzle-orm";

type DataInsert = typeof installment.$inferInsert;
type DataSelect = typeof installment.$inferSelect;

export async function get(
  db: DatabaseType,
  installment_id: typeof installment.$inferSelect.id
) {
  return (
    await db
      .select({
        id: installment.id,

        cashflow_type: baseTransactionType.cashflow_type,

        start_date: installment.start_date,
        installment_numbers: installment.installments_number,
        total_amount: installment.total_amount,

        transaction_instrument_id: transactionInstrument.id,
        bank_account_id: transactionInstrument.fk_id_bank_account,

        transfer_method_code: transferMethod.code,
      })
      .from(installment)
      .innerJoin(baseTransactionType, eq(installment.id, baseTransactionType.id))
      .innerJoin(
        transactionInstrument,
        eq(
          baseTransactionType.fk_id_transaction_instrument,
          transactionInstrument.id
        )
      )
      .innerJoin(
        transferMethod,
        eq(transactionInstrument.fk_id_transfer_method, transferMethod.id)
      )
      .where(eq(installment.id, installment_id))
  ).shift();
}

export async function insert(
  db: DatabaseType,
  data: DataInsert | DataInsert[]
) {
  // Feito assim para permitir a inserção de vários ou apenas 1
  if (Array.isArray(data)) {
    return await db.insert(installment).values(data).returning();
  } else {
    return await db.insert(installment).values(data).returning();
  }
}

export async function register_item_value(
  db: DatabaseType,
  data: typeof installmentItemValue.$inferInsert
) {
  return await db.insert(installmentItemValue).values(data).returning();
}
export async function get_all_item_values(
  db: DatabaseType,
  installment_id: typeof installment.$inferSelect.id
) {
  return await db
    .select({
      id: itemValue.id,
      scheduled_at: itemValue.scheduled_at,
      amount: itemValue.amount,
      was_processed: itemValue.was_processed,

      cashflow_type: baseTransactionType.cashflow_type,

      bank_account_id: transactionInstrument.fk_id_bank_account,

      transfer_method_code: transferMethod.code,
    })
    .from(installmentItemValue)
    .where(eq(installmentItemValue.fk_id_installment, installment_id))
    .innerJoin(itemValue, eq(installmentItemValue.fk_id_item_value, itemValue.id))
    .innerJoin(
      baseTransactionType,
      eq(installmentItemValue.fk_id_installment, baseTransactionType.id)
    )
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
    );
}

export async function remove(
  db: DatabaseType,
  installment_id: typeof installment.$inferSelect.id
) {
  await db.delete(installment).where(eq(installment.id, installment_id));
}

export type { DataInsert as infer_insert, DataSelect as infer_select };
