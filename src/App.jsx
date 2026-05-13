import { useState, useEffect } from 'react';
import { Home, Calendar, History, Users, Wallet, LogOut, Loader2 } from 'lucide-react';
import HomeScreen from './screens/HomeScreen';
import PlanScreen from './screens/PlanScreen';
import ActivityScreen from './screens/ActivityScreen';
import MemberScreen from './screens/MemberScreen';
import AccountingScreen from './screens/AccountingScreen';

const TABS = [
  { id: 'home',       label: 'ホーム',  Icon: Home     },
  { id: 'plan',       label: '企画',    Icon: Calendar },
  { id: 'activity',   label: '活動',    Icon: History  },
  { id: 'members',    label: '名簿',    Icon: Users    },
  { id: 'accounting', label: '会計',    Icon: Wallet   },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isInitializing, setIsInitializing] = useState(true);

  // アプリ起動時のデータ同期（初期化）を模倣・ハンドリング
  useEffect(() => {
    const initializeApp = async () => {
      // Supabaseなどの初期フェッチを想定したローディング時間
      // 実際の取得ロジックは各画面やコンテキスト内で実行
      await new Promise(resolve => setTimeout(resolve, 800));
      setIsInitializing(false);
    };
    initializeApp();
  }, []);

  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F9FAFB]">
        <Loader2 size={40} className="text-blue-400 animate-spin mb-4" />
        <p className="text-[#20387B] font-bold text-sm animate-pulse">データを同期中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-gray-800 relative">
      <div className="max-w-[400px] mx-auto bg-[#F9FAFB] min-h-screen relative shadow-lg">

        {/* ══ ヘッダー（深いブルー） ══ */}
        <header className="fixed top-0 w-full max-w-[400px] z-50 bg-[#20387B] shadow-md">
          <div className="h-14 px-4 flex items-center justify-between">
            <h1 className="text-base font-bold text-white tracking-wide">サークル管理（幹部専用）</h1>
            <div className="flex items-center gap-3">
              <button className="text-white/80 hover:text-white transition-colors" aria-label="メニュー">
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </header>

        {/* ══ メインコンテンツ ══ */}
        <main className="px-4 pt-20 pb-24 min-h-screen">
          {activeTab === 'home' && <HomeScreen onNavigate={setActiveTab} />}
          {activeTab === 'plan' && <PlanScreen />}
          {activeTab === 'activity' && <ActivityScreen />}
          {activeTab === 'members' && <MemberScreen />}
          {activeTab === 'accounting' && <AccountingScreen />}
        </main>

        {/* ══ ボトムナビゲーション ══ */}
        <nav className="fixed bottom-0 w-full max-w-[400px] z-50 bg-white border-t border-gray-200 shadow-[0_-1px_6px_rgba(0,0,0,0.08)]">
          <div className="flex justify-around">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              const { Icon } = tab;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex flex-col items-center pt-2.5 pb-3 gap-1 relative transition-colors duration-150 ${
                    isActive ? 'text-[#20387B]' : 'text-gray-400 hover:text-gray-500'
                  }`}
                >
                  {isActive && <div className="absolute top-0 w-8 h-1 bg-blue-400 rounded-b-md"></div>}
                  <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
                  <span className={`text-[10px] leading-none font-medium ${isActive ? 'font-semibold' : ''}`}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="h-safe-bottom bg-white" />
        </nav>

      </div>
    </div>
  );
}


