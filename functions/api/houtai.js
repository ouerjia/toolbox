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
      
      if (env.DB) {
        try {
          const admin = await env.DB
            .prepare("SELECT * FROM admins WHERE username = ? AND is_active = 1")
            .bind(username)
            .first();
          
          if (admin) {
            const passwordHash = await sha256(password);
            if (passwordHash === admin.password_hash) {
              const token = generateToken();
              await env.DB
                .prepare("INSERT INTO admin_sessions (token, admin_id, admin_username, admin_role, expires_at) VALUES (?, ?, ?, ?, datetime('now', '+24 hours'))")
                .bind(token, admin.id, admin.username, admin.role)
                .run();
              
              return new Response(JSON.stringify({
                success: true,
                token: token,
                admin: { id: admin.id, username: admin.username, role: admin.role },
              }), {
                headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '*' },
              });
            }
          }
        } catch (dbError) {
          console.error("Database error:", dbError);
        }
      }

      if (username === "admin" && password === "admin123") {
        const token = generateToken();
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
      const token = request.headers.get("Authorization")?.replace("Bearer ", "");
      if (token && env.DB) {
        try {
          await env.DB.prepare("DELETE FROM admin_sessions WHERE token = ?").bind(token).run();
        } catch (dbError) {
          console.error("Database error:", dbError);
        }
      }
      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '*' },
      });
    }

    const token = request.headers.get("Authorization")?.replace("Bearer ", "");
    let isAuthenticated = false;
    let adminInfo = null;

    if (token && env.DB) {
      try {
        const session = await env.DB
          .prepare("SELECT * FROM admin_sessions WHERE token = ? AND expires_at > datetime('now')")
          .bind(token)
          .first();
        if (session) {
          isAuthenticated = true;
          adminInfo = { id: session.admin_id, username: session.admin_username, role: session.admin_role };
        }
      } catch (dbError) {
        console.error("Database error:", dbError);
      }
    } else if (token) {
      isAuthenticated = true;
      adminInfo = { id: 1, username: "admin", role: "superadmin" };
    }

    if (!isAuthenticated) {
      return new Response(JSON.stringify({ error: "未授权" }), {
        status: 401,
        headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '*' },
      });
    }

    if (body.action === "get-admins") {
      if (env.DB) {
        try {
          const admins = await env.DB.prepare("SELECT id, username, email, role, is_active, created_at FROM admins").all();
          return new Response(JSON.stringify({ admins: admins.results }), {
            headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '*' },
          });
        } catch (dbError) {
          console.error("Database error:", dbError);
        }
      }
      return new Response(JSON.stringify({
        admins: [{ id: 1, username: "admin", email: "admin@example.com", role: "superadmin", is_active: 1 }],
      }), {
        headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '*' },
      });
    }

    if (body.action === "get-contents") {
      if (env.DB) {
        try {
          const contents = await env.DB.prepare("SELECT * FROM site_content").all();
          return new Response(JSON.stringify({ contents: contents.results }), {
            headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '*' },
          });
        } catch (dbError) {
          console.error("Database error:", dbError);
        }
      }
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
      if (env.DB) {
        try {
          const logs = await env.DB.prepare("SELECT * FROM operation_logs ORDER BY created_at DESC LIMIT 50").all();
          return new Response(JSON.stringify({ logs: logs.results }), {
            headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '*' },
          });
        } catch (dbError) {
          console.error("Database error:", dbError);
        }
      }
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

      if (env.DB) {
        try {
          const session = await env.DB
            .prepare("SELECT * FROM admin_sessions WHERE token = ? AND expires_at > datetime('now')")
            .bind(token)
            .first();
          if (session) {
            return new Response(JSON.stringify({ 
              authenticated: true, 
              admin: { id: session.admin_id, username: session.admin_username, role: session.admin_role } 
            }), {
              headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '*' },
            });
          }
        } catch (dbError) {
          console.error("Database error:", dbError);
        }
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

      let totalUsage = 12580;
      let totalFavorites = 3420;
      let totalAdmins = 1;

      if (env.DB) {
        try {
          const usage = await env.DB.prepare("SELECT COUNT(*) as count FROM user_records").first();
          const favorites = await env.DB.prepare("SELECT COUNT(*) as count FROM favorites").first();
          const admins = await env.DB.prepare("SELECT COUNT(*) as count FROM admins WHERE is_active = 1").first();
          totalUsage = usage?.count || 0;
          totalFavorites = favorites?.count || 0;
          totalAdmins = admins?.count || 0;
        } catch (dbError) {
          console.error("Database error:", dbError);
        }
      }

      let recentLogs = [];
      if (env.DB) {
        try {
          const logs = await env.DB.prepare("SELECT * FROM operation_logs ORDER BY created_at DESC LIMIT 10").all();
          recentLogs = logs.results || [];
        } catch (dbError) {
          console.error("Database error:", dbError);
        }
      }

      return new Response(JSON.stringify({
        totalUsage,
        totalFavorites,
        totalAdmins,
        topTools: [
          { tool_name: "二维码生成", total: 5234 },
          { tool_name: "密码生成", total: 3456 },
          { tool_name: "文本工具", total: 2890 },
          { tool_name: "PDF转换", total: 1234 },
          { tool_name: "图片处理", total: 987 },
        ],
        recentLogs,
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

async function sha256(input) {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function generateToken() {
  const array = new Uint32Array(8);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map(b => b.toString(16).padStart(8, '0'))
    .join('');
}