// Cloudflare Pages Function - 后台管理 API
// 路径: /api/houtai/*

import crypto from "crypto";

// 默认管理员数据（用于本地开发/无数据库环境）
const DEFAULT_ADMIN = {
  id: 1,
  username: "admin",
  password_hash: "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918", // sha256("admin")
  email: "admin@example.com",
  role: "superadmin",
  is_active: 1,
  session_token: null,
  last_login_at: null,
  created_at: new Date().toISOString(),
};

// 内存存储（Cloudflare Pages Functions 是 serverless，每次请求可能不同实例）
let sessions = {};

function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const action = url.searchParams.get("action");
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");

  // 检查认证状态
  if (action === "check-auth") {
    if (!token) {
      return new Response(JSON.stringify({ authenticated: false }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // 检查 session
    if (sessions[token]) {
      return new Response(
        JSON.stringify({
          authenticated: true,
          admin: {
            id: sessions[token].id,
            username: sessions[token].username,
            role: sessions[token].role,
          },
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ authenticated: false }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  // 获取统计数据
  if (action === "stats") {
    if (!token || !sessions[token]) {
      return new Response(JSON.stringify({ error: "未授权" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 返回模拟统计数据
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

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const { action, data } = body;

    const ipAddress =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // 登录
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

      // 验证管理员
      if (
        username === DEFAULT_ADMIN.username &&
        passwordHash === DEFAULT_ADMIN.password_hash
      ) {
        const sessionToken = generateToken();

        // 创建 session
        const adminSession = {
          ...DEFAULT_ADMIN,
          session_token: sessionToken,
          last_login_at: new Date().toISOString(),
        };
        sessions[sessionToken] = adminSession;

        return new Response(
          JSON.stringify({
            success: true,
            token: sessionToken,
            admin: {
              id: adminSession.id,
              username: adminSession.username,
              role: adminSession.role,
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

    // 登出
    if (action === "logout") {
      const token = request.headers.get("Authorization")?.replace("Bearer ", "");
      if (token && sessions[token]) {
        delete sessions[token];
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

    // 其他操作需要认证
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token || !sessions[token]) {
      return new Response(
        JSON.stringify({ error: "未授权，请重新登录" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 获取管理员列表
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
              last_login_at: sessions[token]?.last_login_at || null,
              created_at: DEFAULT_ADMIN.created_at,
            },
          ],
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // 获取站点内容
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

    // 获取操作日志
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
