-- Script para criar os bancos de dados do sistema multitenant
-- Execute este script como usuário root para criar os bancos de dados

-- Criar bancos de dados
CREATE DATABASE IF NOT EXISTS default_db;
CREATE DATABASE IF NOT EXISTS cliente1_db;
CREATE DATABASE IF NOT EXISTS cliente2_db;
CREATE DATABASE IF NOT EXISTS cliente3_db;

-- Criar usuário para acessar os bancos
CREATE USER IF NOT EXISTS 'usuario'@'localhost' IDENTIFIED BY 'senha';

-- Conceder privilégios ao usuário
GRANT ALL PRIVILEGES ON default_db.* TO 'usuario'@'localhost';
GRANT ALL PRIVILEGES ON cliente1_db.* TO 'usuario'@'localhost';
GRANT ALL PRIVILEGES ON cliente2_db.* TO 'usuario'@'localhost';
GRANT ALL PRIVILEGES ON cliente3_db.* TO 'usuario'@'localhost';

-- Aplicar as alterações
FLUSH PRIVILEGES;

-- Mensagem de conclusão
SELECT 'Bancos de dados criados com sucesso!' AS Mensagem;
