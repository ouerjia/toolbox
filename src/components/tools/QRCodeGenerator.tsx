import { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Copy, Check, QrCode } from "lucide-react";

export default function QRCodeGenerator() {
  const [value, setValue] = useState("https://example.com");
  const [copied, setCopied] = useState(false);
  const [size, setSize] = useState(200);

  const handleDownload = () => {
    const canvas = document.querySelector("canvas");
    if (canvas) {
      const link = document.createElement("a");
      link.download = "qrcode.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="w-full max-w-md mx-auto border-0 shadow-xl shadow-slate-200/50 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <CardTitle className="text-2xl text-white">二维码生成器</CardTitle>
            <p className="text-blue-100 text-sm">快速生成二维码图片</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="space-y-3">
          <label className="text-sm font-semibold text-slate-700">输入文本或URL</label>
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="请输入要生成二维码的内容"
            className="h-12 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
          />
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-700">二维码尺寸</label>
            <span className="text-sm text-blue-600 font-medium">{size} x {size} px</span>
          </div>
          <input
            type="range"
            min="100"
            max="300"
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="w-full h-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full appearance-none cursor-pointer accent-blue-500"
          />
        </div>
        <div className="flex justify-center py-6">
          <div className="w-[320px] h-[320px] bg-white p-6 rounded-2xl border-2 border-dashed border-slate-200 shadow-inner flex items-center justify-center">
            <div className="relative" style={{ width: size, height: size }}>
              <QRCodeCanvas value={value} size={size} level="H" className="rounded-lg" />
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <Button onClick={handleDownload} className="flex-1 gradient-primary text-white">
            <Download className="w-5 h-5 mr-2" />
            下载图片
          </Button>
          <Button 
            variant="outline" 
            onClick={handleCopy} 
            className="flex-1 border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50"
          >
            {copied ? (
              <>
                <Check className="w-5 h-5 mr-2 text-green-500" />
                <span className="text-green-600">已复制</span>
              </>
            ) : (
              <>
                <Copy className="w-5 h-5 mr-2" />
                复制内容
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
