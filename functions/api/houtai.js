// Cloudflare Pages Function - 后台管理 API
// 路径: /api/houtai

const crypto = require('crypto');

const DEFAULT_ADMIN = {
  id: 1,
  username: "admin",
  password_hash: "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918",
  email: "admin@example.com",
  role: "superadmin",
};

let sessions = {};

function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  if (request.method === 'GET') {
    const action = url.searchParams.get("action");
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");

    if (action === "check-auth") {
      if (!token || !sessions[token]) {
        return new Response(JSON.stringify({ authenticated: false }), {
          headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '*' },
        });
      }
      return new Response(JSON.stringify({ 
        authenticated: true, 
        admin: sessions[token] 
      }), {
        headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '*' },
      });
    }

    if (action === "stats") {
      if (!token || !sessions[token]) {
        return new Response(JSON.stringify({ error: "未授权" }), {
          status: 401,
          headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '*' },
        });
      }
      return new Response(JSON.stringify({
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
      }), {
        headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '*' },
      });
    }

    return new Response(JSON.stringify({ error: "未知操作" }), {
      status: 400,
      headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '*' },
    });
  }

  if (request.method === 'POST') {
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return new Response(JSON.stringify({ error: "无效的JSON" }), {
        status: 400,
        headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '*' },
      });
    }

    const { action, data } = body;

    if (action === "login") {
      const { username, password } = data;
      const passwordHash = hashPassword(password);

      if (username === DEFAULT_ADMIN.username && passwordHash === DEFAULT_ADMIN.password_hash) {
        const token = generateToken();
        sessions[token] = {
          id: DEFAULT_ADMIN.id,
          username: DEFAULT_ADMIN.username,
          role: DEFAULT_ADMIN.role,
        };
        
        return new Response(JSON.stringify({
          success: true,
          token: token,
          admin: sessions[token],
        }), {
          headers: { 
            "Content-Type": "application/json", 
            'Access-Control-Allow-Origin': '*',
            "Set-Cookie": `admin_token=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`,
          },
        });
      }

      return new Response(JSON.stringify({ error: "用户名或密码错误" }), {
        status: 401,
        headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '*' },
      });
    }

    if (action === "logout") {
      const token = request.headers.get("Authorization")?.replace("Bearer ", "");
      if (token && sessions[token]) {
        delete sessions[token];
      }
      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '*' },
      });
    }

    const token = request.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token || !sessions[token]) {
      return new Response(JSON.stringify({ error: "未授权" }), {
        status: 401,
        headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '*' },
      });
    }

    if (action === "get-admins") {
      return new Response(JSON.stringify({
        admins: [{
          id: DEFAULT_ADMIN.id,
          username: DEFAULT_ADMIN.username,
          email: DEFAULT_ADMIN.email,
          role: DEFAULT_ADMIN.role,
          is_active: 1,
          created_at: new Date().toISOString(),
        }],
      }), {
        headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '*' },
      });
    }

    if (action === "get-contents") {
      return new Response(JSON.stringify({
        contents: [
          { id: 1, content_key: "site_title", content_value: "在线多功能工具箱", content_type: "text", description: "网站标题", is_published: 1 },
          { id: 2, content_key: "site_description", content_value: "提供多种在线工具", content_type: "text", description: "网站描述", is_published: 1 },
        ],
      }), {
        headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '*' },
      });
    }

    if (action === "get-logs") {
      return new Response(JSON.stringify({ logs: [] }), {
        headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '*' },
      });
    }

    return new Response(JSON.stringify({ error: "未知操作" }), {
      status: 400,
      headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '*' },
    });
  }

  return new Response(JSON.stringify({ error: "不支持的方法" }), {
    status: 405,
    headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '*' },
  });
}

module.exports = { onRequest };
