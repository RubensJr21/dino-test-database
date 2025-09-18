-- =====================================
-- TABELAS DO SISTEMA - PROJETO 'Dinô'
-- =====================================

-- ======================
-- TABELA: category
-- ======================
INSERT INTO category (code) VALUES
('education'),
('health'),
('entertainment'),
('food'),
('housing'),
('transportation'),
('services'),
('shopping'),
('taxes'),
('others');

-- ======================
-- TABELA: transfer_method
-- ======================
INSERT INTO transfer_method (code) VALUES
('pix'),
('debit'),
('cash');

-- ======================
-- TABELA: transfer_method
-- ======================
INSERT INTO recurrence_type (code) VALUES
('monthly'),
('yearly');