-- 为已有 D1 数据库添加 session_token 字段（若已存在可忽略报错）
ALTER TABLE admins ADD COLUMN session_token TEXT;
