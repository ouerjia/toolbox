interface D1PreparedStatement {
  first: <T = any>() => Promise<T | null>;
  all: <T = any>() => Promise<{ results: T[] }>;
  run: () => Promise<{ meta?: { last_row_id?: number } }>;
}

interface D1Database {
  prepare: (sql: string) => {
    bind: (...args: any[]) => D1PreparedStatement;
    first: <T = any>() => Promise<T | null>;
    all: <T = any>() => Promise<{ results: T[] }>;
    run: () => Promise<{ meta?: { last_row_id?: number } }>;
  };
}

export interface UserRecord {
  id: number;
  tool_type: string;
  tool_name: string;
  usage_count: number;
  last_used_at: string;
  created_at: string;
}

export interface Favorite {
  id: number;
  tool_type: string;
  tool_name: string;
  user_hash: string;
  created_at: string;
}

declare global {
  interface CloudflareEnv {
    DB?: D1Database;
  }
}

export async function trackUsage(toolType: string, toolName: string) {
  if (process.env.NODE_ENV === "development") {
    console.log(`Tracking usage: ${toolType} - ${toolName}`);
    return;
  }

  try {
    const db = (globalThis as unknown as { env: CloudflareEnv }).env.DB;
    if (!db) return;

    const result = await db.prepare(
      `INSERT OR REPLACE INTO user_records 
       (tool_type, tool_name, usage_count, last_used_at)
       VALUES (?, ?, COALESCE((SELECT usage_count FROM user_records WHERE tool_type = ? AND tool_name = ?), 0) + 1, CURRENT_TIMESTAMP)`
    ).bind(toolType, toolName, toolType, toolName).run();

    return result;
  } catch (error) {
    console.error("Failed to track usage:", error);
  }
}

export async function getUsageRecords(): Promise<UserRecord[]> {
  if (process.env.NODE_ENV === "development") {
    return [];
  }

  try {
    const db = (globalThis as unknown as { env: CloudflareEnv }).env.DB;
    if (!db) return [];

    const result = await db.prepare(
      "SELECT * FROM user_records ORDER BY last_used_at DESC LIMIT 100"
    ).all();

    return result.results as UserRecord[];
  } catch (error) {
    console.error("Failed to get usage records:", error);
    return [];
  }
}

export async function addFavorite(toolType: string, toolName: string, userHash: string = "default") {
  if (process.env.NODE_ENV === "development") {
    console.log(`Adding favorite: ${toolType} - ${toolName}`);
    return;
  }

  try {
    const db = (globalThis as unknown as { env: CloudflareEnv }).env.DB;
    if (!db) return;

    const result = await db.prepare(
      "INSERT OR IGNORE INTO favorites (tool_type, tool_name, user_hash) VALUES (?, ?, ?)"
    ).bind(toolType, toolName, userHash).run();

    return result;
  } catch (error) {
    console.error("Failed to add favorite:", error);
  }
}

export async function removeFavorite(toolType: string, toolName: string, userHash: string = "default") {
  if (process.env.NODE_ENV === "development") {
    console.log(`Removing favorite: ${toolType} - ${toolName}`);
    return;
  }

  try {
    const db = (globalThis as unknown as { env: CloudflareEnv }).env.DB;
    if (!db) return;

    const result = await db.prepare(
      "DELETE FROM favorites WHERE tool_type = ? AND tool_name = ? AND user_hash = ?"
    ).bind(toolType, toolName, userHash).run();

    return result;
  } catch (error) {
    console.error("Failed to remove favorite:", error);
  }
}

export async function getFavorites(userHash: string = "default"): Promise<Favorite[]> {
  if (process.env.NODE_ENV === "development") {
    return [];
  }

  try {
    const db = (globalThis as unknown as { env: CloudflareEnv }).env.DB;
    if (!db) return [];

    const result = await db.prepare(
      "SELECT * FROM favorites WHERE user_hash = ? ORDER BY created_at DESC"
    ).bind(userHash).all();

    return result.results as Favorite[];
  } catch (error) {
    console.error("Failed to get favorites:", error);
    return [];
  }
}
