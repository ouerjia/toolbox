export interface D1PreparedStatement {
  first: <T = Record<string, unknown>>() => Promise<T | null>;
  all: <T = Record<string, unknown>>() => Promise<{ results: T[] }>;
  run: () => Promise<{ meta?: { last_row_id?: number; changes?: number } }>;
}

export interface D1Database {
  prepare: (sql: string) => {
    bind: (...args: unknown[]) => D1PreparedStatement;
    first: <T = Record<string, unknown>>() => Promise<T | null>;
    all: <T = Record<string, unknown>>() => Promise<{ results: T[] }>;
    run: () => Promise<{ meta?: { last_row_id?: number; changes?: number } }>;
  };
}

export const KNOWN_TABLES = [
  "admins",
  "site_content",
  "operation_logs",
  "settings",
  "user_records",
  "favorites",
] as const;

export type KnownTable = (typeof KNOWN_TABLES)[number];

export const SENSITIVE_COLUMNS = ["password_hash", "session_token"];

export const DB_BINDING_NAME = "DB";
export const DB_DISPLAY_NAME = "first-d1";

export function isValidTableName(name: string): name is KnownTable {
  return (KNOWN_TABLES as readonly string[]).includes(name);
}

export function maskSensitiveData<T extends Record<string, unknown>>(
  row: T
): T {
  const masked = { ...row };
  for (const col of SENSITIVE_COLUMNS) {
    if (col in masked && masked[col] != null && masked[col] !== "") {
      (masked as Record<string, unknown>)[col] = "••••••••";
    }
  }
  return masked;
}

export function maskRows<T extends Record<string, unknown>>(
  rows: T[]
): T[] {
  return rows.map(maskSensitiveData);
}

export interface TableInfo {
  name: string;
  rowCount: number;
}

export interface ColumnInfo {
  cid: number;
  name: string;
  type: string;
  notnull: number;
  dflt_value: string | null;
  pk: number;
}

export async function getDatabaseInfo(
  db: D1Database,
  mode: "d1" | "mock"
): Promise<{
  connected: boolean;
  mode: "d1" | "mock";
  databaseName: string;
  binding: string;
  tables: TableInfo[];
}> {
  const tables: TableInfo[] = [];

  for (const tableName of KNOWN_TABLES) {
    try {
      const countResult = await db
        .prepare(`SELECT COUNT(*) as count FROM ${tableName}`)
        .first<{ count: number }>();
      tables.push({
        name: tableName,
        rowCount: countResult?.count ?? 0,
      });
    } catch {
      tables.push({ name: tableName, rowCount: 0 });
    }
  }

  return {
    connected: mode === "d1",
    mode,
    databaseName: DB_DISPLAY_NAME,
    binding: DB_BINDING_NAME,
    tables,
  };
}

export async function getTableSchema(
  db: D1Database,
  tableName: string
): Promise<ColumnInfo[]> {
  if (!isValidTableName(tableName)) {
    throw new Error("无效的表名");
  }

  const result = await db
    .prepare(`PRAGMA table_info(${tableName})`)
    .all<ColumnInfo>();

  return result.results ?? [];
}

export async function getTableRows(
  db: D1Database,
  tableName: string,
  page: number,
  limit: number,
  search?: string
): Promise<{ rows: Record<string, unknown>[]; total: number }> {
  if (!isValidTableName(tableName)) {
    throw new Error("无效的表名");
  }

  const offset = (page - 1) * limit;

  let rows: Record<string, unknown>[];
  let total: number;

  if (search && search.trim()) {
    const schema = await getTableSchema(db, tableName);
    const textColumns = schema
      .filter((c) => c.type.toUpperCase().includes("TEXT"))
      .map((c) => c.name);

    if (textColumns.length === 0) {
      const countResult = await db
        .prepare(`SELECT COUNT(*) as count FROM ${tableName}`)
        .first<{ count: number }>();
      total = countResult?.count ?? 0;

      const dataResult = await db
        .prepare(
          `SELECT * FROM ${tableName} ORDER BY rowid DESC LIMIT ? OFFSET ?`
        )
        .bind(limit, offset)
        .all();

      rows = (dataResult.results ?? []) as Record<string, unknown>[];
    } else {
      const conditions = textColumns
        .map((col) => `${col} LIKE ?`)
        .join(" OR ");
      const searchPattern = `%${search.trim()}%`;
      const bindValues = [
        ...textColumns.map(() => searchPattern),
        limit,
        offset,
      ];

      const countResult = await db
        .prepare(
          `SELECT COUNT(*) as count FROM ${tableName} WHERE ${conditions}`
        )
        .bind(...textColumns.map(() => searchPattern))
        .first<{ count: number }>();

      total = countResult?.count ?? 0;

      const dataResult = await db
        .prepare(
          `SELECT * FROM ${tableName} WHERE ${conditions} ORDER BY rowid DESC LIMIT ? OFFSET ?`
        )
        .bind(...bindValues)
        .all();

      rows = (dataResult.results ?? []) as Record<string, unknown>[];
    }
  } else {
    const countResult = await db
      .prepare(`SELECT COUNT(*) as count FROM ${tableName}`)
      .first<{ count: number }>();
    total = countResult?.count ?? 0;

    const dataResult = await db
      .prepare(
        `SELECT * FROM ${tableName} ORDER BY rowid DESC LIMIT ? OFFSET ?`
      )
      .bind(limit, offset)
      .all();

    rows = (dataResult.results ?? []) as Record<string, unknown>[];
  }

  return { rows: maskRows(rows), total };
}

export async function insertTableRow(
  db: D1Database,
  tableName: string,
  data: Record<string, unknown>
): Promise<{ lastRowId?: number }> {
  if (!isValidTableName(tableName)) {
    throw new Error("无效的表名");
  }

  const schema = await getTableSchema(db, tableName);
  const allowedColumns = schema
    .map((c) => c.name)
    .filter((name) => name !== "id" && !SENSITIVE_COLUMNS.includes(name));

  const entries = Object.entries(data).filter(
    ([key, value]) =>
      allowedColumns.includes(key) && value !== undefined && value !== ""
  );

  if (entries.length === 0) {
    throw new Error("没有可插入的字段");
  }

  const columns = entries.map(([key]) => key);
  const placeholders = columns.map(() => "?").join(", ");
  const values = entries.map(([, value]) => value);

  const result = await db
    .prepare(
      `INSERT INTO ${tableName} (${columns.join(", ")}) VALUES (${placeholders})`
    )
    .bind(...values)
    .run();

  return { lastRowId: result.meta?.last_row_id };
}

export async function updateTableRow(
  db: D1Database,
  tableName: string,
  id: number,
  data: Record<string, unknown>
): Promise<void> {
  if (!isValidTableName(tableName)) {
    throw new Error("无效的表名");
  }

  const schema = await getTableSchema(db, tableName);
  const allowedColumns = schema
    .map((c) => c.name)
    .filter(
      (name) =>
        name !== "id" &&
        !SENSITIVE_COLUMNS.includes(name) &&
        name in data
    );

  if (allowedColumns.length === 0) {
    throw new Error("没有可更新的字段");
  }

  const setClause = allowedColumns.map((col) => `${col} = ?`).join(", ");
  const values = allowedColumns.map((col) => data[col]);

  await db
    .prepare(`UPDATE ${tableName} SET ${setClause} WHERE id = ?`)
    .bind(...values, id)
    .run();
}

export async function deleteTableRow(
  db: D1Database,
  tableName: string,
  id: number
): Promise<void> {
  if (!isValidTableName(tableName)) {
    throw new Error("无效的表名");
  }

  await db.prepare(`DELETE FROM ${tableName} WHERE id = ?`).bind(id).run();
}
