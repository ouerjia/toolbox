"use client"

import { Button } from "@/components/ui/button";
import { Sparkles, Zap, Shield, Globe, ArrowDown } from "lucide-react";

interface HeroProps {
  onGetStarted: () => void;
}

export default function Hero({ onGetStarted }: HeroProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center py-20 md:py-0 overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -right-1/4 w-[700px] h-[700px] bg-gradient-to-br from-cyan-400/20 to-green-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-0 left-1/2 w-[500px] h-[500px] bg-gradient-to-br from-orange-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        
        <div className="absolute top-20 left-10 w-2 h-2 bg-primary/30 rounded-full animate-bounce" />
        <div className="absolute top-40 right-10 w-1.5 h-1.5 bg-cyan-400/40 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-40 left-1/4 w-2 h-2 bg-purple-400/30 rounded-full animate-bounce" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-green-400/40 rounded-full animate-bounce" style={{ animationDelay: '1.5s' }} />
      </div>
      
      <div className="relative z-10 px-4 md:px-8 w-full">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/80 backdrop-blur-md shadow-sm border border-slate-100 text-primary text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            5种实用工具，一站式解决
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
              在线多功能工具箱
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            提供二维码生成、密码生成、文本工具、PDF转换、图片处理等多种实用工具。
            无需安装，即开即用，完全免费。
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button 
              size="lg" 
              onClick={onGetStarted}
              className="text-lg px-10 py-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5"
            >
              <Zap className="w-5 h-5 mr-2" />
              立即开始使用
              <ArrowDown className="w-4 h-4 ml-1 animate-bounce" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="group flex items-center justify-center gap-3 p-5 rounded-2xl bg-white/70 backdrop-blur-md shadow-sm border border-slate-100 hover:shadow-lg hover:border-primary/20 transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-slate-900">本地处理</p>
                <p className="text-xs text-slate-500">隐私安全</p>
              </div>
            </div>
            <div className="group flex items-center justify-center gap-3 p-5 rounded-2xl bg-white/70 backdrop-blur-md shadow-sm border border-slate-100 hover:shadow-lg hover:border-primary/20 transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-slate-900">快速响应</p>
                <p className="text-xs text-slate-500">即时处理</p>
              </div>
            </div>
            <div className="group flex items-center justify-center gap-3 p-5 rounded-2xl bg-white/70 backdrop-blur-md shadow-sm border border-slate-100 hover:shadow-lg hover:border-primary/20 transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-slate-900">跨平台</p>
                <p className="text-xs text-slate-500">随时随地</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}