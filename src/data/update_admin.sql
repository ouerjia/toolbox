-- 更新默认管理员密码为 admin123 的 SHA256 哈希
UPDATE admins
SET password_hash = '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9'
WHERE username = 'admin';
