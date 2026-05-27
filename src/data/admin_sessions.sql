-- 管理员会话表（用于 Cloudflare Pages Functions）
-- 在 D1 数据库中执行此 SQL

CREATE TABLE IF NOT EXISTS admin_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token TEXT NOT NULL UNIQUE,
    admin_id INTEGER NOT NULL,
    admin_username TEXT NOT NULL,
    admin_role TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_sessions_token ON admin_sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON admin_sessions(expires_at);

-- 清理过期会话（可以定期执行）
-- DELETE FROM admin_sessions WHERE expires_at < datetime('now');
