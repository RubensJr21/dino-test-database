-- =====================================
-- DADOS DE TESTE - PROJETO "Dinô"
-- =====================================

-- ======================
-- TABELA: bank_account
-- ======================
INSERT INTO bank_account (id, nickname) VALUES
(1, 'Nubank Conta Corrente'),
(2, 'Itaú Conta Corrente'),
(3, 'Caixa Poupança');

-- ======================
-- TABELA: transaction_instrument
-- ======================
INSERT INTO transaction_instrument (id, fk_id_transfer_method, fk_id_bank_account, is_enabled, nickname) VALUES
(1, 1, 1, true, 'Pix Nubank'),
(2, 2, 2, true, 'Cartão Débito Itaú'),
(3, 3, NULL, true, 'Dinheiro em espécie'),
(4, 1, 3, true, 'Pix Caixa Poupança');

-- ======================
-- BALANCES
-- ======================

-- ======================
-- TABELA: balance_bank
-- ======================
-- valores em centavos
INSERT INTO balance_bank (id, fk_id_bank_account, opening_balance, closing_balance, current_amount) VALUES
(1, 1, CURRENT_DATE, CURRENT_DATE, 250000),  -- R$ 2.500,00
(2, 2, CURRENT_DATE, CURRENT_DATE, 520000),  -- R$ 5.200,00
(3, 3, CURRENT_DATE, CURRENT_DATE, 150000);  -- R$ 1.500,00