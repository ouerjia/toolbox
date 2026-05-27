import { randomBytes } from 'crypto';

export async function onRequest(context) {
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

  if (request.method === 'POST') {
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '*' },
      });
    }

    if (body.action === "login") {
      const { username, password } = body.data;
      if (username === "admin" && password === "admin123") {
        const token = randomBytes(32).toString('hex');
        return new Response(JSON.stringify({
          success: true,
          token: token,
          admin: { id: 1, username: "admin", role: "superadmin" },
        }), {
          headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '*' },
        });
      }
      return new Response(JSON.stringify({ error: "用户名或密码错误" }), {
        status: 401,
        headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '*' },
      });
    }

    if (body.action === "logout") {
      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '*' },
      });
    }

    const token = request.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return new Response(JSON.stringify({ error: "未授权" }), {
        status: 401,
        headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '*' },
      });
    }

    if (body.action === "get-admins") {
      return new Response(JSON.stringify({
        admins: [{ id: 1, username: "admin", email: "admin@example.com", role: "superadmin", is_active: 1 }],
      }), {
        headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '*' },
      });
    }

    if (body.action === "get-contents") {
      return new Response(JSON.stringify({
        contents: [
          { id: 1, content_key: "site_title", content_value: "在线多功能工具箱", content_type: "text", description: "网站标题", is_published: 1 },
          { id: 2, content_key: "site_description", content_value: "提供多种在线工具", content_type: "text", description: "网站描述", is_published: 1 },
        ],
      }), {
        headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '*' },
      });
    }

    if (body.action === "get-logs") {
      return new Response(JSON.stringify({ logs: [] }), {
        headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '*' },
      });
    }
  }

  if (request.method === 'GET') {
    const action = url.searchParams.get("action");
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");

    if (action === "check-auth") {
      if (!token) {
        return new Response(JSON.stringify({ authenticated: false }), {
          headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '*' },
        });
      }
      return new Response(JSON.stringify({ 
        authenticated: true, 
        admin: { id: 1, username: "admin", role: "superadmin" } 
      }), {
        headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '*' },
      });
    }

    if (action === "stats") {
      if (!token) {
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
  }

  return new Response(JSON.stringify({ error: "Not found" }), {
    status: 404,
    headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '*' },
  });
}
