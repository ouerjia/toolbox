import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Image as ImageIcon, Download, Upload, ZoomIn, ZoomOut } from "lucide-react";

export default function ImageProcessor() {
  const [image, setImage] = useState<string | null>(null);
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [format, setFormat] = useState("png");
  const [quality, setQuality] = useState(90);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResize = () => {
    if (!image || !canvasRef.current) return;

    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current!;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
      }
    };
    img.src = image;
  };

  const handleDownload = () => {
    if (!canvasRef.current) {
      handleResize();
      setTimeout(() => downloadCanvas(), 500);
    } else {
      downloadCanvas();
    }
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const mimeType = `image/${format}`;
    const qualityValue = format === "jpeg" ? quality / 100 : undefined;
    const dataUrl = canvas.toDataURL(mimeType, qualityValue);
    
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `processed_image.${format}`;
    link.click();
  };

  const handleClear = () => {
    setImage(null);
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl">图片处理工具</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="image-upload"
          />
          <label htmlFor="image-upload" className="cursor-pointer">
            <ImageIcon className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm font-medium">点击或拖拽上传图片</p>
            <p className="text-xs text-muted-foreground mt-1">支持 JPG, PNG, GIF 等格式</p>
          </label>
        </div>

        {image && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">原始图片</p>
              <div className="border rounded-lg p-2 bg-secondary">
                <img
                  src={image}
                  alt="Original"
                  className="max-w-full h-auto rounded"
                  style={{ maxHeight: "200px", objectFit: "contain" }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">处理后图片</p>
              <div className="border rounded-lg p-2 bg-secondary">
                <canvas
                  ref={canvasRef}
                  className="max-w-full h-auto rounded"
                  style={{ maxHeight: "200px", objectFit: "contain" }}
                />
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">宽度 (px)</label>
            <Input
              type="number"
              value={width}
              onChange={(e) => setWidth(Math.max(10, Math.min(4000, Number(e.target.value))))}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">高度 (px)</label>
            <Input
              type="number"
              value={height}
              onChange={(e) => setHeight(Math.max(10, Math.min(4000, Number(e.target.value))))}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">输出格式</label>
            <Select value={format} onChange={(e) => setFormat(e.target.value)}>
              <option value="png">PNG</option>
              <option value="jpeg">JPEG</option>
              <option value="webp">WebP</option>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              质量: {quality}%
            </label>
            <input
              type="range"
              min="10"
              max="100"
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={handleResize} disabled={!image}>
            <ZoomIn className="w-4 h-4 mr-2" />
            调整尺寸
          </Button>
          <Button onClick={handleDownload} disabled={!image}>
            <Download className="w-4 h-4 mr-2" />
            下载图片
          </Button>
          <Button variant="outline" onClick={handleClear}>
            <Upload className="w-4 h-4 mr-2" />
            重新上传
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
