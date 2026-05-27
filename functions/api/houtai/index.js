// Cloudflare Pages Function - 后台管理 API
// 路径: /api/houtai/*

const crypto = require('crypto');

// 默认管理员数据（用于本地开发/无数据库环境）
const DEFAULT_ADMIN = {
  id: 1,
  username: "admin",
  password_hash: "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918",
  email: "admin@example.com",
  role: "superadmin",
  is_active: 1,
  session_token: null,
  last_login_at: null,
  created_at: new Date().toISOString(),
};

// Session 过期时间（24小时，单位：毫秒）
const SESSION_EXPIRY = 24 * 60 * 60 * 1000;

// 内存存储（用于本地开发/无数据库环境）
let memorySessions = {};

function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

function isSessionExpired(session) {
  if (!session || !session.expires_at) return true;
  return new Date(session.expires_at) < new Date();
}

function getDB(env) {
  return env?.DB || null;
}

function isLocalMode(env) {
  return !getDB(env);
}

async function getSession(token, env) {
  if (!token) return null;

  if (isLocalMode(env)) {
    const session = memorySessions[token];
    if (session && !isSessionExpired(session)) {
      return session;
    }
    if (session) delete memorySessions[token];
    return null;
  }

  const db = getDB(env);
  try {
    const session = await db
      .prepare("SELECT * FROM admin_sessions WHERE token = ? AND expires_at > datetime('now')")
      .bind(token)
      .first();
    return session;
  } catch (error) {
    console.error("Get session error:", error);
    return null;
  }
}

async function createSession(admin, env) {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + SESSION_EXPIRY).toISOString();

  if (isLocalMode(env)) {
    memorySessions[token] = {
      token,
      admin_id: admin.id,
      admin_username: admin.username,
      admin_role: admin.role,
      created_at: new Date().toISOString(),
      expires_at: expiresAt,
    };
    return token;
  }

  const db = getDB(env);
  try {
    await db
      .prepare(
        `INSERT INTO admin_sessions (token, admin_id, admin_username, admin_role, created_at, expires_at)
         VALUES (?, ?, ?, ?, datetime('now'), datetime('now', '+24 hours'))`
      )
      .bind(token, admin.id, admin.username, admin.role)
      .run();
    return token;
  } catch (error) {
    console.error("Create session error:", error);
    memorySessions[token] = {
      token,
      admin_id: admin.id,
      admin_username: admin.username,
      admin_role: admin.role,
      created_at: new Date().toISOString(),
      expires_at: expiresAt,
    };
    return token;
  }
}

async function deleteSession(token, env) {
  if (isLocalMode(env)) {
    delete memorySessions[token];
    return;
  }

  const db = getDB(env);
  try {
    await db
      .prepare("DELETE FROM admin_sessions WHERE token = ?")
      .bind(token)
      .run();
  } catch (error) {
    console.error("Delete session error:", error);
  }
  delete memorySessions[token];
}

async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const action = url.searchParams.get("action");
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");

  if (action === "check-auth") {
    if (!token) {
      return new Response(JSON.stringify({ authenticated: false }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const session = await getSession(token, env);
    if (session) {
      return new Response(
        JSON.stringify({
          authenticated: true,
          admin: {
            id: session.admin_id,
            username: session.admin_username,
            role: session.admin_role,
          },
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ authenticated: false }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  if (action === "stats") {
    const session = await getSession(token, env);
    if (!session) {
      return new Response(JSON.stringify({ error: "未授权或会话已过期" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        totalUsage: 12580,
        totalFavorites: 3420,
        totalAdmins: 1,
        topTools: [
          { tool_name: "二维码生成", total: 5234 },
          { tool_name: "密码生成", total: 3456 },
          { tool_name: "文本工具", total: 2890 },
          { tool_name: "PDF转换", total: 1234 },
          { tool_name: "图片处理", total: 987 },
        ],
        recentLogs: [],
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(JSON.stringify({ error: "未知操作" }), {
    status: 400,
    headers: { "Content-Type": "application/json" },
  });
}

async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const { action, data } = body;

    const ipAddress =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    if (action === "login") {
      const { username, password } = data;

      if (!username || !password) {
        return new Response(
          JSON.stringify({ error: "用户名和密码不能为空" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      const passwordHash = hashPassword(password);

      if (
        username === DEFAULT_ADMIN.username &&
        passwordHash === DEFAULT_ADMIN.password_hash
      ) {
        const sessionToken = await createSession(DEFAULT_ADMIN, env);

        return new Response(
          JSON.stringify({
            success: true,
            token: sessionToken,
            admin: {
              id: DEFAULT_ADMIN.id,
              username: DEFAULT_ADMIN.username,
              role: DEFAULT_ADMIN.role,
            },
          }),
          {
            headers: {
              "Content-Type": "application/json",
              "Set-Cookie": `admin_token=${sessionToken}; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`,
            },
          }
        );
      }

      return new Response(
        JSON.stringify({ error: "用户名或密码错误" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (action === "logout") {
      const token = request.headers.get("Authorization")?.replace("Bearer ", "");
      if (token) {
        await deleteSession(token, env);
      }
      return new Response(
        JSON.stringify({ success: true }),
        {
          headers: {
            "Content-Type": "application/json",
            "Set-Cookie": `admin_token=; HttpOnly; Secure; SameSite=Strict; Max-Age=0`,
          },
        }
      );
    }

    const token = request.headers.get("Authorization")?.replace("Bearer ", "");
    const session = await getSession(token, env);
    if (!session) {
      return new Response(
        JSON.stringify({ error: "未授权或会话已过期，请重新登录" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (action === "get-admins") {
      return new Response(
        JSON.stringify({
          admins: [
            {
              id: DEFAULT_ADMIN.id,
              username: DEFAULT_ADMIN.username,
              email: DEFAULT_ADMIN.email,
              role: DEFAULT_ADMIN.role,
              is_active: DEFAULT_ADMIN.is_active,
              last_login_at: new Date().toISOString(),
              created_at: DEFAULT_ADMIN.created_at,
            },
          ],
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    if (action === "get-contents") {
      return new Response(
        JSON.stringify({
          contents: [
            {
              id: 1,
              content_key: "site_title",
              content_value: "在线多功能工具箱",
              content_type: "text",
              description: "网站标题",
              is_published: 1,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            {
              id: 2,
              content_key: "site_description",
              content_value: "提供多种在线工具，帮助您高效完成日常任务",
              content_type: "text",
              description: "网站描述",
              is_published: 1,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ],
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    if (action === "get-logs") {
      return new Response(
        JSON.stringify({ logs: [] }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "未知操作" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "服务器错误: " + error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

module.exports = { onRequestGet, onRequestPost };
