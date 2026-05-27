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
      if (username === "admin" && password === "admin") {
        const token = crypto.randomBytes(32).toString('hex');
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
  }

  return new Response(JSON.stringify({ error: "Not found" }), {
    status: 404,
    headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '*' },
  });
}
