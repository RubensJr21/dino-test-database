-- ======================
-- TABELA: base_transaction_type
-- ======================
-- cashflow_type: 0 = Entrada, 1 = Saída
INSERT INTO base_transaction_type (id, description, cashflow_type, fk_id_transaction_instrument, fk_id_category) VALUES
(1, 'Salário Empresa X', 0, 1, 5),         -- Entrada via Pix, categoria Moradia (ex: aluguel recebido)
(2, 'Conta de Luz', 1, 2, 5),              -- Saída via Débito, categoria Moradia
(3, 'Supermercado', 1, 2, 4),              -- Saída via Débito, categoria Alimentação
(4, 'Médico Consulta', 1, 1, 2),           -- Saída via Pix, categoria Saúde
(5, 'Venda Notebook Usado', 0, 3, 8),      -- Entrada em Dinheiro, categoria Compras
(6, 'IPTU Anual', 1, 1, 9),                -- Saída via Pix, categoria Impostos/Taxas
(7, 'Show de Música', 1, 2, 3),            -- Saída via Débito, categoria Lazer
(8, 'Reembolso Viagem', 0, 4, 6),          -- Entrada via Pix Caixa, categoria Transporte
(9, 'Curso Online', 1, 1, 1),              -- Saída via Pix, categoria Educação
(10, 'Serviço Freelance', 0, 1, 7);        -- Entrada via Pix, categoria Serviços