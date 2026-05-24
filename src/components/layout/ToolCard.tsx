"use client"

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface ToolCardProps {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
}

export default function ToolCard({ id, name, description, icon: Icon, onClick }: ToolCardProps) {
  return (
    <Card 
      onClick={onClick}
      className="group relative overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-slate-200 bg-white"
    >
      <CardContent className="p-6 relative">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shadow-lg shadow-primary/20 transition-all">
            <Icon className="w-7 h-7 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
              {name}
            </h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          className="mt-4 text-primary opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all"
        >
          立即使用
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
}