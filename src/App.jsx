import { useState, useEffect } from 'react';
import { Home, CalendarPlus, Users, Wallet, LogOut, AlertCircle } from 'lucide-react';
import ActivityScreen    from './screens/ActivityScreen';
import EventCreateScreen from './screens/EventCreateScreen';
import MemberScreen      from './screens/MemberScreen';
import AccountingScreen  from './screens/AccountingScreen';
import { apiFetch } from './utils';

const TABS = [
  { id: 'activity',   label: '活動',    Icon: Home         },
  { id: 'create',     label: '予定作成',  Icon: CalendarPlus  },
  { id: 'members',    label: '名簿',    Icon: Users         },
  { id: 'accounting', label: '会計',    Icon: Wallet        },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('accounting');
  const [activeEventId, setActiveEventId] = useState(null);
  const [globalError, setGlobalError] = useState(null);

  // グローバルエラーをキャッチするための関数（子コンポーネントに渡す）
  const handleError = (err) => {
    console.error(err);
    setGlobalError('サーバーと通信できません');
    setTimeout(() => setGlobalError(null), 5000); // 5秒後に消す
  };

  // イベントIDセットして会計または活動詳細に飛ばすヘルパー
  const navigateToEvent = (eventId, targetTab = 'accounting') => {
    setActiveEventId(eventId);
    setActiveTab(targetTab);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white relative">

      {/* ══ ヘッダー（固定・濃いブルー） ══ */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-blue-800 shadow-md">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="text-base font-bold text-white tracking-wide">サークル会計</h1>
          <div className="flex items-center gap-3">
            <button className="text-white/80 hover:text-white transition-colors" aria-label="メニュー">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* ══ グローバルエラー表示バナー ══ */}
      {globalError && (
        <div className="fixed top-14 left-0 right-0 z-50 flex justify-center">
          <div className="max-w-md w-full bg-red-600/90 text-white px-4 py-2 flex items-center gap-2 shadow-lg animate-in slide-in-from-top-2">
            <AlertCircle size={18} />
            <span className="text-sm font-bold">{globalError}</span>
          </div>
        </div>
      )}

      {/* ══ メインコンテンツ ══ */}
      <main className="max-w-md mx-auto px-4 pt-16 pb-24">
        {activeTab === 'activity' && (
          <ActivityScreen
            onError={handleError}
            onSelectEvent={(id) => navigateToEvent(id, 'activity')} // Activity内で詳細を出す
            activeEventId={activeEventId}
          />
        )}
        {activeTab === 'create' && (
          <EventCreateScreen 
            onError={handleError} 
            onEventCreated={(eventId) => navigateToEvent(eventId, 'accounting')} 
          />
        )}
        {activeTab === 'members' && (
          <MemberScreen onError={handleError} />
        )}
        {activeTab === 'accounting' && (
          <AccountingScreen
            onError={handleError}
            activeEventId={activeEventId}
          />
        )}
      </main>

      {/* ══ ボトムナビゲーション ══ */}
      <nav className="fixed bottom-0 left-0 right-0 z-50
                      bg-white border-t border-gray-200
                      shadow-[0_-1px_6px_rgba(0,0,0,0.08)]">
        <div className="max-w-md mx-auto flex justify-around">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const { Icon } = tab;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id === 'activity') setActiveEventId(null); // アクティビティタブ押下時は一覧に戻す
                  setActiveTab(tab.id);
                }}
                className={`flex-1 flex flex-col items-center pt-2.5 pb-3 gap-0.5 relative
                            transition-colors duration-150 ${
                  isActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-500 active:text-gray-600'
                }`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
                <span className={`text-[10px] leading-none font-medium ${
                  isActive ? 'font-semibold' : ''
                }`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
        <div className="h-safe-bottom" />
      </nav>

    </div>
  );
}
