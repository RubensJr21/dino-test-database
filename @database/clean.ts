import { sqlite } from "./db-instance";

(async () => {
	sqlite.exec(`
    DROP TABLE IF EXISTS balance_cash;
    DROP TABLE IF EXISTS balance_bank;
    DROP TABLE IF EXISTS installment_item_value;
    DROP TABLE IF EXISTS installment;
    DROP TABLE IF EXISTS recurring_item_value;
    DROP TABLE IF EXISTS recurring;
    DROP TABLE IF EXISTS recurrence_type;
    DROP TABLE IF EXISTS standard;
    DROP TABLE IF EXISTS item_value;
    DROP TABLE IF EXISTS base_transaction_type;
    DROP TABLE IF EXISTS transaction_instrument;
    DROP TABLE IF EXISTS bank_account;
    DROP TABLE IF EXISTS transfer_method;
    DROP TABLE IF EXISTS category;
  `);
})();