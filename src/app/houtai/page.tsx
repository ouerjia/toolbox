"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  Activity,
  Shield,
  LogOut,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  TrendingUp,
  Heart,
  Clock,
  Eye,
  EyeOff,
  Sparkles,
  ChevronRight,
  Zap,
  Database,
} from "lucide-react";
import { DatabaseManager } from "@/components/admin/DatabaseManager";

interface Admin {
  id: number;
  username: string;
  email: string;
  role: string;
  is_active: number;
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
  ip_address: string;
  created_at: string;
}

interface Stats {
  totalUsage: number;
  totalFavorites: number;
  totalAdmins: number;
  topTools: { tool_name: string; total: number }[];
  recentLogs: OperationLog[];
}

const CHART_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#3b82f6"];
const STAT_CARD_STYLES = [
  { gradient: "from-indigo-500/10 to-indigo-500/5", border: "border-indigo-500/20", icon: "text-indigo-400", glow: "shadow-indigo-500/5" },
  { gradient: "from-emerald-500/10 to-emerald-500/5", border: "border-emerald-500/20", icon: "text-emerald-400", glow: "shadow-emerald-500/5" },
  { gradient: "from-amber-500/10 to-amber-500/5", border: "border-amber-500/20", icon: "text-amber-400", glow: "shadow-amber-500/5" },
  { gradient: "from-sky-500/10 to-sky-500/5", border: "border-sky-500/20", icon: "text-sky-400", glow: "shadow-sky-500/5" },
];

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [activeTab, setActiveTab] = useState<
    | "dashboard"
    | "admins"
    | "content"
    | "logs"
    | "database"
    | "settings"
  >("dashboard");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");
  const [adminInfo, setAdminInfo] = useState<{ id: number; username: string; role: string } | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [contents, setContents] = useState<SiteContent[]>([]);
  const [logs, setLogs] = useState<OperationLog[]>([]);
  const [logPage, setLogPage] = useState(1);
  const [logTotal, setLogTotal] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showContentModal, setShowContentModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [editingContent, setEditingContent] = useState<SiteContent | null>(null);
  const [adminForm, setAdminForm] = useState({
    username: "",
    password: "",
    email: "",
    role: "admin",
  });
  const [contentForm, setContentForm] = useState({
    content_key: "",
    content_value: "",
    content_type: "text",
    description: "",
    is_published: false,
  });

  useEffect(() => {
    const savedToken = sessionStorage.getItem("adminToken");
    const savedAdmin = sessionStorage.getItem("adminInfo");
    if (savedToken && savedAdmin) {
      setToken(savedToken);
      setAdminInfo(JSON.parse(savedAdmin));
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = async () => {
    if (!username || !password) {
      setLoginError("请输入用户名和密码");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/houtai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "login",
          data: { username, password },
        }),
      });

      const data = await response.json();

      if (data.success) {
        setToken(data.token);
        setAdminInfo(data.admin);
        setIsAuthenticated(true);
        sessionStorage.setItem("adminToken", data.token);
        sessionStorage.setItem("adminInfo", JSON.stringify(data.admin));
        setLoginError("");
      } else {
        setLoginError(data.error || "登录失败");
      }
    } catch (error) {
      setLoginError("网络错误，请重试");
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/houtai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: "logout" }),
      });
    } catch (error) {
      console.error("Logout error:", error);
    }

    setIsAuthenticated(false);
    setToken("");
    setAdminInfo(null);
    sessionStorage.removeItem("adminToken");
    sessionStorage.removeItem("adminInfo");
    setUsername("");
    setPassword("");
  };

  const getAuthToken = () =>
    token || sessionStorage.getItem("adminToken") || "";

  const fetchData = async (action: string, params?: Record<string, any>) => {
    const url = new URL("/api/houtai", window.location.origin);
    url.searchParams.set("action", action);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, String(value));
      });
    }

    const authToken = getAuthToken();
    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    return response.json();
  };

  const postData = async (action: string, data: any) => {
    const response = await fetch("/api/houtai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({ action, data }),
    });

    return response.json();
  };

  const loadStats = async () => {
    setLoading(true);
    const data = await fetchData("stats");
    if (data.totalUsage !== undefined) {
      setStats(data);
    }
    setLoading(false);
  };

  const loadAdmins = async () => {
    setLoading(true);
    const data = await fetchData("admins");
    if (data.admins) {
      setAdmins(data.admins);
    }
    setLoading(false);
  };

  const loadContents = async () => {
    setLoading(true);
    const data = await fetchData("site-content");
    if (data.contents) {
      setContents(data.contents);
    }
    setLoading(false);
  };

  const loadLogs = async (page: number = 1) => {
    setLoading(true);
    const data = await fetchData("operation-logs", { page, limit: 20 });
    if (data.logs) {
      setLogs(data.logs);
      setLogPage(data.page);
      setLogTotal(data.total);
    }
    setLoading(false);
  };

  const handleCreateAdmin = async () => {
    if (!adminForm.username || !adminForm.password) {
      alert("请填写用户名和密码");
      return;
    }

    const result = await postData("create-admin", adminForm);
    if (result.success) {
      setShowAdminModal(false);
      setAdminForm({ username: "", password: "", email: "", role: "admin" });
      loadAdmins();
    } else {
      alert(result.error || "创建失败");
    }
  };

  const handleUpdateAdmin = async () => {
    if (!editingAdmin) return;

    const result = await postData("update-admin", {
      id: editingAdmin.id,
      email: adminForm.email,
      role: adminForm.role,
      is_active: adminForm.role !== "",
    });

    if (result.success) {
      setShowAdminModal(false);
      setEditingAdmin(null);
      setAdminForm({ username: "", password: "", email: "", role: "admin" });
      loadAdmins();
    } else {
      alert(result.error || "更新失败");
    }
  };

  const handleDeleteAdmin = async (id: number) => {
    if (!confirm("确定要删除这个管理员吗？")) return;

    const result = await postData("update-admin", {
      id,
      email: "",
      role: "deleted",
      is_active: false,
    });

    if (result.success) {
      loadAdmins();
    } else {
      alert(result.error || "删除失败");
    }
  };

  const handleCreateContent = async () => {
    if (!contentForm.content_key) {
      alert("请填写内容键");
      return;
    }

    const result = await postData("create-content", contentForm);
    if (result.success) {
      setShowContentModal(false);
      setContentForm({
        content_key: "",
        content_value: "",
        content_type: "text",
        description: "",
        is_published: false,
      });
      loadContents();
    } else {
      alert(result.error || "创建失败");
    }
  };

  const handleUpdateContent = async () => {
    if (!editingContent) return;

    const result = await postData("update-content", {
      content_key: editingContent.content_key,
      content_value: contentForm.content_value,
      is_published: contentForm.is_published,
    });

    if (result.success) {
      setShowContentModal(false);
      setEditingContent(null);
      setContentForm({
        content_key: "",
        content_value: "",
        content_type: "text",
        description: "",
        is_published: false,
      });
      loadContents();
    } else {
      alert(result.error || "更新失败");
    }
  };

  const handleDeleteContent = async (contentKey: string) => {
    if (!confirm("确定要删除这个内容吗？")) return;

    const result = await postData("delete-content", { content_key: contentKey });
    if (result.success) {
      loadContents();
    } else {
      alert(result.error || "删除失败");
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      switch (activeTab) {
        case "dashboard":
          loadStats();
          break;
        case "admins":
          loadAdmins();
          break;
        case "content":
          loadContents();
          break;
        case "logs":
          loadLogs();
          break;
      }
    }
  }, [isAuthenticated, activeTab]);

  if (!isAuthenticated) {
    return (
      <div className="dark min-h-screen bg-[#020617] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-emerald-900/10 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />

        <Card className="w-full max-w-md border-slate-800 bg-slate-900/80 backdrop-blur-2xl shadow-2xl shadow-black/50 relative z-10 animate-in fade-in duration-500">
          <CardHeader className="space-y-1 text-center pb-6">
            <div className="mx-auto w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-900/50 ring-2 ring-indigo-400/40 mb-3">
              <Sparkles className="w-6 h-6 text-white" strokeWidth={2.25} />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-white">
              管理后台
            </CardTitle>
            <p className="text-sm text-slate-300">请输入您的凭据以继续</p>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">用户名</label>
              <Input
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setLoginError("");
                }}
                placeholder="输入用户名..."
                className="bg-slate-800/50 border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">密码</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setLoginError("");
                  }}
                  onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                  placeholder="输入密码..."
                  className="bg-slate-800/50 border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all pr-10 placeholder:text-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {loginError && (
              <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {loginError}
              </div>
            )}
            <Button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-medium shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300 h-11"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  登录中...
                </span>
              ) : (
                "登录"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const menuItems = [
    { id: "dashboard", name: "数据概览", icon: LayoutDashboard },
    { id: "admins", name: "管理员管理", icon: Users },
    { id: "content", name: "内容管理", icon: FileText },
    { id: "database", name: "数据库管理", icon: Database },
    { id: "logs", name: "操作日志", icon: Activity },
  ];

  const renderDashboard = () => {
    if (!stats) return null;

    const pieData = stats.topTools.map((tool) => ({
      name: tool.tool_name,
      value: tool.total,
    }));

    const statCards = [
      { label: "总使用次数", value: stats.totalUsage, icon: TrendingUp, index: 0 },
      { label: "总收藏数", value: stats.totalFavorites, icon: Heart, index: 1 },
      { label: "管理员数", value: stats.totalAdmins, icon: Users, index: 2 },
      { label: "热门工具", value: stats.topTools[0]?.tool_name || "暂无", icon: Zap, index: 3 },
    ];

    return (
      <div className="space-y-8">
        {/* Stats Grid */}
        <div>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">概览</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((card) => {
              const style = STAT_CARD_STYLES[card.index];
              return (
                <Card
                  key={card.label}
                  className={`bg-gradient-to-br ${style.gradient} border ${style.border} shadow-lg ${style.glow} hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group`}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-300">
                      {card.label}
                    </CardTitle>
                    <div className={`p-2 rounded-lg bg-slate-800/50 ${style.icon}`}>
                      <card.icon className="h-4 w-4" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white tracking-tight group-hover:scale-105 transition-transform origin-left duration-300">
                      {card.value}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Charts & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <Card className="lg:col-span-3 border-slate-800 bg-slate-900/50 backdrop-blur-sm shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                <BarChart className="w-4 h-4 text-indigo-400" />
                工具使用排行
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={stats.topTools} barSize={36} barGap={8}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis
                    dataKey="tool_name"
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                    axisLine={{ stroke: "#1e293b" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid #334155",
                      borderRadius: "12px",
                      boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
                    }}
                    labelStyle={{ color: "#e2e8f0", fontWeight: 600, marginBottom: 4 }}
                    itemStyle={{ color: "#cbd5e1" }}
                    cursor={{ fill: "rgba(99,102,241,0.05)" }}
                  />
                  <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                    {stats.topTools.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                        fillOpacity={0.85}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 border-slate-800 bg-slate-900/50 backdrop-blur-sm shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                最新操作
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {stats.recentLogs.length === 0 ? (
                  <p className="text-slate-500 text-sm text-center py-8">暂无操作记录</p>
                ) : (
                  stats.recentLogs.map((log, i) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between text-sm py-3 px-3 rounded-lg hover:bg-slate-800/50 transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center text-xs font-medium text-slate-200 shrink-0">
                          {log.admin_username.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-200 truncate">
                            {log.admin_username}
                          </p>
                          <p className="text-slate-500 text-xs truncate">{log.action}</p>
                        </div>
                      </div>
                      <span className="text-slate-600 text-xs shrink-0 ml-3">
                        {new Date(log.created_at).toLocaleString("zh-CN")}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderAdmins = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-white">管理员列表</h2>
            <p className="text-sm text-slate-300 mt-1">管理系统中的所有管理员账户</p>
          </div>
          <Button
            onClick={() => {
              setEditingAdmin(null);
              setAdminForm({ username: "", password: "", email: "", role: "admin" });
              setShowAdminModal(true);
            }}
            className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all duration-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            添加管理员
          </Button>
        </div>

        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm shadow-xl overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/80">
                    <th className="text-left py-4 px-5 font-semibold text-xs uppercase tracking-wider text-slate-300">用户名</th>
                    <th className="text-left py-4 px-5 font-semibold text-xs uppercase tracking-wider text-slate-300">邮箱</th>
                    <th className="text-left py-4 px-5 font-semibold text-xs uppercase tracking-wider text-slate-300">角色</th>
                    <th className="text-left py-4 px-5 font-semibold text-xs uppercase tracking-wider text-slate-300">状态</th>
                    <th className="text-left py-4 px-5 font-semibold text-xs uppercase tracking-wider text-slate-300">最后登录</th>
                    <th className="text-right py-4 px-5 font-semibold text-xs uppercase tracking-wider text-slate-300">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {admins.map((admin) => (
                    <tr key={admin.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 px-5 font-medium text-white">{admin.username}</td>
                      <td className="py-4 px-5 text-slate-400">{admin.email || "-"}</td>
                      <td className="py-4 px-5">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          admin.role === "superadmin"
                            ? "bg-purple-500/10 text-purple-300 border border-purple-500/20"
                            : "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                        }`}>
                          {admin.role === "superadmin" ? "超级管理员" : "管理员"}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <span className="inline-flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            admin.is_active ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]" : "bg-rose-400"
                          }`} />
                          <span className={`text-xs font-medium ${
                            admin.is_active ? "text-emerald-400" : "text-rose-400"
                          }`}>
                            {admin.is_active ? "启用" : "禁用"}
                          </span>
                        </span>
                      </td>
                      <td className="py-4 px-5 text-sm text-slate-500">
                        {admin.last_login_at
                          ? new Date(admin.last_login_at).toLocaleString("zh-CN")
                          : "从未登录"}
                      </td>
                      <td className="py-4 px-5 text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingAdmin(admin);
                              setAdminForm({
                                username: admin.username,
                                password: "",
                                email: admin.email,
                                role: admin.role,
                              });
                              setShowAdminModal(true);
                            }}
                            className="hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          {admin.id !== adminInfo?.id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteAdmin(admin.id)}
                              className="hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderContent = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-white">内容管理</h2>
            <p className="text-sm text-slate-300 mt-1">管理网站的动态内容配置</p>
          </div>
          <Button
            onClick={() => {
              setEditingContent(null);
              setContentForm({
                content_key: "",
                content_value: "",
                content_type: "text",
                description: "",
                is_published: false,
              });
              setShowContentModal(true);
            }}
            className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all duration-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            添加内容
          </Button>
        </div>

        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm shadow-xl overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/80">
                    <th className="text-left py-4 px-5 font-semibold text-xs uppercase tracking-wider text-slate-300">内容键</th>
                    <th className="text-left py-4 px-5 font-semibold text-xs uppercase tracking-wider text-slate-300">类型</th>
                    <th className="text-left py-4 px-5 font-semibold text-xs uppercase tracking-wider text-slate-300">描述</th>
                    <th className="text-left py-4 px-5 font-semibold text-xs uppercase tracking-wider text-slate-300">状态</th>
                    <th className="text-left py-4 px-5 font-semibold text-xs uppercase tracking-wider text-slate-300">更新时间</th>
                    <th className="text-right py-4 px-5 font-semibold text-xs uppercase tracking-wider text-slate-300">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {contents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-16 text-slate-500">
                        <FileText className="w-8 h-8 mx-auto mb-3 opacity-30" />
                        暂无内容
                      </td>
                    </tr>
                  ) : (
                    contents.map((content) => (
                      <tr key={content.content_key} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-4 px-5 font-medium text-white font-mono text-sm">
                          {content.content_key}
                        </td>
                        <td className="py-4 px-5">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-700/50 text-slate-300 border border-slate-600/30">
                            {content.content_type}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-sm text-slate-400 max-w-xs truncate">
                          {content.description || "-"}
                        </td>
                        <td className="py-4 px-5">
                          <span className={`inline-flex items-center gap-1.5 ${
                            content.is_published
                              ? "text-emerald-400"
                              : "text-amber-400"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              content.is_published
                                ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]"
                                : "bg-amber-400"
                            }`} />
                            <span className="text-xs font-medium">
                              {content.is_published ? "已发布" : "草稿"}
                            </span>
                          </span>
                        </td>
                        <td className="py-4 px-5 text-sm text-slate-500">
                          {new Date(content.updated_at).toLocaleString("zh-CN")}
                        </td>
                        <td className="py-4 px-5 text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingContent(content);
                                setContentForm({
                                  content_key: content.content_key,
                                  content_value: content.content_value,
                                  content_type: content.content_type,
                                  description: content.description,
                                  is_published: !!content.is_published,
                                });
                                setShowContentModal(true);
                              }}
                              className="hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteContent(content.content_key)}
                              className="hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
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
      </div>
    );
  };

  const renderLogs = () => {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-white">操作日志</h2>
          <p className="text-sm text-slate-400 mt-1">追踪所有管理员的操作记录</p>
        </div>

        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm shadow-xl overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/80">
                    <th className="text-left py-4 px-5 font-semibold text-xs uppercase tracking-wider text-slate-300">时间</th>
                    <th className="text-left py-4 px-5 font-semibold text-xs uppercase tracking-wider text-slate-300">管理员</th>
                    <th className="text-left py-4 px-5 font-semibold text-xs uppercase tracking-wider text-slate-300">操作</th>
                    <th className="text-left py-4 px-5 font-semibold text-xs uppercase tracking-wider text-slate-300">目标</th>
                    <th className="text-left py-4 px-5 font-semibold text-xs uppercase tracking-wider text-slate-300">IP地址</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-16 text-slate-500">
                        <Activity className="w-8 h-8 mx-auto mb-3 opacity-30" />
                        暂无日志
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-4 px-5 text-sm text-slate-400">
                          {new Date(log.created_at).toLocaleString("zh-CN")}
                        </td>
                        <td className="py-4 px-5">
                          <span className="font-medium text-white">{log.admin_username}</span>
                        </td>
                        <td className="py-4 px-5">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-sky-500/10 text-sky-300 border border-sky-500/20">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-4 px-5">
                          <div className="text-sm text-slate-300">{log.target_table}</div>
                          {log.target_id && (
                            <div className="text-xs text-slate-500 mt-0.5">ID: {log.target_id}</div>
                          )}
                        </td>
                        <td className="py-4 px-5 text-sm text-slate-500 font-mono">
                          {log.ip_address}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {logTotal > 20 && (
          <div className="flex justify-center items-center gap-3">
            <Button
              variant="outline"
              disabled={logPage <= 1}
              onClick={() => loadLogs(logPage - 1)}
              className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-40 transition-all"
            >
              上一页
            </Button>
            <span className="text-sm text-slate-400 font-medium px-2">
              第 <span className="text-white">{logPage}</span> 页，共 {Math.ceil(logTotal / 20)} 页
            </span>
            <Button
              variant="outline"
              disabled={logPage >= Math.ceil(logTotal / 20)}
              onClick={() => loadLogs(logPage + 1)}
              className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-40 transition-all"
            >
              下一页
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="dark min-h-screen bg-[#020617] text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-950/95 sticky top-0 z-50 backdrop-blur-xl">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-900/50 ring-2 ring-indigo-400/40">
                <Shield className="w-5 h-5 text-white" strokeWidth={2.25} />
              </div>
              <div>
                <h1 className="font-bold text-base text-white tracking-tight">管理后台</h1>
                <p className="text-xs text-slate-300 font-medium">欢迎，{adminInfo?.username}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => loadStats()}
                className="text-slate-200 hover:text-white hover:bg-slate-800 transition-all"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                刷新
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-slate-200 hover:text-red-300 hover:bg-red-500/15 transition-all"
              >
                <LogOut className="w-4 h-4 mr-2" />
                退出
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <nav className="w-full lg:w-56 shrink-0">
            <div className="space-y-1 lg:sticky lg:top-24">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                    activeTab === item.id
                      ? "bg-indigo-600 text-white border border-indigo-500 shadow-md shadow-indigo-900/40"
                      : "text-slate-200 hover:text-white hover:bg-slate-800 border border-slate-700/50"
                  }`}
                >
                  <item.icon className={`w-5 h-5 shrink-0 transition-colors ${
                    activeTab === item.id ? "text-white" : "text-slate-300 group-hover:text-white"
                  }`} />
                  {item.name}
                  {activeTab === item.id && (
                    <ChevronRight className="w-4 h-4 ml-auto text-white/90" />
                  )}
                </button>
              ))}
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {activeTab === "database" ? (
              <DatabaseManager
                token={token}
                fetchData={fetchData}
                postData={postData}
              />
            ) : loading ? (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="w-10 h-10 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin mb-4" />
                <span className="text-sm text-slate-500">加载中...</span>
              </div>
            ) : (
              <>
                {activeTab === "dashboard" && renderDashboard()}
                {activeTab === "admins" && renderAdmins()}
                {activeTab === "content" && renderContent()}
                {activeTab === "logs" && renderLogs()}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Admin Modal */}
      <Dialog open={showAdminModal} onOpenChange={setShowAdminModal}>
        <DialogContent className="border-slate-800 bg-slate-900 shadow-2xl shadow-black/60 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-white">
              {editingAdmin ? "编辑管理员" : "添加管理员"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">用户名</label>
              <Input
                value={adminForm.username}
                onChange={(e) =>
                  setAdminForm({ ...adminForm, username: e.target.value })
                }
                placeholder="输入用户名..."
                disabled={!!editingAdmin}
                className="bg-slate-800/50 border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-50"
              />
            </div>
            {!editingAdmin && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">密码</label>
                <Input
                  type="password"
                  value={adminForm.password}
                  onChange={(e) =>
                    setAdminForm({ ...adminForm, password: e.target.value })
                  }
                  placeholder="输入密码..."
                  className="bg-slate-800/50 border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">邮箱</label>
              <Input
                value={adminForm.email}
                onChange={(e) =>
                  setAdminForm({ ...adminForm, email: e.target.value })
                }
                placeholder="输入邮箱..."
                className="bg-slate-800/50 border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">角色</label>
              <Select
                value={adminForm.role}
                onChange={(e) =>
                  setAdminForm({ ...adminForm, role: e.target.value })
                }
                className="bg-slate-800 border-slate-600 text-white"
              >
                <option value="admin">管理员</option>
                <option value="superadmin">超级管理员</option>
              </Select>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowAdminModal(false)}
                className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
              >
                取消
              </Button>
              <Button
                onClick={editingAdmin ? handleUpdateAdmin : handleCreateAdmin}
                className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-lg shadow-indigo-500/20 transition-all duration-300"
              >
                {editingAdmin ? "更新" : "创建"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Content Modal */}
      <Dialog open={showContentModal} onOpenChange={setShowContentModal}>
        <DialogContent className="border-slate-800 bg-slate-900 shadow-2xl shadow-black/60 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-white">
              {editingContent ? "编辑内容" : "添加内容"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">内容键</label>
              <Input
                value={contentForm.content_key}
                onChange={(e) =>
                  setContentForm({ ...contentForm, content_key: e.target.value })
                }
                placeholder="例如：home_banner_title"
                disabled={!!editingContent}
                className="bg-slate-800/50 border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-50 font-mono"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">类型</label>
              <Select
                value={contentForm.content_type}
                onChange={(e) =>
                  setContentForm({ ...contentForm, content_type: e.target.value })
                }
                className="bg-slate-800 border-slate-600 text-white"
              >
                <option value="text">文本</option>
                <option value="html">HTML</option>
                <option value="json">JSON</option>
                <option value="image">图片URL</option>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">内容值</label>
              <Textarea
                value={contentForm.content_value}
                onChange={(e) =>
                  setContentForm({ ...contentForm, content_value: e.target.value })
                }
                placeholder="输入内容..."
                className={`bg-slate-800/50 border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono text-sm ${
                  contentForm.content_type === "html" || contentForm.content_type === "json"
                    ? "min-h-[200px]"
                    : "min-h-[100px]"
                }`}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">描述</label>
              <Input
                value={contentForm.description}
                onChange={(e) =>
                  setContentForm({ ...contentForm, description: e.target.value })
                }
                placeholder="内容描述..."
                className="bg-slate-800/50 border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
            <div className="flex items-center gap-3 py-1">
              <div className="relative">
                <input
                  type="checkbox"
                  id="is_published"
                  checked={contentForm.is_published}
                  onChange={(e) =>
                    setContentForm({ ...contentForm, is_published: e.target.checked })
                  }
                  className="peer sr-only"
                />
                <label
                  htmlFor="is_published"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <div className="w-5 h-5 rounded border border-slate-600 peer-checked:bg-indigo-500 peer-checked:border-indigo-500 flex items-center justify-center transition-all duration-200">
                    {contentForm.is_published && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm font-medium text-slate-300">发布</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowContentModal(false)}
                className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
              >
                取消
              </Button>
              <Button
                onClick={editingContent ? handleUpdateContent : handleCreateContent}
                className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-lg shadow-indigo-500/20 transition-all duration-300"
              >
                {editingContent ? "更新" : "创建"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}