"use client"

import { useEffect, useRef, useState } from "react";
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
  Sparkles,
  Zap,
} from "lucide-react";

const tools = [
  { id: "qrcode", name: "二维码生成", icon: QrCode, description: "快速生成二维码图片，支持自定义尺寸", color: "bg-blue-500" },
  { id: "password", name: "密码生成", icon: Shield, description: "生成安全随机密码，支持多种字符类型", color: "bg-green-500" },
  { id: "text", name: "文本工具", icon: Type, description: "文本格式化、大小写转换、字符统计", color: "bg-purple-500" },
  { id: "pdf", name: "PDF转换", icon: FileText, description: "PDF文件处理转换工具", color: "bg-red-500" },
  { id: "image", name: "图片处理", icon: ImageIcon, description: "图片尺寸调整、格式转换、质量调整", color: "bg-orange-500" },
];

export default function Home() {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const toolTopRef = useRef<HTMLDivElement>(null);

  const handleGetStarted = () => {
    const toolsSection = document.getElementById("tools-section");
    if (toolsSection) {
      toolsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleToolChange = (toolId: string | null) => {
    setActiveTool(toolId);
  };

  useEffect(() => {
    if (activeTool && toolTopRef.current) {
      toolTopRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [activeTool]);

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
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar
        tools={tools}
        activeTool={activeTool}
        onToolChange={handleToolChange}
      />

      <main className="flex-1 w-full">
        {activeTool ? (
          <div ref={toolTopRef} className="min-h-screen py-8 px-4 scroll-mt-16">
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
          </div>
        ) : (
          <>
            <Hero onGetStarted={handleGetStarted} />

            <section id="tools-section" className="py-20 bg-white px-4 md:px-8">
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                  <span className="inline-block px-5 py-2 rounded-full bg-gradient-to-r from-primary/10 to-primary/5 text-primary text-sm font-semibold mb-6">
                    实用工具
                  </span>
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                    <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                      全部工具
                    </span>
                  </h2>
                  <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                    精选多种实用工具，满足您的日常需求
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                  {tools.map((tool, index) => (
                    <div
                      key={tool.id}
                      className="animate-fade-in-up transform transition-all duration-300 hover:-translate-y-2"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <ToolCard
                        id={tool.id}
                        name={tool.name}
                        description={tool.description}
                        icon={tool.icon}
                        color={tool.color}
                        onClick={() => handleToolChange(tool.id)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="py-20 bg-gradient-to-r from-slate-50 to-blue-50/30 px-4 md:px-8">
              <div className="max-w-6xl mx-auto">
                <div className="relative overflow-hidden rounded-3xl bg-white/80 backdrop-blur-md shadow-xl border border-slate-100 p-8 md:p-12">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-cyan-100/50 to-transparent rounded-tr-full" />

                  <div className="relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 text-primary text-sm font-medium mb-6">
                      <Sparkles className="w-4 h-4" />
                      合作伙伴
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
                      【广告位预留】
                    </h3>
                    <p className="text-slate-600">
                      此处可放置合规广告内容或合作伙伴信息
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="py-20 bg-white px-4 md:px-8">
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                  <span className="inline-block px-5 py-2 rounded-full bg-gradient-to-r from-cyan-500/10 to-green-500/10 text-cyan-600 text-sm font-semibold mb-6">
                    我们的优势
                  </span>
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                    <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                      为什么选择我们
                    </span>
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="group relative p-8 rounded-3xl bg-gradient-to-br from-slate-50 to-white border border-slate-100 hover:border-primary/20 hover:shadow-2xl transition-all duration-500">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-500/5 to-transparent rounded-bl-full" />
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25 mb-6 group-hover:scale-110 transition-transform">
                      <Shield className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">安全可靠</h3>
                    <p className="text-slate-600 leading-relaxed">
                      所有数据本地处理，不上传服务器，保护您的隐私安全。
                    </p>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-b-3xl" />
                  </div>

                  <div className="group relative p-8 rounded-3xl bg-gradient-to-br from-slate-50 to-white border border-slate-100 hover:border-primary/20 hover:shadow-2xl transition-all duration-500">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-green-500/5 to-transparent rounded-bl-full" />
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/25 mb-6 group-hover:scale-110 transition-transform">
                      <Zap className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">操作便捷</h3>
                    <p className="text-slate-600 leading-relaxed">
                      简洁直观的界面设计，无需学习成本，即刻上手使用。
                    </p>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-green-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-b-3xl" />
                  </div>

                  <div className="group relative p-8 rounded-3xl bg-gradient-to-br from-slate-50 to-white border border-slate-100 hover:border-primary/20 hover:shadow-2xl transition-all duration-500">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-purple-500/5 to-transparent rounded-bl-full" />
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/25 mb-6 group-hover:scale-110 transition-transform">
                      <FileText className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">完全免费</h3>
                    <p className="text-slate-600 leading-relaxed">
                      所有工具永久免费使用，无任何隐藏收费项目。
                    </p>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-b-3xl" />
                  </div>
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
