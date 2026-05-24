import { NextResponse } from "next/server";
import {
  type D1Database,
  deleteTableRow,
  getDatabaseInfo,
  getTableRows,
  getTableSchema,
  insertTableRow,
  isValidTableName,
  updateTableRow,
} from "@/lib/database-admin";
import {
  type MockDataStore,
  mockDeleteRow,
  mockGetDatabaseInfo,
  mockGetTableRows,
  mockGetTableSchema,
  mockInsertRow,
  mockUpdateRow,
} from "@/lib/mock-database";

interface AdminContext {
  id: number;
  username: string;
}

export async function handleDatabaseGet(
  action: string,
  url: URL,
  db: D1Database | null,
  isLocal: boolean,
  mockStore: MockDataStore
) {
  switch (action) {
    case "db-info": {
      if (isLocal || !db) {
        return NextResponse.json(mockGetDatabaseInfo(mockStore));
      }
      return NextResponse.json(await getDatabaseInfo(db, "d1"));
    }

    case "db-schema": {
      const table = url.searchParams.get("table") || "";
      if (!isValidTableName(table)) {
        return NextResponse.json({ error: "无效的表名" }, { status: 400 });
      }
      if (isLocal || !db) {
        return NextResponse.json({ schema: mockGetTableSchema(table) });
      }
      const schema = await getTableSchema(db, table);
      return NextResponse.json({ schema });
    }

    case "db-rows": {
      const table = url.searchParams.get("table") || "";
      const page = parseInt(url.searchParams.get("page") || "1");
      const limit = parseInt(url.searchParams.get("limit") || "20");
      const search = url.searchParams.get("search") || undefined;

      if (!isValidTableName(table)) {
        return NextResponse.json({ error: "无效的表名" }, { status: 400 });
      }

      if (isLocal || !db) {
        const result = mockGetTableRows(mockStore, table, page, limit, search);
        return NextResponse.json({ ...result, page, limit, table });
      }

      const result = await getTableRows(db, table, page, limit, search);
      return NextResponse.json({ ...result, page, limit, table });
    }

    default:
      return null;
  }
}

export async function handleDatabasePost(
  action: string,
  data: Record<string, unknown>,
  db: D1Database | null,
  isLocal: boolean,
  mockStore: MockDataStore,
  admin: AdminContext,
  ipAddress: string,
  userAgent: string,
  logOperation: (
    actionName: string,
    table: string,
    targetId: string,
    oldValue?: string,
    newValue?: string
  ) => Promise<void>
) {
  switch (action) {
    case "db-insert-row": {
      const { table, row } = data as {
        table: string;
        row: Record<string, unknown>;
      };

      if (!isValidTableName(table)) {
        return NextResponse.json({ error: "无效的表名" }, { status: 400 });
      }

      try {
        let result;
        if (isLocal || !db) {
          result = mockInsertRow(mockStore, table, row);
        } else {
          result = await insertTableRow(db, table, row);
        }

        await logOperation(
          "数据库插入",
          table,
          String(result.lastRowId ?? ""),
          "",
          JSON.stringify(row)
        );

        return NextResponse.json({ success: true, id: result.lastRowId });
      } catch (err) {
        return NextResponse.json(
          { error: err instanceof Error ? err.message : "插入失败" },
          { status: 400 }
        );
      }
    }

    case "db-update-row": {
      const { table, id, row } = data as {
        table: string;
        id: number;
        row: Record<string, unknown>;
      };

      if (!isValidTableName(table)) {
        return NextResponse.json({ error: "无效的表名" }, { status: 400 });
      }

      try {
        if (isLocal || !db) {
          mockUpdateRow(mockStore, table, id, row);
        } else {
          await updateTableRow(db, table, id, row);
        }

        await logOperation(
          "数据库更新",
          table,
          String(id),
          "",
          JSON.stringify(row)
        );

        return NextResponse.json({ success: true });
      } catch (err) {
        return NextResponse.json(
          { error: err instanceof Error ? err.message : "更新失败" },
          { status: 400 }
        );
      }
    }

    case "db-delete-row": {
      const { table, id } = data as { table: string; id: number };

      if (!isValidTableName(table)) {
        return NextResponse.json({ error: "无效的表名" }, { status: 400 });
      }

      if (table === "admins" && id === admin.id) {
        return NextResponse.json(
          { error: "不能删除当前登录的管理员" },
          { status: 400 }
        );
      }

      try {
        if (isLocal || !db) {
          mockDeleteRow(mockStore, table, id);
        } else {
          await deleteTableRow(db, table, id);
        }

        await logOperation("数据库删除", table, String(id));

        return NextResponse.json({ success: true });
      } catch (err) {
        return NextResponse.json(
          { error: err instanceof Error ? err.message : "删除失败" },
          { status: 400 }
        );
      }
    }

    default:
      return null;
  }
}
