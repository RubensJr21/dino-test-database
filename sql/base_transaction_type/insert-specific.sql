-- ======================
-- CASO DE USO: Inserir uma transação informando transaction_instrument_id e category_id
-- OBS:
--   - transaction_instrument usado: Pix Nubank
--   - category usado: health
-- ======================
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

-- Exibindo tabela base_transaction_type com linha inserida
SELECT * FROM base_transaction_type;