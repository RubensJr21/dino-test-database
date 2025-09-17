-- ======================
-- CASO DE USO: Recuperando dados da base_transaction_type
-- ======================
SELECT
  btt.description,
  btt.cashflow_type,

  -- Vindos de transaction_instrument
  ti.nickname as nickname_transaction_instrument,

  -- Vindos de transfer_method
  tm.code as code_transfer_method,

  -- Opção viável para ter um verificador rápido se tem banco ou não
  -- (ti.fk_id_bank_account IS NOT NULL) as has_bank,
  -- Vindos de bank_account
  ba.nickname as bank_nickname,
  ba.balance as bank_balance,

  -- Vindos de category
  c.code as category,

  btt.created_at,
  btt.updated_at
FROM base_transaction_type as btt
INNER JOIN transaction_instrument as ti ON ti.id = btt.fk_id_transaction_instrument
INNER JOIN transfer_method as tm ON tm.id = ti.fk_id_transfer_method
LEFT OUTER JOIN bank_account as ba ON ba.id = ti.fk_id_bank_account
INNER JOIN category as c ON c.id = btt.fk_id_category;