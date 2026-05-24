import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check, RefreshCw, Shield } from "lucide-react";

export default function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });

  const generatePassword = useCallback(() => {
    let charset = "";
    if (options.uppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (options.lowercase) charset += "abcdefghijklmnopqrstuvwxyz";
    if (options.numbers) charset += "0123456789";
    if (options.symbols) charset += "!@#$%^&*()_+-=[]{}|;:,.<>?";

    if (!charset) {
      alert("请至少选择一种字符类型");
      return;
    }

    let result = "";
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      result += charset[array[i] % charset.length];
    }
    setPassword(result);
  }, [length, options]);

  const handleCopy = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleOption = (key: keyof typeof options) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Card className="w-full max-w-md mx-auto border-0 shadow-xl shadow-slate-200/50 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <CardTitle className="text-2xl text-white">密码生成器</CardTitle>
            <p className="text-emerald-100 text-sm">生成安全随机密码</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="space-y-3">
          <label className="text-sm font-semibold text-slate-700">密码长度</label>
          <div className="flex items-center gap-4">
            <Input
              type="number"
              value={length}
              onChange={(e) => setLength(Math.max(1, Math.min(128, Number(e.target.value))))}
              min="1"
              max="128"
              className="flex-1 h-12 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
            />
            <span className="text-sm text-slate-500 font-mono">{length} 字符</span>
          </div>
          <input
            type="range"
            min="1"
            max="128"
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-full h-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full appearance-none cursor-pointer accent-emerald-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(options).map(([key, value]) => (
            <button
              key={key}
              onClick={() => toggleOption(key as keyof typeof options)}
              className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                value
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/30"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {key === "uppercase" && "大写字母"}
              {key === "lowercase" && "小写字母"}
              {key === "numbers" && "数字"}
              {key === "symbols" && "特殊字符"}
            </button>
          ))}
        </div>
        {password && (
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Shield className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="flex-1 font-mono text-sm text-slate-700 break-all">{password}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              className="h-10 w-10 rounded-xl hover:bg-emerald-200"
            >
              {copied ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : (
                <Copy className="w-5 h-5 text-slate-600" />
              )}
            </Button>
          </div>
        )}
        <Button 
          onClick={generatePassword} 
          className="w-full gradient-primary text-white h-12 text-base font-semibold"
        >
          <RefreshCw className="w-5 h-5 mr-2" />
          生成密码
        </Button>
      </CardContent>
    </Card>
  );
}