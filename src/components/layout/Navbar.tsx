"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Wrench } from "lucide-react";

interface NavbarProps {
  tools: { id: string; name: string }[];
  activeTool: string | null;
  onToolChange: (toolId: string | null) => void;
}

export default function Navbar({ tools, activeTool, onToolChange }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-background/95 backdrop-blur-md shadow-sm shadow-slate-200/50 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <button
            onClick={() => onToolChange(null)}
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/25 group-hover:shadow-xl transition-all">
              <Wrench className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl text-slate-950 hidden sm:block">
              工具箱
            </span>
          </button>

          <nav className="hidden md:flex items-center gap-1">
            {tools.map((tool) => (
              <Button
                key={tool.id}
                variant={activeTool === tool.id ? "default" : "ghost"}
                onClick={() => onToolChange(tool.id)}
                className="relative overflow-hidden"
              >
                {tool.name}
                {activeTool === tool.id && (
                  <span className="absolute inset-0 bg-primary/10 animate-pulse" />
                )}
              </Button>
            ))}
          </nav>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden border-t animate-in slide-in-from-top-2">
            <div className="py-2 space-y-1">
              {tools.map((tool) => (
                <Button
                  key={tool.id}
                  variant={activeTool === tool.id ? "default" : "ghost"}
                  onClick={() => {
                    onToolChange(tool.id);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full justify-start"
                >
                  {tool.name}
                </Button>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}