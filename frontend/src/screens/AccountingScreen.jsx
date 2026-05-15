import { useState } from 'react';
import { Upload, ReceiptText, ArrowUpRight, ArrowDownRight, Camera } from 'lucide-react';

const mockTransactions = [
  { id: 1, date: '10/05', title: 'コピー用紙代', amount: -1500, type: 'expense', category: '備品', payer: '佐藤 花子' },
  { id: 2, date: '10/01', title: '10月分部費徴収 (20名)', amount: 40000, type: 'income', category: '部費', payer: '-' },
  { id: 3, date: '09/28', title: '新歓ビラ印刷代', amount: -3200, type: 'expense', category: '印刷', payer: '伊藤 美咲' },
  { id: 4, date: '09/15', title: 'ボールペン等文具', amount: -850, type: 'expense', category: '備品', payer: '田中 一郎' },
];

export default function AccountingScreen() {
  const [showUploadForm, setShowUploadForm] = useState(false);

  return (
    <div className="space-y-4">
      {/* 収支サマリー */}
      <div className="bg-white rounded-xl shadow-sm p-4 border-t-4 border-[#20387B]">
        <h2 className="text-sm font-bold text-gray-500 mb-3 text-center">今月の全体収支（企画外）</h2>
        <div className="flex justify-between items-center px-4">
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1 flex items-center justify-center gap-1">
              <ArrowDownRight size={14} className="text-red-500" />
              支出
            </p>
            <p className="font-bold text-lg text-red-600">¥5,550</p>
          </div>
          <div className="w-px h-10 bg-gray-200"></div>
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1 flex items-center justify-center gap-1">
              <ArrowUpRight size={14} className="text-[#20387B]" />
              収入
            </p>
            <p className="font-bold text-lg text-[#20387B]">¥40,000</p>
          </div>
        </div>
      </div>

      {/* 領収書アップロードエリア */}
      {showUploadForm ? (
        <div className="bg-white rounded-xl shadow-md p-4 space-y-4 border border-blue-400">
          <h3 className="font-bold text-gray-800 border-b pb-2">領収書の登録</h3>
          
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-400">
                <Camera size={32} className="mb-2" />
                <p className="text-sm font-bold">カメラで撮影 / 画像選択</p>
              </div>
              <input type="file" className="hidden" accept="image/*" />
            </label>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">金額 (¥)</label>
              <input type="number" placeholder="例: 1500" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#20387B] outline-none min-h-[44px]"/>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">立替者</label>
              <input type="text" placeholder="例: 佐藤 花子" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#20387B] outline-none min-h-[44px]"/>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">用途 (内容)</label>
              <input type="text" placeholder="例: コピー用紙代" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#20387B] outline-none min-h-[44px]"/>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button onClick={() => setShowUploadForm(false)} className="flex-1 bg-gray-100 text-gray-600 font-bold py-3 rounded-xl min-h-[48px]">
              キャンセル
            </button>
            <button onClick={() => setShowUploadForm(false)} className="flex-1 bg-[#20387B] text-white font-bold py-3 rounded-xl min-h-[48px]">
              登録する
            </button>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setShowUploadForm(true)}
          className="w-full bg-blue-400 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-sm active:bg-blue-500 transition-colors min-h-[48px]"
        >
          <Upload size={20} />
          領収書をアップロード
        </button>
      )}

      {/* 支出履歴リスト */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4 border-b pb-2">
          <ReceiptText size={18} className="text-[#20387B]" />
          一般収支履歴
        </h3>
        
        <div className="space-y-0 divide-y divide-gray-100">
          {mockTransactions.map(tx => (
            <div key={tx.id} className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  tx.type === 'income' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {tx.type === 'income' ? <ArrowUpRight size={18}/> : <ArrowDownRight size={18}/>}
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-900">{tx.title}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                    <span>{tx.date}</span>
                    <span className="bg-gray-100 px-1.5 rounded">{tx.category}</span>
                    {tx.type === 'expense' && <span className="text-gray-400">立替: {tx.payer}</span>}
                  </div>
                </div>
              </div>
              <div className={`font-bold ${tx.type === 'income' ? 'text-[#20387B]' : 'text-gray-900'}`}>
                {tx.type === 'income' ? '+' : ''}{tx.amount.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
