"use client"

import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface ToolCardProps {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  color?: string;
  onClick: () => void;
}

export default function ToolCard({ id, name, description, icon: Icon, color = "bg-primary", onClick }: ToolCardProps) {
  return (
    <Card 
      onClick={onClick}
      className="group relative overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 bg-gradient-to-br from-white to-slate-50 shadow-lg hover:shadow-primary/20 h-full min-h-[16rem]"
    >
      <CardContent className="p-6 relative h-full flex flex-col justify-between">
        <div className="absolute top-0 right-0 w-24 h-24 opacity-5 group-hover:opacity-10 transition-opacity">
          <Sparkles className="w-full h-full" />
        </div>
        
        <div className={`w-16 h-16 rounded-2xl ${color} flex items-center justify-center shadow-lg shadow-black/10 transition-transform group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-black/20 mb-5`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
        
        <div className="relative z-10">
          <h3 className="font-bold text-xl mb-2 text-slate-950 group-hover:text-primary transition-colors">
            {name}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-5">
            {description}
          </p>
          
          <div className="flex items-center text-primary font-medium text-sm opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all">
            <span>立即使用</span>
            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
        
        <div className={`absolute bottom-0 left-0 right-0 h-1 ${color} transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left`} />
      </CardContent>
    </Card>
  );
}
