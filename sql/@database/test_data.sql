-- =====================================
-- DADOS DE TESTE - PROJETO "Dinô"
-- =====================================

-- ======================
-- TABELA: bank_account
-- ======================
INSERT INTO bank_account (nickname) VALUES
('Nubank Conta Corrente'),
('Itaú Conta Corrente'),
('Caixa Poupança');

-- ======================
-- TABELA: transaction_instrument
-- ======================
INSERT INTO transaction_instrument (fk_id_transfer_method, fk_id_bank_account) VALUES
(1, 1),
(2, 2),
(3, NULL),
(1, 3);

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