"use client"

import { Button } from "@/components/ui/button";
import { Sparkles, Zap, Shield, Globe } from "lucide-react";

interface HeroProps {
  onGetStarted: () => void;
}

export default function Hero({ onGetStarted }: HeroProps) {
  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            5种实用工具，一站式解决
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-slate-950">
              在线多功能工具箱
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            提供二维码生成、密码生成、文本工具、PDF转换、图片处理等多种实用工具。
            无需安装，即开即用，完全免费。
          </p>
          
          <Button 
            size="lg" 
            onClick={onGetStarted}
            className="text-lg px-8 py-6 shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all"
          >
            <Zap className="w-5 h-5 mr-2" />
            立即开始使用
          </Button>
          
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-background/50 backdrop-blur-sm">
              <Shield className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">本地处理</span>
            </div>
            <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-background/50 backdrop-blur-sm">
              <Zap className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">快速响应</span>
            </div>
            <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-background/50 backdrop-blur-sm">
              <Globe className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">跨平台</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}