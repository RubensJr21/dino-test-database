-- ======================
-- CASO DE USO:
--   - Consultando o saldo em dinheiro atual do mês de um ano
-- OBS:
--   - mês usado: 05 (maio)
--   - ano usado: 2025
-- ======================

SELECT
  "cash" as method,
  bc.opening_balance,
  bc.closing_balance,
  bc.current_amount
FROM balance_cash as bc
WHERE (
  bc.opening_balance <= DATE '2025-05-31'
  AND bc.closing_balance >= DATE '2025-05-01';
)