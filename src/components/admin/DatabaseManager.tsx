"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Database,
  Table2,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Search,
  Server,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

interface TableInfo {
  name: string;
  rowCount: number;
}

interface DbInfo {
  connected: boolean;
  mode: "d1" | "mock";
  databaseName: string;
  binding: string;
  tables: TableInfo[];
}

interface ColumnInfo {
  cid: number;
  name: string;
  type: string;
  notnull: number;
  dflt_value: string | null;
  pk: number;
}

interface DatabaseManagerProps {
  token: string;
  fetchData: (action: string, params?: Record<string, string>) => Promise<any>;
  postData: (action: string, data: any) => Promise<any>;
}

const TABLE_LABELS: Record<string, string> = {
  admins: "管理员",
  site_content: "站点内容",
  operation_logs: "操作日志",
  settings: "系统设置",
  user_records: "使用记录",
  favorites: "收藏",
};

export function DatabaseManager({
  token,
  fetchData,
  postData,
}: DatabaseManagerProps) {
  const [dbInfo, setDbInfo] = useState<DbInfo | null>(null);
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [schema, setSchema] = useState<ColumnInfo[]>([]);
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showRowModal, setShowRowModal] = useState(false);
  const [editingRow, setEditingRow] = useState<Record<string, unknown> | null>(
    null
  );
  const [rowForm, setRowForm] = useState<Record<string, string>>({});

  const limit = 15;

  const loadDbInfo = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchData("db-info");
      if (data.error) {
        setError(
          data.error === "未授权" || data.error?.includes("未授权")
            ? "登录已失效或未授权：请先退出后重新登录（默认账号 admin / admin123）"
            : data.error
        );
      } else {
        setDbInfo(data);
        if (!selectedTable && data.tables?.length > 0) {
          setSelectedTable(data.tables[0].name);
        }
      }
    } catch {
      setError("加载数据库信息失败");
    }
    setLoading(false);
  }, [fetchData, selectedTable]);

  const loadTableData = useCallback(async () => {
    if (!selectedTable) return;
    setLoading(true);
    setError("");
    try {
      const [schemaData, rowsData] = await Promise.all([
        fetchData("db-schema", { table: selectedTable }),
        fetchData("db-rows", {
          table: selectedTable,
          page: String(page),
          limit: String(limit),
          ...(search ? { search } : {}),
        }),
      ]);

      if (schemaData.schema) setSchema(schemaData.schema);
      if (rowsData.rows) {
        setRows(rowsData.rows);
        setTotal(rowsData.total ?? 0);
      }
      if (rowsData.error) setError(rowsData.error);
    } catch {
      setError("加载表数据失败");
    }
    setLoading(false);
  }, [fetchData, selectedTable, page, search]);

  useEffect(() => {
    if (token) loadDbInfo();
  }, [token, loadDbInfo]);

  useEffect(() => {
    if (token && selectedTable) loadTableData();
  }, [token, selectedTable, page, search, loadTableData]);

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput);
  };

  const openAddRow = () => {
    setEditingRow(null);
    const form: Record<string, string> = {};
    schema
      .filter((c) => c.name !== "id" && !["password_hash", "session_token"].includes(c.name))
      .forEach((c) => {
        form[c.name] = c.dflt_value?.replace(/'/g, "") || "";
      });
    setRowForm(form);
    setShowRowModal(true);
  };

  const openEditRow = (row: Record<string, unknown>) => {
    setEditingRow(row);
    const form: Record<string, string> = {};
    schema
      .filter((c) => c.name !== "id" && !["password_hash", "session_token"].includes(c.name))
      .forEach((c) => {
        const val = row[c.name];
        form[c.name] = val != null ? String(val) : "";
      });
    setRowForm(form);
    setShowRowModal(true);
  };

  const handleSaveRow = async () => {
    const rowData: Record<string, unknown> = {};
    Object.entries(rowForm).forEach(([key, value]) => {
      if (value !== "") {
        const col = schema.find((c) => c.name === key);
        if (col?.type.toUpperCase().includes("INTEGER")) {
          rowData[key] = parseInt(value) || 0;
        } else {
          rowData[key] = value;
        }
      }
    });

    let result;
    if (editingRow) {
      result = await postData("db-update-row", {
        table: selectedTable,
        id: editingRow.id,
        row: rowData,
      });
    } else {
      result = await postData("db-insert-row", {
        table: selectedTable,
        row: rowData,
      });
    }

    if (result.success) {
      setShowRowModal(false);
      loadTableData();
      loadDbInfo();
    } else {
      alert(result.error || "操作失败");
    }
  };

  const handleDeleteRow = async (row: Record<string, unknown>) => {
    if (!confirm(`确定要删除这条记录 (ID: ${row.id}) 吗？`)) return;

    const result = await postData("db-delete-row", {
      table: selectedTable,
      id: row.id,
    });

    if (result.success) {
      loadTableData();
      loadDbInfo();
    } else {
      alert(result.error || "删除失败");
    }
  };

  const columns =
    rows.length > 0
      ? Object.keys(rows[0])
      : schema.map((c) => c.name);

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-violet-400" />
            数据库管理
          </h2>
          <p className="text-sm text-slate-300 mt-1">
            对接 Cloudflare D1 数据库，浏览和管理数据表
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            loadDbInfo();
            loadTableData();
          }}
          className="text-slate-200 hover:text-white hover:bg-slate-800"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          刷新
        </Button>
      </div>

      {/* Connection Status */}
      {dbInfo && (
        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${dbInfo.connected ? "bg-emerald-500/10" : "bg-amber-500/10"}`}>
                  {dbInfo.connected ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-400" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    {dbInfo.connected ? "已连接 D1 数据库" : "本地模拟模式"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {dbInfo.connected
                      ? "生产环境已绑定 Cloudflare D1"
                      : "开发环境使用内存模拟数据，部署后将自动连接真实数据库"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Server className="w-4 h-4 text-slate-500" />
                <span className="text-slate-400">数据库:</span>
                <code className="px-2 py-0.5 rounded bg-slate-800 text-violet-300 font-mono text-xs">
                  {dbInfo.databaseName}
                </code>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-400">绑定:</span>
                <code className="px-2 py-0.5 rounded bg-slate-800 text-sky-300 font-mono text-xs">
                  {dbInfo.binding}
                </code>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-400">表数量:</span>
                <span className="text-white font-medium">{dbInfo.tables.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Table List Sidebar */}
        <Card className="lg:w-56 shrink-0 border-slate-800 bg-slate-900/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
              <Table2 className="w-4 h-4 text-violet-300" />
              数据表
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 pt-0 space-y-1">
            {dbInfo?.tables.map((table) => (
              <button
                key={table.name}
                onClick={() => {
                  setSelectedTable(table.name);
                  setPage(1);
                  setSearch("");
                  setSearchInput("");
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  selectedTable === table.name
                    ? "bg-violet-600 text-white border border-violet-500 shadow-sm"
                    : "text-slate-200 hover:text-white hover:bg-slate-800 border border-slate-700/50"
                }`}
              >
                <span>{TABLE_LABELS[table.name] || table.name}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded ${
                  selectedTable === table.name
                    ? "bg-violet-500/50 text-white"
                    : "text-slate-300 bg-slate-700"
                }`}>
                  {table.rowCount}
                </span>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Table Data */}
        <div className="flex-1 min-w-0 space-y-4">
          {selectedTable && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-medium text-white">
                    {TABLE_LABELS[selectedTable] || selectedTable}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    {selectedTable} · 共 {total} 条记录
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      placeholder="搜索..."
                      className="pl-9 w-48 bg-slate-800 border-slate-600 text-white text-sm placeholder:text-slate-400"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSearch}
                    className="border-slate-700 text-slate-300"
                  >
                    搜索
                  </Button>
                  <Button
                    size="sm"
                    onClick={openAddRow}
                    className="bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    新增
                  </Button>
                </div>
              </div>

              {/* Schema */}
              <Card className="border-slate-800 bg-slate-900/30">
                <CardContent className="py-3 px-4">
                  <div className="flex flex-wrap gap-2">
                    {schema.map((col) => (
                      <span
                        key={col.name}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-slate-800/80 border border-slate-700/50"
                      >
                        <span className="text-slate-300 font-mono">{col.name}</span>
                        <span className="text-slate-500">{col.type}</span>
                        {col.pk === 1 && (
                          <span className="text-amber-400 text-[10px]">PK</span>
                        )}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Data Table */}
              <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm overflow-hidden">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-800 bg-slate-900/80">
                          {columns.map((col) => (
                            <th
                              key={col}
                              className="text-left py-3 px-4 font-medium text-xs uppercase tracking-wider text-slate-400 whitespace-nowrap"
                            >
                              {col}
                            </th>
                          ))}
                          <th className="text-right py-3 px-4 font-medium text-xs uppercase tracking-wider text-slate-400">
                            操作
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                        {loading ? (
                          <tr>
                            <td
                              colSpan={columns.length + 1}
                              className="text-center py-12 text-slate-500"
                            >
                              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 opacity-50" />
                              加载中...
                            </td>
                          </tr>
                        ) : rows.length === 0 ? (
                          <tr>
                            <td
                              colSpan={columns.length + 1}
                              className="text-center py-12 text-slate-500"
                            >
                              暂无数据
                            </td>
                          </tr>
                        ) : (
                          rows.map((row, idx) => (
                            <tr
                              key={String(row.id ?? idx)}
                              className="hover:bg-slate-800/30 transition-colors"
                            >
                              {columns.map((col) => (
                                <td
                                  key={col}
                                  className="py-3 px-4 text-slate-300 max-w-[200px] truncate font-mono text-xs"
                                  title={String(row[col] ?? "")}
                                >
                                  {row[col] != null ? String(row[col]) : (
                                    <span className="text-slate-600">NULL</span>
                                  )}
                                </td>
                              ))}
                              <td className="py-3 px-4 text-right whitespace-nowrap">
                                <div className="flex justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openEditRow(row)}
                                    className="hover:bg-slate-700/50 text-slate-400 hover:text-white"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteRow(row)}
                                    className="hover:bg-red-500/10 text-slate-400 hover:text-red-400"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    className="border-slate-700 text-slate-300"
                  >
                    上一页
                  </Button>
                  <span className="text-sm text-slate-400">
                    第 <span className="text-white">{page}</span> / {totalPages} 页
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                    className="border-slate-700 text-slate-300"
                  >
                    下一页
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Row Edit Modal */}
      <Dialog open={showRowModal} onOpenChange={setShowRowModal}>
        <DialogContent className="border-slate-800 bg-slate-900 shadow-2xl max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-white">
              {editingRow ? "编辑记录" : "新增记录"} — {TABLE_LABELS[selectedTable] || selectedTable}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            {schema
              .filter(
                (c) =>
                  c.name !== "id" &&
                  !["password_hash", "session_token"].includes(c.name)
              )
              .map((col) => (
                <div key={col.name} className="space-y-1">
                  <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <span className="font-mono">{col.name}</span>
                    <span className="text-xs text-slate-500">{col.type}</span>
                    {col.pk === 1 && (
                      <span className="text-[10px] text-amber-400">主键</span>
                    )}
                  </label>
                  <Input
                    value={rowForm[col.name] ?? ""}
                    onChange={(e) =>
                      setRowForm({ ...rowForm, [col.name]: e.target.value })
                    }
                    placeholder={col.dflt_value?.replace(/'/g, "") || ""}
                    className="bg-slate-800/50 border-slate-700 font-mono text-sm"
                  />
                </div>
              ))}
            <div className="flex justify-end gap-3 pt-3">
              <Button
                variant="outline"
                onClick={() => setShowRowModal(false)}
                className="border-slate-700 text-slate-300"
              >
                取消
              </Button>
              <Button
                onClick={handleSaveRow}
                className="bg-gradient-to-r from-violet-600 to-violet-500 text-white"
              >
                {editingRow ? "保存" : "创建"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
