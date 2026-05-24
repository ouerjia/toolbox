import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import crypto from "crypto";
import { createDefaultMockStore } from "@/lib/mock-database";
import {
  handleDatabaseGet,
  handleDatabasePost,
} from "./database-handlers";

interface D1Database {
  prepare: (sql: string) => {
    bind: (...args: any[]) => D1PreparedStatement;
    first: <T = any>() => Promise<T | null>;
    all: <T = any>() => Promise<{ results: T[] }>;
    run: () => Promise<{ meta?: { last_row_id?: number } }>;
  };
}

interface D1PreparedStatement {
  first: <T = any>() => Promise<T | null>;
  all: <T = any>() => Promise<{ results: T[] }>;
  run: () => Promise<{ meta?: { last_row_id?: number } }>;
}

interface Env {
  DB?: D1Database;
}

interface Admin {
  id: number;
  username: string;
  password_hash: string;
  email: string;
  role: string;
  is_active: number;
  session_token: string | null;
  last_login_at: string;
  created_at: string;
}

interface SiteContent {
  id: number;
  content_key: string;
  content_value: string;
  content_type: string;
  description: string;
  is_published: number;
  created_at: string;
  updated_at: string;
}

interface OperationLog {
  id: number;
  admin_id: number;
  admin_username: string;
  action: string;
  target_table: string;
  target_id: string;
  old_value: string;
  new_value: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

interface UserRecord {
  id: number;
  tool_type: string;
  tool_name: string;
  usage_count: number;
  last_used_at: string;
  created_at: string;
}

interface Favorite {
  id: number;
  tool_type: string;
  tool_name: string;
  user_hash: string;
  created_at: string;
}

const LOCAL_MODE = process.env.NODE_ENV !== "production";

const mockStore = createDefaultMockStore();
const mockAdmins = mockStore.admins as unknown as Admin[];
const mockContents = mockStore.site_content as unknown as SiteContent[];
const mockLogs = mockStore.operation_logs as unknown as OperationLog[];
const mockRecords = mockStore.user_records as unknown as UserRecord[];
const mockFavorites = mockStore.favorites as unknown as Favorite[];

let sessions: Record<string, Admin> = {};

function getNextId() {
  return mockStore.nextId++;
}

/** 本地开发：内存 session 重启会丢失，用 mock 库里的 session_token 恢复 */
function resolveLocalAdmin(token: string | undefined): Admin | null {
  if (!token) return null;

  if (sessions[token]) {
    return sessions[token];
  }

  const admin = mockAdmins.find(
    (a) => a.session_token === token && a.is_active === 1
  );
  if (admin) {
    sessions[token] = admin;
    return admin;
  }

  return null;
}

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

async function getDB(request: NextRequest) {
  try {
    const { env } = request as unknown as { env: Env };
    return env?.DB || null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const db = await getDB(request);
    const isLocal = !db || LOCAL_MODE;

    const url = new URL(request.url);
    const action = url.searchParams.get("action");
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");

    if (action === "check-auth") {
      if (!token) {
        return NextResponse.json({ authenticated: false });
      }

      if (isLocal) {
        const admin = resolveLocalAdmin(token);
        if (admin) {
          return NextResponse.json({
            authenticated: true,
            admin: {
              id: admin.id,
              username: admin.username,
              role: admin.role,
            },
          });
        }
        return NextResponse.json({ authenticated: false });
      }

      const admin = await db
        .prepare("SELECT id, username, role FROM admins WHERE session_token = ? AND is_active = 1")
        .bind(token)
        .first();

      if (!admin) {
        return NextResponse.json({ authenticated: false });
      }

      return NextResponse.json({
        authenticated: true,
        admin: {
          id: admin.id,
          username: admin.username,
          role: admin.role,
        },
      });
    }

    const dbGetActions = ["db-info", "db-schema", "db-rows"];
    if (action && dbGetActions.includes(action)) {
      if (!token) {
        return NextResponse.json({ error: "未授权" }, { status: 401 });
      }

      if (isLocal) {
        if (!resolveLocalAdmin(token)) {
          return NextResponse.json(
            { error: "未授权，请重新登录后台" },
            { status: 401 }
          );
        }
      } else if (db) {
        const authAdmin = await db
          .prepare(
            "SELECT id, username, role FROM admins WHERE session_token = ? AND is_active = 1"
          )
          .bind(token)
          .first();
        if (!authAdmin) {
          return NextResponse.json({ error: "未授权" }, { status: 401 });
        }
      } else {
        return NextResponse.json({ error: "未授权" }, { status: 401 });
      }

      const dbResponse = await handleDatabaseGet(
        action,
        url,
        db,
        isLocal,
        mockStore
      );
      if (dbResponse) return dbResponse;
    }

    if (isLocal) {
      switch (action) {
        case "stats":
          return NextResponse.json({
            totalUsage: mockRecords.reduce((sum, r) => sum + r.usage_count, 0),
            totalFavorites: mockFavorites.length,
            totalAdmins: mockAdmins.filter((a) => a.is_active === 1).length,
            topTools: [],
            recentLogs: mockLogs.slice(0, 10),
          });

        case "admins":
          return NextResponse.json({
            admins: mockAdmins.map((a) => ({
              id: a.id,
              username: a.username,
              email: a.email,
              role: a.role,
              is_active: a.is_active,
              last_login_at: a.last_login_at,
              created_at: a.created_at,
            })),
          });

        case "site-content":
          return NextResponse.json({ contents: mockContents });

        case "operation-logs": {
          const page = parseInt(url.searchParams.get("page") || "1");
          const limit = parseInt(url.searchParams.get("limit") || "20");
          const start = (page - 1) * limit;
          const end = start + limit;
          return NextResponse.json({
            logs: mockLogs.slice(start, end),
            total: mockLogs.length,
            page,
            totalPages: Math.ceil(mockLogs.length / limit),
          });
        }

        case "usage-records":
          return NextResponse.json({ records: mockRecords.slice(0, 100) });

        case "favorites":
          return NextResponse.json({ favorites: mockFavorites.slice(0, 100) });

        default:
          return NextResponse.json({ error: "无效的操作" }, { status: 400 });
      }
    }

    switch (action) {
      case "stats": {
        const totalUsage = await db
          .prepare("SELECT COUNT(*) as count FROM user_records")
          .first();
        const totalFavorites = await db
          .prepare("SELECT COUNT(*) as count FROM favorites")
          .first();
        const topTools = await db
          .prepare(
            "SELECT tool_name, SUM(usage_count) as total FROM user_records GROUP BY tool_name ORDER BY total DESC LIMIT 5"
          )
          .all();
        const totalAdmins = await db
          .prepare("SELECT COUNT(*) as count FROM admins")
          .first();
        const recentLogs = await db
          .prepare(
            "SELECT * FROM operation_logs ORDER BY created_at DESC LIMIT 10"
          )
          .all();

        return NextResponse.json({
          totalUsage: totalUsage?.count || 0,
          totalFavorites: totalFavorites?.count || 0,
          totalAdmins: totalAdmins?.count || 0,
          topTools: topTools.results || [],
          recentLogs: recentLogs.results || [],
        });
      }

      case "admins": {
        const admins = await db
          .prepare(
            "SELECT id, username, email, role, is_active, last_login_at, created_at FROM admins ORDER BY created_at DESC"
          )
          .all();
        return NextResponse.json({ admins: admins.results || [] });
      }

      case "site-content": {
        const contents = await db
          .prepare("SELECT * FROM site_content ORDER BY content_key ASC")
          .all();
        return NextResponse.json({ contents: contents.results || [] });
      }

      case "operation-logs": {
        const page = parseInt(url.searchParams.get("page") || "1");
        const limit = parseInt(url.searchParams.get("limit") || "20");
        const offset = (page - 1) * limit;

        const logs = await db
          .prepare(
            "SELECT * FROM operation_logs ORDER BY created_at DESC LIMIT ? OFFSET ?"
          )
          .bind(limit, offset)
          .all();

        const total = await db
          .prepare("SELECT COUNT(*) as count FROM operation_logs")
          .first();

        return NextResponse.json({
          logs: logs.results || [],
          total: total?.count || 0,
          page,
          totalPages: Math.ceil((total?.count || 0) / limit),
        });
      }

      case "settings": {
        const settings = await db
          .prepare("SELECT * FROM settings ORDER BY group_name, setting_key")
          .all();
        return NextResponse.json({ settings: settings.results || [] });
      }

      case "usage-records": {
        const records = await db
          .prepare(
            "SELECT * FROM user_records ORDER BY last_used_at DESC LIMIT 100"
          )
          .all();
        return NextResponse.json({ records: records.results || [] });
      }

      case "favorites": {
        const favorites = await db
          .prepare("SELECT * FROM favorites ORDER BY created_at DESC LIMIT 100")
          .all();
        return NextResponse.json({ favorites: favorites.results || [] });
      }

      default:
        return NextResponse.json({ error: "无效的操作" }, { status: 400 });
    }
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "服务器内部错误" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await getDB(request);
    const isLocal = !db || LOCAL_MODE;

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
        return NextResponse.json(
          { error: "用户名和密码不能为空" },
          { status: 400 }
        );
      }

      const passwordHash = hashPassword(password);

      if (isLocal) {
        const admin = mockAdmins.find(
          (a) =>
            a.username === username &&
            a.password_hash === passwordHash &&
            a.is_active === 1
        );

        if (!admin) {
          return NextResponse.json(
            { error: "用户名或密码错误" },
            { status: 401 }
          );
        }

        const sessionToken = generateToken();
        admin.session_token = sessionToken;
        sessions[sessionToken] = admin;

        const log: OperationLog = {
          id: getNextId(),
          admin_id: admin.id,
          admin_username: admin.username,
          action: "登录",
          target_table: "admins",
          target_id: admin.id.toString(),
          old_value: "",
          new_value: "",
          ip_address: ipAddress,
          user_agent: userAgent,
          created_at: new Date().toISOString(),
        };
        mockLogs.unshift(log);

        return NextResponse.json({
          success: true,
          token: sessionToken,
          admin: {
            id: admin.id,
            username: admin.username,
            role: admin.role,
          },
        });
      }

      const admin = await db
        .prepare(
          "SELECT * FROM admins WHERE username = ? AND password_hash = ? AND is_active = 1"
        )
        .bind(username, passwordHash)
        .first();

      if (!admin) {
        return NextResponse.json(
          { error: "用户名或密码错误" },
          { status: 401 }
        );
      }

      const sessionToken = generateToken();
      await db
        .prepare(
          "UPDATE admins SET session_token = ?, last_login_at = CURRENT_TIMESTAMP WHERE id = ?"
        )
        .bind(sessionToken, admin.id)
        .run();

      await db
        .prepare(
          `INSERT INTO operation_logs 
           (admin_id, admin_username, action, target_table, target_id, ip_address, user_agent)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(admin.id, admin.username, "登录", "admins", admin.id.toString(), ipAddress, userAgent)
        .run();

      return NextResponse.json({
        success: true,
        token: sessionToken,
        admin: {
          id: admin.id,
          username: admin.username,
          role: admin.role,
        },
      });
    }

    if (action === "logout") {
      const token = request.headers.get("Authorization")?.replace("Bearer ", "");

      if (isLocal) {
        const admin = resolveLocalAdmin(token || "");
        if (admin) {
          admin.session_token = null;
        }
        delete sessions[token || ""];
        return NextResponse.json({ success: true });
      }

      if (token) {
        await db
          .prepare("UPDATE admins SET session_token = NULL WHERE session_token = ?")
          .bind(token)
          .run();
      }

      return NextResponse.json({ success: true });
    }

    const token = request.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    if (isLocal) {
      const admin = resolveLocalAdmin(token);
      if (!admin) {
        return NextResponse.json(
          { error: "未授权，请重新登录后台" },
          { status: 401 }
        );
      }

      switch (action) {
        case "create-admin": {
          const { username, password, email, role } = data;

          if (!username || !password) {
            return NextResponse.json(
              { error: "用户名和密码不能为空" },
              { status: 400 }
            );
          }

          const existingAdmin = mockAdmins.find((a) => a.username === username);
          if (existingAdmin) {
            return NextResponse.json(
              { error: "用户名已存在" },
              { status: 400 }
            );
          }

          const newAdmin: Admin = {
            id: getNextId(),
            username,
            password_hash: hashPassword(password),
            email: email || "",
            role: role || "admin",
            is_active: 1,
            session_token: null,
            last_login_at: "",
            created_at: new Date().toISOString(),
          };
          mockAdmins.push(newAdmin);

          const log: OperationLog = {
            id: getNextId(),
            admin_id: admin.id,
            admin_username: admin.username,
            action: "创建管理员",
            target_table: "admins",
            target_id: newAdmin.id.toString(),
            old_value: "",
            new_value: JSON.stringify({ username, email, role }),
            ip_address: ipAddress,
            user_agent: userAgent,
            created_at: new Date().toISOString(),
          };
          mockLogs.unshift(log);

          return NextResponse.json({ success: true, id: newAdmin.id });
        }

        case "update-admin": {
          const { id, email, role, is_active } = data;
          const existingAdmin = mockAdmins.find((a) => a.id === id);

          if (!existingAdmin) {
            return NextResponse.json(
              { error: "管理员不存在" },
              { status: 404 }
            );
          }

          existingAdmin.email = email;
          existingAdmin.role = role;
          existingAdmin.is_active = is_active ? 1 : 0;

          const log: OperationLog = {
            id: getNextId(),
            admin_id: admin.id,
            admin_username: admin.username,
            action: "更新管理员",
            target_table: "admins",
            target_id: id.toString(),
            old_value: JSON.stringify(existingAdmin),
            new_value: JSON.stringify({ email, role, is_active }),
            ip_address: ipAddress,
            user_agent: userAgent,
            created_at: new Date().toISOString(),
          };
          mockLogs.unshift(log);

          return NextResponse.json({ success: true });
        }

        case "create-content": {
          const { content_key, content_value, content_type, description, is_published } = data;

          if (!content_key) {
            return NextResponse.json(
              { error: "请填写内容键" },
              { status: 400 }
            );
          }

          const existing = mockContents.find((c) => c.content_key === content_key);
          if (existing) {
            return NextResponse.json(
              { error: "内容键已存在" },
              { status: 400 }
            );
          }

          const newContent: SiteContent = {
            id: getNextId(),
            content_key,
            content_value,
            content_type: content_type || "text",
            description: description || "",
            is_published: is_published ? 1 : 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          mockContents.push(newContent);

          const log: OperationLog = {
            id: getNextId(),
            admin_id: admin.id,
            admin_username: admin.username,
            action: "创建内容",
            target_table: "site_content",
            target_id: content_key,
            old_value: "",
            new_value: JSON.stringify({ content_key, content_value, content_type, is_published }),
            ip_address: ipAddress,
            user_agent: userAgent,
            created_at: new Date().toISOString(),
          };
          mockLogs.unshift(log);

          return NextResponse.json({ success: true, id: newContent.id });
        }

        case "update-content": {
          const { content_key, content_value, is_published } = data;
          const existing = mockContents.find((c) => c.content_key === content_key);

          if (!existing) {
            return NextResponse.json(
              { error: "内容不存在" },
              { status: 404 }
            );
          }

          existing.content_value = content_value;
          existing.is_published = is_published ? 1 : 0;
          existing.updated_at = new Date().toISOString();

          const log: OperationLog = {
            id: getNextId(),
            admin_id: admin.id,
            admin_username: admin.username,
            action: "更新内容",
            target_table: "site_content",
            target_id: content_key,
            old_value: "",
            new_value: content_value,
            ip_address: ipAddress,
            user_agent: userAgent,
            created_at: new Date().toISOString(),
          };
          mockLogs.unshift(log);

          return NextResponse.json({ success: true });
        }

        case "delete-content": {
          const { content_key } = data;
          const index = mockContents.findIndex((c) => c.content_key === content_key);

          if (index === -1) {
            return NextResponse.json(
              { error: "内容不存在" },
              { status: 404 }
            );
          }

          const deleted = mockContents.splice(index, 1)[0];

          const log: OperationLog = {
            id: getNextId(),
            admin_id: admin.id,
            admin_username: admin.username,
            action: "删除内容",
            target_table: "site_content",
            target_id: content_key,
            old_value: JSON.stringify(deleted),
            new_value: "",
            ip_address: ipAddress,
            user_agent: userAgent,
            created_at: new Date().toISOString(),
          };
          mockLogs.unshift(log);

          return NextResponse.json({ success: true });
        }

        case "track-usage": {
          const { toolType, toolName } = data;
          const existing = mockRecords.find(
            (r) => r.tool_type === toolType && r.tool_name === toolName
          );

          if (existing) {
            existing.usage_count++;
            existing.last_used_at = new Date().toISOString();
          } else {
            mockRecords.push({
              id: getNextId(),
              tool_type: toolType,
              tool_name: toolName,
              usage_count: 1,
              last_used_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
            });
          }

          return NextResponse.json({ success: true });
        }

        case "add-favorite": {
          const { toolType, toolName, userHash } = data;
          const existing = mockFavorites.find(
            (f) =>
              f.tool_type === toolType &&
              f.tool_name === toolName &&
              f.user_hash === (userHash || "default")
          );

          if (!existing) {
            mockFavorites.push({
              id: getNextId(),
              tool_type: toolType,
              tool_name: toolName,
              user_hash: userHash || "default",
              created_at: new Date().toISOString(),
            });
          }

          return NextResponse.json({ success: true });
        }

        case "remove-favorite": {
          const { toolType, toolName, userHash } = data;
          const index = mockFavorites.findIndex(
            (f) =>
              f.tool_type === toolType &&
              f.tool_name === toolName &&
              f.user_hash === (userHash || "default")
          );

          if (index !== -1) {
            mockFavorites.splice(index, 1);
          }

          return NextResponse.json({ success: true });
        }

        default: {
          const dbResponse = await handleDatabasePost(
            action,
            data,
            null,
            true,
            mockStore,
            { id: admin.id, username: admin.username },
            ipAddress,
            userAgent,
            async (actionName, table, targetId, oldValue = "", newValue = "") => {
              const log: OperationLog = {
                id: getNextId(),
                admin_id: admin.id,
                admin_username: admin.username,
                action: actionName,
                target_table: table,
                target_id: targetId,
                old_value: oldValue,
                new_value: newValue,
                ip_address: ipAddress,
                user_agent: userAgent,
                created_at: new Date().toISOString(),
              };
              mockLogs.unshift(log);
            }
          );
          if (dbResponse) return dbResponse;
          return NextResponse.json({ error: "无效的操作" }, { status: 400 });
        }
      }
    }

    const adminResult = await db
      .prepare("SELECT * FROM admins WHERE session_token = ?")
      .bind(token)
      .first();

    if (!adminResult) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const admin = adminResult as Admin;

    switch (action) {
      case "create-admin": {
        const { username, password, email, role } = data;

        if (!username || !password) {
          return NextResponse.json(
            { error: "用户名和密码不能为空" },
            { status: 400 }
          );
        }

        const existingAdmin = await db
          .prepare("SELECT id FROM admins WHERE username = ?")
          .bind(username)
          .first();

        if (existingAdmin) {
          return NextResponse.json(
            { error: "用户名已存在" },
            { status: 400 }
          );
        }

        const passwordHash = hashPassword(password);
        const result = await db
          .prepare(
            "INSERT INTO admins (username, password_hash, email, role) VALUES (?, ?, ?, ?)"
          )
          .bind(username, passwordHash, email || null, role || "admin")
          .run();

        await db
          .prepare(
            `INSERT INTO operation_logs 
             (admin_id, admin_username, action, target_table, target_id, new_value, ip_address, user_agent)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
          )
          .bind(admin.id, admin.username, "创建管理员", "admins", result.meta?.last_row_id?.toString() || "0", JSON.stringify({ username, email, role }), ipAddress, userAgent)
          .run();

        return NextResponse.json({ success: true, id: result.meta?.last_row_id });
      }

      case "update-admin": {
        const { id, email, role, is_active } = data;

        const existingAdmin = await db
          .prepare("SELECT * FROM admins WHERE id = ?")
          .bind(id)
          .first();

        if (!existingAdmin) {
          return NextResponse.json(
            { error: "管理员不存在" },
            { status: 404 }
          );
        }

        await db
          .prepare(
            "UPDATE admins SET email = ?, role = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
          )
          .bind(email, role, is_active ? 1 : 0, id)
          .run();

        await db
          .prepare(
            `INSERT INTO operation_logs 
             (admin_id, admin_username, action, target_table, target_id, old_value, new_value, ip_address, user_agent)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
          )
          .bind(admin.id, admin.username, "更新管理员", "admins", id.toString(), JSON.stringify(existingAdmin), JSON.stringify({ email, role, is_active }), ipAddress, userAgent)
          .run();

        return NextResponse.json({ success: true });
      }

      case "change-password": {
        const { oldPassword, newPassword } = data;

        const oldPasswordHash = hashPassword(oldPassword);
        if (admin.password_hash !== oldPasswordHash) {
          return NextResponse.json(
            { error: "原密码错误" },
            { status: 400 }
          );
        }

        const newPasswordHash = hashPassword(newPassword);
        await db
          .prepare(
            "UPDATE admins SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
          )
          .bind(newPasswordHash, admin.id)
          .run();

        await db
          .prepare(
            `INSERT INTO operation_logs 
             (admin_id, admin_username, action, target_table, target_id, ip_address, user_agent)
             VALUES (?, ?, ?, ?, ?, ?, ?)`
          )
          .bind(admin.id, admin.username, "修改密码", "admins", admin.id.toString(), ipAddress, userAgent)
          .run();

        return NextResponse.json({ success: true });
      }

      case "create-content": {
        const { content_key, content_value, content_type, description, is_published } = data;

        const existing = await db
          .prepare("SELECT id FROM site_content WHERE content_key = ?")
          .bind(content_key)
          .first();

        if (existing) {
          return NextResponse.json(
            { error: "内容键已存在" },
            { status: 400 }
          );
        }

        const result = await db
          .prepare(
            "INSERT INTO site_content (content_key, content_value, content_type, description, is_published) VALUES (?, ?, ?, ?, ?)"
          )
          .bind(content_key, content_value, content_type || "text", description, is_published ? 1 : 0)
          .run();

        await db
          .prepare(
            `INSERT INTO operation_logs 
             (admin_id, admin_username, action, target_table, target_id, new_value, ip_address, user_agent)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
          )
          .bind(admin.id, admin.username, "创建内容", "site_content", content_key, JSON.stringify({ content_key, content_value, content_type, is_published }), ipAddress, userAgent)
          .run();

        return NextResponse.json({ success: true, id: result.meta?.last_row_id });
      }

      case "update-content": {
        const { content_key, content_value, is_published } = data;

        const existing = await db
          .prepare("SELECT * FROM site_content WHERE content_key = ?")
          .bind(content_key)
          .first();

        if (!existing) {
          return NextResponse.json(
            { error: "内容不存在" },
            { status: 404 }
          );
        }

        await db
          .prepare(
            "UPDATE site_content SET content_value = ?, is_published = ?, updated_at = CURRENT_TIMESTAMP WHERE content_key = ?"
          )
          .bind(content_value, is_published ? 1 : 0, content_key)
          .run();

        await db
          .prepare(
            `INSERT INTO operation_logs 
             (admin_id, admin_username, action, target_table, target_id, old_value, new_value, ip_address, user_agent)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
          )
          .bind(admin.id, admin.username, "更新内容", "site_content", content_key, (existing as any).content_value, content_value, ipAddress, userAgent)
          .run();

        return NextResponse.json({ success: true });
      }

      case "delete-content": {
        const { content_key } = data;

        const existing = await db
          .prepare("SELECT * FROM site_content WHERE content_key = ?")
          .bind(content_key)
          .first();

        if (!existing) {
          return NextResponse.json(
            { error: "内容不存在" },
            { status: 404 }
          );
        }

        await db
          .prepare("DELETE FROM site_content WHERE content_key = ?")
          .bind(content_key)
          .run();

        await db
          .prepare(
            `INSERT INTO operation_logs 
             (admin_id, admin_username, action, target_table, target_id, old_value, ip_address, user_agent)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
          )
          .bind(admin.id, admin.username, "删除内容", "site_content", content_key, JSON.stringify(existing), ipAddress, userAgent)
          .run();

        return NextResponse.json({ success: true });
      }

      case "update-settings": {
        const { settings } = data;

        for (const setting of settings) {
          const existing = await db
            .prepare("SELECT * FROM settings WHERE setting_key = ?")
            .bind(setting.setting_key)
            .first();

          if (existing) {
            await db
              .prepare(
                "UPDATE settings SET setting_value = ?, updated_at = CURRENT_TIMESTAMP WHERE setting_key = ?"
              )
              .bind(setting.setting_value, setting.setting_key)
              .run();
          } else {
            await db
              .prepare(
                "INSERT INTO settings (setting_key, setting_value, setting_type, group_name, description) VALUES (?, ?, ?, ?, ?)"
              )
              .bind(
                setting.setting_key,
                setting.setting_value,
                setting.setting_type || "string",
                setting.group_name || "general",
                setting.description || ""
              )
              .run();
          }
        }

        await db
          .prepare(
            `INSERT INTO operation_logs 
             (admin_id, admin_username, action, target_table, target_id, new_value, ip_address, user_agent)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
          )
          .bind(admin.id, admin.username, "更新设置", "settings", "multiple", JSON.stringify(settings), ipAddress, userAgent)
          .run();

        return NextResponse.json({ success: true });
      }

      case "track-usage": {
        const { toolType, toolName } = data;
        const result = await db
          .prepare(
            `INSERT OR REPLACE INTO user_records 
             (tool_type, tool_name, usage_count, last_used_at)
             VALUES (?, ?, COALESCE((SELECT usage_count FROM user_records WHERE tool_type = ? AND tool_name = ?), 0) + 1, CURRENT_TIMESTAMP)`
          )
          .bind(toolType, toolName, toolType, toolName)
          .run();
        return NextResponse.json({ success: true, result });
      }

      case "add-favorite": {
        const { toolType, toolName, userHash } = data;
        const result = await db
          .prepare(
            "INSERT OR IGNORE INTO favorites (tool_type, tool_name, user_hash) VALUES (?, ?, ?)"
          )
          .bind(toolType, toolName, userHash || "default")
          .run();
        return NextResponse.json({ success: true, result });
      }

      case "remove-favorite": {
        const { toolType, toolName, userHash } = data;
        const result = await db
          .prepare(
            "DELETE FROM favorites WHERE tool_type = ? AND tool_name = ? AND user_hash = ?"
          )
          .bind(toolType, toolName, userHash || "default")
          .run();
        return NextResponse.json({ success: true, result });
      }

      default: {
        const dbResponse = await handleDatabasePost(
          action,
          data,
          db,
          false,
          mockStore,
          { id: admin.id, username: admin.username },
          ipAddress,
          userAgent,
          async (actionName, table, targetId, oldValue = "", newValue = "") => {
            await db
              .prepare(
                `INSERT INTO operation_logs 
                 (admin_id, admin_username, action, target_table, target_id, old_value, new_value, ip_address, user_agent)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
              )
              .bind(
                admin.id,
                admin.username,
                actionName,
                table,
                targetId,
                oldValue,
                newValue,
                ipAddress,
                userAgent
              )
              .run();
          }
        );
        if (dbResponse) return dbResponse;
        return NextResponse.json({ error: "无效的操作" }, { status: 400 });
      }
    }
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "服务器内部错误" },
      { status: 500 }
    );
  }
}
