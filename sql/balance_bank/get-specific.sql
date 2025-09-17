-- ======================
-- CASO DE USO:
--   - Consultando o saldo atual de um banco ao final do mês de um ano
-- OBS:
--   - banco usado: Nubank Conta Corrente
--   - mês usado: 05 (maio)
--   - ano usado: 2025
-- ======================

SELECT
  ba.nickname,
  bb.opening_balance,
  bb.closing_balance,
  bb.current_amount
FROM balance_bank as bb
INNER JOIN bank_account as ba ON ba.id = bb.fk_id_bank_account
WHERE (
  ba.nickname = 'Nubank Conta Corrente'
  AND bb.opening_balance <= DATE '2025-05-31'
  AND bb.closing_balance >= DATE '2025-05-01';
)