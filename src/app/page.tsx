"use client"

import { useState } from "react";
import QRCodeGenerator from "@/components/tools/QRCodeGenerator";
import PasswordGenerator from "@/components/tools/PasswordGenerator";
import TextTools from "@/components/tools/TextTools";
import PDFConverter from "@/components/tools/PDFConverter";
import ImageProcessor from "@/components/tools/ImageProcessor";
import Navbar from "@/components/layout/Navbar";
import ToolCard from "@/components/layout/ToolCard";
import Hero from "@/components/layout/Hero";
import Footer from "@/components/layout/Footer";
import {
  FileText,
  Image as ImageIcon,
  QrCode,
  Type,
  Shield,
} from "lucide-react";

const tools = [
  { id: "qrcode", name: "二维码生成", icon: QrCode, description: "快速生成二维码图片，支持自定义尺寸" },
  { id: "password", name: "密码生成", icon: Shield, description: "生成安全随机密码，支持多种字符类型" },
  { id: "text", name: "文本工具", icon: Type, description: "文本格式化、大小写转换、字符统计" },
  { id: "pdf", name: "PDF转换", icon: FileText, description: "PDF文件处理转换工具" },
  { id: "image", name: "图片处理", icon: ImageIcon, description: "图片尺寸调整、格式转换、质量调整" },
];

export default function Home() {
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const renderTool = () => {
    switch (activeTool) {
      case "qrcode":
        return <QRCodeGenerator />;
      case "password":
        return <PasswordGenerator />;
      case "text":
        return <TextTools />;
      case "pdf":
        return <PDFConverter />;
      case "image":
        return <ImageProcessor />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar 
        tools={tools} 
        activeTool={activeTool} 
        onToolChange={setActiveTool} 
      />

      <main className="container mx-auto px-4 py-8">
        {activeTool ? (
          <div className="max-w-3xl mx-auto">
            <button 
              onClick={() => setActiveTool(null)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
              <span className="text-lg">←</span>
              <span>返回首页</span>
            </button>
            {renderTool()}
          </div>
        ) : (
          <>
            <Hero onGetStarted={() => setActiveTool("qrcode")} />
            
            <section className="py-12">
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
                全部工具
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {tools.map((tool) => (
                  <ToolCard
                    key={tool.id}
                    id={tool.id}
                    name={tool.name}
                    description={tool.description}
                    icon={tool.icon}
                    onClick={() => setActiveTool(tool.id)}
                  />
                ))}
              </div>
            </section>

            <section className="py-12">
              <div className="border border-dashed rounded-2xl p-8 text-center bg-muted/30">
                <p className="text-muted-foreground">【广告位预留】此处可放置合规广告内容</p>
              </div>
            </section>

            <section className="py-12">
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
                为什么选择我们
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 rounded-2xl bg-primary/5">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">安全可靠</h3>
                  <p className="text-sm text-muted-foreground">
                    所有数据本地处理，不上传服务器，保护您的隐私安全。
                  </p>
                </div>
                <div className="text-center p-6 rounded-2xl bg-accent/10">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
                    <Type className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">操作便捷</h3>
                  <p className="text-sm text-muted-foreground">
                    简洁直观的界面设计，无需学习成本，即刻上手使用。
                  </p>
                </div>
                <div className="text-center p-6 rounded-2xl bg-primary/5">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">完全免费</h3>
                  <p className="text-sm text-muted-foreground">
                    所有工具永久免费使用，无任何隐藏收费项目。
                  </p>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}