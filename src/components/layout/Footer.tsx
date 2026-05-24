export default function Footer() {
  return (
    <footer className="border-t mt-16 bg-slate-950 text-slate-100">
      <div className="container mx-auto px-4 py-14">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <h3 className="font-semibold text-lg mb-4 text-white">工具箱</h3>
            <p className="text-sm text-slate-300 leading-7">
              提供多种在线工具，帮助您高效完成日常任务。所有工具完全免费，无需注册。
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-4 text-white">快速链接</h3>
            <ul className="space-y-3 text-sm text-slate-300">
              <li><a href="#" className="hover:text-white transition">使用条款</a></li>
              <li><a href="#" className="hover:text-white transition">隐私政策</a></li>
              <li><a href="#" className="hover:text-white transition">联系我们</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-4 text-white">支持的工具</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>二维码生成</li>
              <li>密码生成</li>
              <li>文本工具</li>
              <li>PDF转换</li>
              <li>图片处理</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 mt-10 pt-8 text-center text-sm text-slate-400">
          © 2024 工具箱 - 在线多功能工具站 | 所有工具本地处理，保护您的隐私
        </div>
      </div>
    </footer>
  );
}