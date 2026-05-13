import { AlertCircle, ChevronRight, FileText } from 'lucide-react';

export default function HomeScreen({ onNavigate }) {
  return (
    <div className="space-y-4">
      {/* 要対応タスク（赤色アクセント） */}
      <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-red-500">
        <div className="flex items-center gap-2 text-red-600 font-bold mb-2">
          <AlertCircle size={20} />
          <h2>要対応タスク</h2>
        </div>
        <ul className="text-sm text-gray-700 space-y-2">
          <li className="flex items-start gap-2">
            <span className="mt-1 block w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
            <span>夏合宿の未集金が3名います（〆切超過）</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 block w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
            <span>新歓コンパの備品代・領収書未提出（田中）</span>
          </li>
        </ul>
      </div>

      {/* 全体残高 */}
      <div className="bg-white rounded-xl shadow-sm p-5 text-center">
        <h2 className="text-sm text-gray-500 mb-1">現在の資産合計</h2>
        <p className="text-3xl font-bold text-gray-900 tracking-tight">¥145,000</p>
        <p className="text-xs text-gray-400 mt-2">最終更新: 本日 14:30</p>
      </div>

      {/* 直近活動 */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h2 className="text-sm font-bold text-gray-700 mb-3 border-b pb-2">直近の活動予定</h2>
        <button 
          onClick={() => onNavigate('plan')}
          className="w-full text-left bg-blue-50 rounded-lg p-3 flex justify-between items-center active:bg-blue-100 transition-colors"
        >
          <div>
            <p className="text-xs text-blue-600 font-bold mb-1">10/12 (土) 進行中</p>
            <p className="font-bold text-gray-900 text-base">木曽駒ヶ岳登山</p>
          </div>
          <ChevronRight size={20} className="text-gray-400" />
        </button>
      </div>

      {/* 幹部共有メモ */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex items-center gap-2 text-gray-700 font-bold mb-2">
          <FileText size={18} />
          <h2>幹部共有メモ</h2>
        </div>
        <textarea 
          className="w-full text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg p-3 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="次回ミーティングのアジェンダ等をメモできます..."
          defaultValue="・次回の新歓費用について協議\n・ホームページ更新担当の決定\n・OBOG会のお知らせ作成"
        />
      </div>
    </div>
  );
}
