import { useState, useMemo } from 'react';
import { ChevronLeft, Calendar, MapPin, Receipt, TrendingUp, TrendingDown, Plus, Edit3, Users, ChevronDown, ChevronUp } from 'lucide-react';

const mockActivities = [
  { 
    id: 1, 
    title: '新入生歓迎コンパ', 
    date: '2023/04/15', 
    location: '居酒屋「和」', 
    participants: ['佐藤 健太', '鈴木 花子', '高橋 雄大', '田中 一郎', '伊藤 美咲', '渡辺 翔太', '中村 結衣'] 
  },
  { 
    id: 2, 
    title: '春のハイキング', 
    date: '2023/05/20', 
    location: '高尾山', 
    participants: ['佐藤 健太', '田中 一郎', '伊藤 美咲', '中村 結衣'] 
  },
];

export default function ActivityScreen() {
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [expandedActivityId, setExpandedActivityId] = useState(null);

  // 会計報告ステート（モックデータ、閲覧専用）
  const accounting = {
    incomes: [
      { id: 1, name: '当日回収', budget: 45000, actual: 45000, memo: '全員分回収済み' },
      { id: 2, name: '繰越金', budget: 5000, actual: 5000, memo: '' },
    ],
    expenses: [
      { id: 1, name: '会場費', budget: 40000, actual: 42000, memo: '追加オーダー分' },
      { id: 2, name: '雑費', budget: 5000, actual: 3000, memo: '名札代など' },
    ],
    note: '無事に終了。次回は会場費の予算を少し多めに見積もる。'
  };

  const totalIncome = useMemo(() => accounting.incomes.reduce((sum, item) => sum + (Number(item.actual) || 0), 0), [accounting.incomes]);
  const totalExpense = useMemo(() => accounting.expenses.reduce((sum, item) => sum + (Number(item.actual) || 0), 0), [accounting.expenses]);
  const balance = totalIncome - totalExpense;

  const toggleAccordion = (e, activityId) => {
    e.stopPropagation();
    setExpandedActivityId(prev => prev === activityId ? null : activityId);
  };

  if (selectedActivity) {
    return (
      <div className="space-y-4">
        {/* ヘッダー */}
        <div className="flex items-center mb-2">
          <button onClick={() => setSelectedActivity(null)} className="p-2 -ml-2 text-gray-600 flex items-center min-h-[44px]">
            <ChevronLeft size={24} />
            <span className="font-bold text-lg ml-1">戻る</span>
          </button>
        </div>

        {/* 企画内容（読み取り専用） */}
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-gray-200 text-gray-600 text-xs font-bold px-3 py-1 rounded-bl-lg">
            終了済み
          </div>
          <h2 className="text-xl font-bold text-gray-900 pr-16">{selectedActivity.title}</h2>
          <div className="flex flex-col gap-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-gray-400" />
              <span>{selectedActivity.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-gray-400" />
              <span>{selectedActivity.location}</span>
            </div>
          </div>
        </div>

        {/* 最終会計報告（読み取り専用） */}
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-4 border-t-4 border-gray-400">
          <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2 mb-2">
            <Receipt size={20} className="text-gray-500" />
            最終会計報告
          </h3>

          {/* 1. サマリー表示 */}
          <div className="grid grid-cols-3 gap-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
            <div className="text-center p-2">
              <p className="text-[10px] text-gray-500 mb-1 flex items-center justify-center gap-1">
                <TrendingUp size={12} className="text-green-500" />収入合計
              </p>
              <p className="font-bold text-sm text-green-600">¥{totalIncome.toLocaleString()}</p>
            </div>
            <div className="text-center p-2 border-l border-gray-200">
              <p className="text-[10px] text-gray-500 mb-1 flex items-center justify-center gap-1">
                <TrendingDown size={12} className="text-red-500" />支出合計
              </p>
              <p className="font-bold text-sm text-red-600">¥{totalExpense.toLocaleString()}</p>
            </div>
            <div className={`text-center p-2 border-l border-gray-200 ${balance >= 0 ? 'bg-blue-50/50 rounded-lg' : 'bg-red-50/50 rounded-lg'}`}>
              <p className="text-[10px] font-bold text-gray-600 mb-1">次への繰越</p>
              <p className={`font-bold text-sm ${balance >= 0 ? 'text-[#20387B]' : 'text-red-600'}`}>
                {balance >= 0 ? '+' : ''}¥{balance.toLocaleString()}
              </p>
            </div>
          </div>

          {/* 2. 収入明細リスト */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-green-700 flex items-center gap-1 border-b border-green-100 pb-1">
              <Plus size={14} /> 収入の部
            </h4>
            <div className="space-y-2">
              {accounting.incomes.map(item => (
                <div key={item.id} className="bg-gray-50 rounded-lg p-3 text-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-gray-800">{item.name}</span>
                    <span className="font-bold text-green-700">¥{Number(item.actual).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>予算: ¥{Number(item.budget).toLocaleString()}</span>
                    <span>差額: {(Number(item.actual) - Number(item.budget)) >= 0 ? '+' : ''}{(Number(item.actual) - Number(item.budget)).toLocaleString()}</span>
                  </div>
                  {item.memo && <p className="text-xs text-gray-600 mt-2 bg-white p-1.5 rounded">{item.memo}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* 3. 支出明細リスト */}
          <div className="space-y-2 mt-4">
            <h4 className="text-sm font-bold text-red-700 flex items-center gap-1 border-b border-red-100 pb-1">
              <Plus size={14} className="rotate-45" /> 支出の部
            </h4>
            <div className="space-y-2">
              {accounting.expenses.map(item => (
                <div key={item.id} className="bg-gray-50 rounded-lg p-3 text-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-gray-800">{item.name}</span>
                    <span className="font-bold text-red-600">¥{Number(item.actual).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>予算: ¥{Number(item.budget).toLocaleString()}</span>
                    <span>差額: {(Number(item.budget) - Number(item.actual)) >= 0 ? '+' : ''}{(Number(item.budget) - Number(item.actual)).toLocaleString()}</span>
                  </div>
                  {item.memo && <p className="text-xs text-gray-600 mt-2 bg-white p-1.5 rounded">{item.memo}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* 4. 備考欄 */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h4 className="text-sm font-bold text-gray-700 flex items-center gap-1 mb-2">
              <Edit3 size={16} className="text-gray-400" /> 全体備考
            </h4>
            <div className="w-full text-sm text-gray-700 bg-gray-50 rounded-lg p-3 min-h-[60px]">
              {accounting.note || '備考はありません。'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="font-bold text-gray-800 mb-2 px-1">過去の活動アーカイブ</h2>
      
      <div className="space-y-3">
        {mockActivities.map(activity => {
          const isExpanded = expandedActivityId === activity.id;
          const participantCount = activity.participants ? activity.participants.length : 0;
          
          return (
            <div 
              key={activity.id}
              onClick={() => setSelectedActivity(activity)}
              className="bg-white rounded-xl shadow-sm p-4 active:bg-gray-50 transition-colors opacity-90 cursor-pointer border border-transparent hover:border-gray-200"
            >
              <h3 className="font-bold text-gray-900 text-lg mb-2">{activity.title}</h3>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span className="flex items-center gap-1"><Calendar size={14} />{activity.date}</span>
                <span className="flex items-center gap-1"><Receipt size={14} />会計報告あり</span>
              </div>

              {/* 参加状況の可視化 */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <button 
                  onClick={(e) => toggleAccordion(e, activity.id)}
                  className="flex items-center justify-between w-full p-1 -m-1 rounded hover:bg-gray-50 text-sm font-bold text-gray-700 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Users size={16} className="text-gray-500" />
                    参加者 {participantCount} 名
                  </span>
                  {isExpanded ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                </button>
                
                {/* アコーディオン展開時 */}
                {isExpanded && (
                  <div className="mt-2 pl-6 space-y-1" onClick={(e) => e.stopPropagation()}>
                    {activity.participants && activity.participants.length > 0 ? (
                      activity.participants.map((p, idx) => (
                        <div key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                          {p}
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-gray-400">参加記録がありません</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
