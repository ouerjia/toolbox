import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Upload, X } from "lucide-react";

export default function PDFConverter() {
  const [files, setFiles] = useState<File[]>([]);
  const [converting, setConverting] = useState(false);
  const [convertedFiles, setConvertedFiles] = useState<{ name: string; size: number }[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []).filter((file) =>
      file.type.startsWith("application/pdf")
    );
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleConvert = async () => {
    if (files.length === 0) return;
    
    setConverting(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const results = files.map((file) => ({
      name: file.name.replace(".pdf", "_converted.pdf"),
      size: file.size,
    }));
    setConvertedFiles(results);
    setConverting(false);
  };

  const handleDownload = (fileName: string) => {
    const blob = new Blob(["PDF转换内容"], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setFiles([]);
    setConvertedFiles([]);
  };

  return (
    <Card className="w-full max-w-lg mx-auto border-0 shadow-xl shadow-slate-200/50 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-red-500 to-rose-500 text-white pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <CardTitle className="text-2xl text-white">PDF转换工具</CardTitle>
            <p className="text-red-100 text-sm">PDF文件处理转换</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-red-400 hover:bg-red-50/50 transition-all cursor-pointer">
          <input
            type="file"
            accept="application/pdf"
            multiple
            onChange={handleFileChange}
            className="hidden"
            id="pdf-upload"
          />
          <label htmlFor="pdf-upload" className="cursor-pointer">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-red-100 to-rose-100 flex items-center justify-center">
              <FileText className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-sm font-semibold text-slate-700">点击或拖拽上传PDF文件</p>
            <p className="text-xs text-slate-400 mt-2">支持多文件上传</p>
          </label>
        </div>

        {files.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-700">已选择 {files.length} 个文件</p>
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 bg-gradient-to-r from-slate-50 to-red-50/30 rounded-xl border border-slate-100"
              >
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{file.name}</p>
                  <p className="text-xs text-slate-400">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveFile(index)}
                  className="w-8 h-8 rounded-lg hover:bg-red-100 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {convertedFiles.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-green-600 flex items-center gap-2">
              <Download className="w-4 h-4" />
              转换完成
            </p>
            {convertedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50/30 rounded-xl border border-green-200"
              >
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Download className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{file.name}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(file.name)}
                  className="border-green-300 text-green-600 hover:bg-green-100"
                >
                  下载
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3">
          <Button
            onClick={handleConvert}
            disabled={files.length === 0 || converting}
            className="flex-1 gradient-primary text-white"
          >
            <Upload className="w-5 h-5 mr-2" />
            {converting ? "转换中..." : "开始转换"}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleClear}
            className="border-2 border-slate-200"
          >
            清空
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}