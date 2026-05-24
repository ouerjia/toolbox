import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Check, Trash2, Type, Hash, AlignLeft, AlignRight, SortAsc } from "lucide-react";

export default function TextTools() {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const tools = [
    { id: "uppercase", name: "转大写", icon: Type },
    { id: "lowercase", name: "转小写", icon: Type },
    { id: "trim", name: "去除空格", icon: AlignLeft },
    { id: "reverse", name: "反转文本", icon: AlignRight },
    { id: "count", name: "统计字数", icon: Hash },
    { id: "sort", name: "排序", icon: SortAsc },
  ];

  const handleToolClick = (toolId: string) => {
    setActiveTool(toolId);
    let result = text;
    switch (toolId) {
      case "uppercase":
        result = text.toUpperCase();
        break;
      case "lowercase":
        result = text.toLowerCase();
        break;
      case "trim":
        result = text.trim();
        break;
      case "reverse":
        result = text.split("").reverse().join("");
        break;
      case "sort":
        result = text.split("").sort().join("");
        break;
      case "count":
        const chars = text.length;
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        const lines = text.split("\n").length;
        alert(`字符数: ${chars}\n单词数: ${words}\n行数: ${lines}`);
        return;
    }
    setText(result);
    setTimeout(() => setActiveTool(null), 500);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setText("");
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border-0 shadow-xl shadow-slate-200/50 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <Type className="w-6 h-6" />
          </div>
          <div>
            <CardTitle className="text-2xl text-white">文本工具</CardTitle>
            <p className="text-orange-100 text-sm">文本格式化处理</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {tools.map((tool) => (
            <Button
              key={tool.id}
              variant={activeTool === tool.id ? "default" : "outline"}
              onClick={() => handleToolClick(tool.id)}
              className={`${
                activeTool === tool.id
                  ? "gradient-primary text-white"
                  : "border-2 border-slate-200 hover:border-orange-400 hover:bg-orange-50"
              }`}
            >
              <tool.icon className="w-4 h-4 mr-2" />
              {tool.name}
            </Button>
          ))}
        </div>
        <div className="relative">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="请输入文本..."
            className="min-h-[250px] rounded-xl border-2 border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all resize-none"
          />
          <div className="absolute bottom-4 right-4 text-xs text-slate-400 font-mono">
            {text.length} 字符
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">
            字符数: <span className="font-semibold text-orange-600">{text.length}</span> | 
            单词数: <span className="font-semibold text-orange-600">{text.trim() ? text.trim().split(/\s+/).length : 0}</span>
          </span>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={handleClear}
              className="border-2 border-slate-200 hover:border-red-400 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              清空
            </Button>
            <Button className="gradient-primary text-white">
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2 text-green-300" />
                  已复制
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  复制
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}