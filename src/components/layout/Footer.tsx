export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-100 border-t border-slate-800">
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <h3 className="font-semibold text-base mb-2 text-white">工具箱</h3>
            <p className="text-xs text-slate-300 leading-5">
              提供多种在线工具，帮助您高效完成日常任务。
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-base mb-2 text-white">快速链接</h3>
            <ul className="space-y-1.5 text-xs text-slate-300">
              <li><a href="#" className="hover:text-white transition-colors">使用条款</a></li>
              <li><a href="#" className="hover:text-white transition-colors">隐私政策</a></li>
              <li><a href="#" className="hover:text-white transition-colors">联系我们</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-base mb-2 text-white">支持的工具</h3>
            <ul className="space-y-1 text-xs text-slate-300">
              <li>二维码生成</li>
              <li>密码生成</li>
              <li>文本工具</li>
              <li>PDF转换</li>
              <li>图片处理</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 mt-4 pt-3 text-center text-xs text-slate-400">
          © 2024 工具箱 - 在线多功能工具站 | 所有工具本地处理，保护您的隐私
        </div>
      </div>
    </footer>
  );
}