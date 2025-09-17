-- ======================
-- CASO DE USO: Obtendo todos os instrumentos de transação disponíveis do método selecionada
-- OBS: pix foi usado como exemplo
-- ======================
SELECT ti.id, ti.nickname, ti.is_enabled, tm.code, tm.method
FROM transaction_instrument as ti
INNER JOIN transfer_method as tm on tm.id = ti.fk_id_transfer_method
WHERE ti.fk_id_transfer_method = (
    SELECT id
    FROM transfer_method
    WHERE code = 'pix'
  )
;