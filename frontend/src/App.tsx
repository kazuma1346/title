import React, { useState } from 'react';
import { Home, ClipboardList, History, Users, Receipt, AlertTriangle, Plus, Search } from 'lucide-react';

type Tab = 'home' | 'planning' | 'activity' | 'members' | 'accounting';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');

  return (
    <div className="mx-auto bg-gray-50 min-h-screen relative shadow-2xl flex flex-col" style={{ maxWidth: '400px' }}>
      {/* Header */}
      <header className="bg-[#20387B] text-white p-4 sticky top-0 z-50 shadow-md flex justify-center items-center h-14">
        <h1 className="text-lg font-bold">Circle Admin</h1>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 pb-24">
        {activeTab === 'home' && <HomeTab />}
        {activeTab === 'planning' && <PlanningTab />}
        {activeTab === 'activity' && <ActivityTab />}
        {activeTab === 'members' && <MembersTab />}
        {activeTab === 'accounting' && <AccountingTab />}
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white border-t border-gray-200 fixed bottom-0 w-full flex justify-around items-center h-16 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]" style={{ maxWidth: '400px' }}>
        <NavButton icon={<Home size={24} />} label="ホーム" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
        <NavButton icon={<ClipboardList size={24} />} label="企画" active={activeTab === 'planning'} onClick={() => setActiveTab('planning')} />
        <NavButton icon={<History size={24} />} label="活動" active={activeTab === 'activity'} onClick={() => setActiveTab('activity')} />
        <NavButton icon={<Users size={24} />} label="名簿" active={activeTab === 'members'} onClick={() => setActiveTab('members')} />
        <NavButton icon={<Receipt size={24} />} label="会計" active={activeTab === 'accounting'} onClick={() => setActiveTab('accounting')} />
      </nav>
    </div>
  );
}

function NavButton({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick} 
      className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${active ? 'text-blue-600' : 'text-gray-400 hover:text-gray-500'}`}
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}

// 1. ホーム
function HomeTab() {
  return (
    <div className="space-y-4">
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm flex items-start space-x-3">
        <AlertTriangle className="text-red-500 mt-0.5 shrink-0" size={20} />
        <div>
          <h3 className="text-red-700 font-semibold text-sm">⚠️ 要対応タスク</h3>
          <p className="text-red-600 text-sm mt-1">〇〇の未集金が3名います</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <h3 className="text-gray-500 text-xs font-semibold mb-1">現在の全体残高</h3>
        <p className="text-2xl font-bold text-gray-800">¥145,000</p>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <h3 className="text-gray-800 font-semibold mb-2 flex items-center gap-2">
          <ClipboardList size={18} className="text-[#20387B]" /> 幹部共有メモ
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed">
          次回の役員会議は金曜20時からです。
        </p>
      </div>
    </div>
  );
}

// 2. 企画
function PlanningTab() {
  const plans = [
    { id: 1, title: '新入生歓迎BBQ', date: '4月15日(土)', place: '淀川河川公園', memo: '食材の発注は水曜までに完了させる。', status: '進行中', statusColor: 'bg-blue-100 text-blue-700' },
    { id: 2, title: '初夏の日帰り旅行', date: '6月10日(土)', place: '未定', memo: '候補地を3つリストアップしてアンケートをとる。', status: '立案中', statusColor: 'bg-gray-100 text-gray-600' },
  ];

  return (
    <div className="space-y-4">
      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-colors">
        <Plus size={20} /> 新規企画立案
      </button>

      <div className="space-y-3">
        {plans.map(plan => (
          <div key={plan.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 relative">
            <span className={`absolute top-4 right-4 text-[10px] px-2 py-1 rounded-full font-bold tracking-wide ${plan.statusColor}`}>
              {plan.status}
            </span>
            <h3 className="text-base font-bold text-gray-800 mb-2 pr-16">{plan.title}</h3>
            <div className="space-y-1 text-sm text-gray-600 mb-3">
              <p className="flex items-center gap-1.5"><span className="opacity-70">🗓</span> {plan.date}</p>
              <p className="flex items-center gap-1.5"><span className="opacity-70">📍</span> {plan.place}</p>
            </div>
            <div className="bg-gray-50 p-2.5 rounded-lg text-xs text-gray-600 border border-gray-100 leading-relaxed">
              {plan.memo}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 3. 活動
function ActivityTab() {
  const activities = [
    { id: 1, title: '春の京都旅行', date: '3月20日', description: '嵐山周辺を散策。参加者25名。' },
    { id: 2, title: '追い出しコンパ', date: '2月28日', description: '卒業生10名を送る会。' },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-gray-800 font-bold mb-2 pl-1">過去の活動履歴</h2>
      <div className="space-y-3">
        {activities.map(act => (
          <div key={act.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 opacity-90">
            <h3 className="font-semibold text-gray-800 text-sm mb-1">{act.title}</h3>
            <p className="text-[10px] text-gray-500 mb-2 font-medium tracking-wide">{act.date}</p>
            <p className="text-xs text-gray-600">{act.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// 4. 名簿
function MembersTab() {
  return (
    <div className="space-y-5">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          placeholder="メンバーを検索..." 
          className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#20387B] shadow-sm transition-all"
        />
      </div>

      <div className="space-y-4">
        {/* Group 1 */}
        <div>
          <h3 className="text-[11px] font-bold text-gray-500 tracking-wider mb-2 pl-2">2年生 経済学部</h3>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-50">
            <MemberRow name="山田 太郎" role="代表" />
            <MemberRow name="佐藤 花子" role="副代表" />
          </div>
        </div>
        {/* Group 2 */}
        <div>
          <h3 className="text-[11px] font-bold text-gray-500 tracking-wider mb-2 pl-2">2年生 文学部</h3>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-50">
            <MemberRow name="鈴木 一郎" role="会計" />
            <MemberRow name="田中 美咲" role="" />
          </div>
        </div>
      </div>
    </div>
  );
}

function MemberRow({ name, role }: { name: string, role: string }) {
  return (
    <div className="p-3.5 flex items-center justify-between">
      <span className="font-medium text-gray-800 text-sm">{name}</span>
      {role && <span className="bg-[#20387B] bg-opacity-10 text-[#20387B] text-[10px] px-2 py-0.5 rounded flex items-center font-bold tracking-wide">{role}</span>}
    </div>
  );
}

// 5. 会計
function AccountingTab() {
  const expenses = [
    { id: 1, title: '新歓ビラ印刷代', amount: 3500, date: '4月2日', user: '山田太郎' },
    { id: 2, title: '会議室レンタル代', amount: 1200, date: '3月28日', user: '鈴木一郎' },
  ];

  return (
    <div className="space-y-5">
      <button className="w-full bg-white border-2 border-dashed border-gray-300 hover:border-[#20387B] hover:bg-blue-50 text-gray-600 hover:text-[#20387B] font-semibold py-4 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors">
        <Plus size={20} /> 領収書をアップロード
      </button>

      <div>
        <h2 className="text-gray-800 font-bold mb-3 pl-1">直近の支出履歴</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-50">
          {expenses.map(exp => (
            <div key={exp.id} className="p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-800 text-sm">{exp.title}</p>
                <div className="flex gap-1.5 text-[11px] text-gray-400 mt-1 font-medium tracking-wide">
                  <span>{exp.date}</span>
                  <span>•</span>
                  <span>{exp.user}</span>
                </div>
              </div>
              <div className="font-bold text-gray-800 text-sm">
                - ¥{exp.amount.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
