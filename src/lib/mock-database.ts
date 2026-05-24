import type { D1Database } from "./database-admin";
import {
  KNOWN_TABLES,
  maskRows,
  type ColumnInfo,
  type TableInfo,
} from "./database-admin";

type Row = Record<string, unknown>;

const TABLE_SCHEMAS: Record<string, ColumnInfo[]> = {
  admins: [
    { cid: 0, name: "id", type: "INTEGER", notnull: 0, dflt_value: null, pk: 1 },
    { cid: 1, name: "username", type: "TEXT", notnull: 1, dflt_value: null, pk: 0 },
    { cid: 2, name: "password_hash", type: "TEXT", notnull: 1, dflt_value: null, pk: 0 },
    { cid: 3, name: "email", type: "TEXT", notnull: 0, dflt_value: null, pk: 0 },
    { cid: 4, name: "role", type: "TEXT", notnull: 0, dflt_value: "'admin'", pk: 0 },
    { cid: 5, name: "is_active", type: "INTEGER", notnull: 0, dflt_value: "1", pk: 0 },
    { cid: 6, name: "session_token", type: "TEXT", notnull: 0, dflt_value: null, pk: 0 },
    { cid: 7, name: "last_login_at", type: "TEXT", notnull: 0, dflt_value: null, pk: 0 },
    { cid: 8, name: "created_at", type: "TEXT", notnull: 0, dflt_value: "CURRENT_TIMESTAMP", pk: 0 },
    { cid: 9, name: "updated_at", type: "TEXT", notnull: 0, dflt_value: "CURRENT_TIMESTAMP", pk: 0 },
  ],
  site_content: [
    { cid: 0, name: "id", type: "INTEGER", notnull: 0, dflt_value: null, pk: 1 },
    { cid: 1, name: "content_key", type: "TEXT", notnull: 1, dflt_value: null, pk: 0 },
    { cid: 2, name: "content_value", type: "TEXT", notnull: 0, dflt_value: null, pk: 0 },
    { cid: 3, name: "content_type", type: "TEXT", notnull: 0, dflt_value: "'text'", pk: 0 },
    { cid: 4, name: "description", type: "TEXT", notnull: 0, dflt_value: null, pk: 0 },
    { cid: 5, name: "is_published", type: "INTEGER", notnull: 0, dflt_value: "0", pk: 0 },
    { cid: 6, name: "created_at", type: "TEXT", notnull: 0, dflt_value: "CURRENT_TIMESTAMP", pk: 0 },
    { cid: 7, name: "updated_at", type: "TEXT", notnull: 0, dflt_value: "CURRENT_TIMESTAMP", pk: 0 },
  ],
  operation_logs: [
    { cid: 0, name: "id", type: "INTEGER", notnull: 0, dflt_value: null, pk: 1 },
    { cid: 1, name: "admin_id", type: "INTEGER", notnull: 0, dflt_value: null, pk: 0 },
    { cid: 2, name: "admin_username", type: "TEXT", notnull: 0, dflt_value: null, pk: 0 },
    { cid: 3, name: "action", type: "TEXT", notnull: 1, dflt_value: null, pk: 0 },
    { cid: 4, name: "target_table", type: "TEXT", notnull: 0, dflt_value: null, pk: 0 },
    { cid: 5, name: "target_id", type: "TEXT", notnull: 0, dflt_value: null, pk: 0 },
    { cid: 6, name: "old_value", type: "TEXT", notnull: 0, dflt_value: null, pk: 0 },
    { cid: 7, name: "new_value", type: "TEXT", notnull: 0, dflt_value: null, pk: 0 },
    { cid: 8, name: "ip_address", type: "TEXT", notnull: 0, dflt_value: null, pk: 0 },
    { cid: 9, name: "user_agent", type: "TEXT", notnull: 0, dflt_value: null, pk: 0 },
    { cid: 10, name: "created_at", type: "TEXT", notnull: 0, dflt_value: "CURRENT_TIMESTAMP", pk: 0 },
  ],
  settings: [
    { cid: 0, name: "id", type: "INTEGER", notnull: 0, dflt_value: null, pk: 1 },
    { cid: 1, name: "setting_key", type: "TEXT", notnull: 1, dflt_value: null, pk: 0 },
    { cid: 2, name: "setting_value", type: "TEXT", notnull: 0, dflt_value: null, pk: 0 },
    { cid: 3, name: "setting_type", type: "TEXT", notnull: 0, dflt_value: "'string'", pk: 0 },
    { cid: 4, name: "group_name", type: "TEXT", notnull: 0, dflt_value: "'general'", pk: 0 },
    { cid: 5, name: "description", type: "TEXT", notnull: 0, dflt_value: null, pk: 0 },
    { cid: 6, name: "created_at", type: "TEXT", notnull: 0, dflt_value: "CURRENT_TIMESTAMP", pk: 0 },
    { cid: 7, name: "updated_at", type: "TEXT", notnull: 0, dflt_value: "CURRENT_TIMESTAMP", pk: 0 },
  ],
  user_records: [
    { cid: 0, name: "id", type: "INTEGER", notnull: 0, dflt_value: null, pk: 1 },
    { cid: 1, name: "tool_type", type: "TEXT", notnull: 1, dflt_value: null, pk: 0 },
    { cid: 2, name: "tool_name", type: "TEXT", notnull: 1, dflt_value: null, pk: 0 },
    { cid: 3, name: "usage_count", type: "INTEGER", notnull: 0, dflt_value: "1", pk: 0 },
    { cid: 4, name: "last_used_at", type: "TEXT", notnull: 0, dflt_value: "CURRENT_TIMESTAMP", pk: 0 },
    { cid: 5, name: "created_at", type: "TEXT", notnull: 0, dflt_value: "CURRENT_TIMESTAMP", pk: 0 },
  ],
  favorites: [
    { cid: 0, name: "id", type: "INTEGER", notnull: 0, dflt_value: null, pk: 1 },
    { cid: 1, name: "tool_type", type: "TEXT", notnull: 1, dflt_value: null, pk: 0 },
    { cid: 2, name: "tool_name", type: "TEXT", notnull: 1, dflt_value: null, pk: 0 },
    { cid: 3, name: "user_hash", type: "TEXT", notnull: 0, dflt_value: "'default'", pk: 0 },
    { cid: 4, name: "created_at", type: "TEXT", notnull: 0, dflt_value: "CURRENT_TIMESTAMP", pk: 0 },
  ],
};

export interface MockDataStore {
  admins: Row[];
  site_content: Row[];
  operation_logs: Row[];
  settings: Row[];
  user_records: Row[];
  favorites: Row[];
  nextId: number;
}

export function createDefaultMockStore(): MockDataStore {
  return {
    admins: [
      {
        id: 1,
        username: "admin",
        password_hash: "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9",
        email: "admin@example.com",
        role: "superadmin",
        is_active: 1,
        session_token: null,
        last_login_at: "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    site_content: [
      {
        id: 1,
        content_key: "site_title",
        content_value: "在线工具箱",
        content_type: "text",
        description: "网站标题",
        is_published: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    operation_logs: [],
    settings: [
      {
        id: 1,
        setting_key: "site_name",
        setting_value: "在线工具箱",
        setting_type: "string",
        group_name: "general",
        description: "网站名称",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    user_records: [],
    favorites: [],
    nextId: 100,
  };
}

function getTable(store: MockDataStore, tableName: string): Row[] {
  return store[tableName as keyof MockDataStore] as Row[];
}

function filterRows(rows: Row[], search?: string): Row[] {
  if (!search?.trim()) return rows;
  const pattern = search.trim().toLowerCase();
  return rows.filter((row) =>
    Object.values(row).some((v) =>
      String(v ?? "").toLowerCase().includes(pattern)
    )
  );
}

export function mockGetDatabaseInfo(store: MockDataStore) {
  const tables: TableInfo[] = KNOWN_TABLES.map((name) => ({
    name,
    rowCount: getTable(store, name).length,
  }));

  return {
    connected: false,
    mode: "mock" as const,
    databaseName: "local-mock",
    binding: "DB",
    tables,
  };
}

export function mockGetTableSchema(tableName: string): ColumnInfo[] {
  return TABLE_SCHEMAS[tableName] ?? [];
}

export function mockGetTableRows(
  store: MockDataStore,
  tableName: string,
  page: number,
  limit: number,
  search?: string
) {
  const all = filterRows([...getTable(store, tableName)], search).sort(
    (a, b) => Number(b.id) - Number(a.id)
  );
  const offset = (page - 1) * limit;
  const rows = all.slice(offset, offset + limit);
  return { rows: maskRows(rows), total: all.length };
}

export function mockInsertRow(
  store: MockDataStore,
  tableName: string,
  data: Record<string, unknown>
) {
  const table = getTable(store, tableName);
  const id = store.nextId++;
  const row = { id, ...data, created_at: new Date().toISOString() };
  table.push(row);
  return { lastRowId: id };
}

export function mockUpdateRow(
  store: MockDataStore,
  tableName: string,
  id: number,
  data: Record<string, unknown>
) {
  const table = getTable(store, tableName);
  const index = table.findIndex((r) => r.id === id);
  if (index === -1) throw new Error("记录不存在");
  table[index] = { ...table[index], ...data, updated_at: new Date().toISOString() };
}

export function mockDeleteRow(
  store: MockDataStore,
  tableName: string,
  id: number
) {
  const table = getTable(store, tableName);
  const index = table.findIndex((r) => r.id === id);
  if (index === -1) throw new Error("记录不存在");
  table.splice(index, 1);
}

/** Wraps mock store as a D1-compatible interface for shared admin helpers */
export function createMockD1Adapter(store: MockDataStore): D1Database {
  return {
    prepare(sql: string) {
      const stmt = {
        _bindArgs: [] as unknown[],
        bind(...args: unknown[]) {
          stmt._bindArgs = args;
          return stmt;
        },
        async first<T = Row>() {
          const tableMatch = sql.match(/FROM\s+(\w+)/i);
          const tableName = tableMatch?.[1];
          if (!tableName) return null;

          if (sql.includes("COUNT(*)")) {
            const rows = getTable(store, tableName);
            if (sql.includes("WHERE") && stmt._bindArgs.length > 0) {
              const filtered = filterRows(rows, String(stmt._bindArgs[0]).replace(/%/g, ""));
              return { count: filtered.length } as T;
            }
            return { count: rows.length } as T;
          }

          if (sql.includes("PRAGMA table_info")) {
            return null;
          }

          return null;
        },
        async all<T = Row>() {
          const tableMatch = sql.match(/FROM\s+(\w+)/i);
          const tableName = tableMatch?.[1];
          if (!tableName) return { results: [] as T[] };

          if (sql.includes("PRAGMA table_info")) {
            return { results: mockGetTableSchema(tableName) as T[] };
          }

          const limit = Number(stmt._bindArgs[stmt._bindArgs.length - 2] ?? 20);
          const offset = Number(stmt._bindArgs[stmt._bindArgs.length - 1] ?? 0);
          const page = Math.floor(offset / limit) + 1;
          const searchArg = sql.includes("WHERE") ? String(stmt._bindArgs[0] ?? "").replace(/%/g, "") : undefined;
          const { rows } = mockGetTableRows(store, tableName, page, limit, searchArg);
          return { results: rows as T[] };
        },
        async run() {
          return { meta: { last_row_id: store.nextId, changes: 1 } };
        },
      };
      return stmt;
    },
  };
}
