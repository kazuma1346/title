import { useState, useMemo, useEffect } from 'react';
import { Plus, ChevronLeft, MapPin, Calendar, Users, CheckSquare, XSquare, Calculator, TrendingUp, TrendingDown, Edit3, Link as LinkIcon, Unlink, Trash2, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { MOCK_MEMBERS } from '../data/mockData';
import { supabase } from '../supabaseClient';

const mockPlans = [
  { 
    id: 1, 
    title: '秋のBBQ大会', 
    status: '立案中', 
    date: '未定', 
    location: '奥多摩', 
    memo: '食材は各自持ち寄りか検討中。予算は一人2000円目安。', 
    fee: 2000,
    participants: ['佐藤 花子', '伊藤 美咲']
  },
  { 
    id: 2, 
    title: '木曽駒ヶ岳登山', 
    status: '進行中', 
    date: '2023/10/12', 
    location: '木曽駒ヶ岳', 
    memo: 'バス手配済み。参加費5000円。', 
    fee: 5000,
    participants: ['田中 一郎', '高橋 健太', '小林 結衣']
  }
];

export default function PlanScreen() {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showMemberSelect, setShowMemberSelect] = useState(false);
  const [expandedPlanId, setExpandedPlanId] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  
  const [fee, setFee] = useState(0);
  const [members, setMembers] = useState([]);
  const [isAutoSyncIncome, setIsAutoSyncIncome] = useState(true);

  const [accounting, setAccounting] = useState({
    incomes: [
      { id: 1, name: '当日回収', budget: 30000, actual: 30000, memo: '' },
      { id: 2, name: '繰越金', budget: 5000, actual: 5000, memo: '' },
    ],
    expenses: [
      { id: 1, name: '会場費', budget: 15000, actual: 15000, memo: '' },
      { id: 2, name: '飲み物', budget: 10000, actual: 9500, memo: '少し余った' },
      { id: 3, name: '雑費', budget: 5000, actual: 4000, memo: '' },
    ],
    note: ''
  });

  const handleSelectPlan = async (plan) => {
    setSelectedPlan(plan);
    setFee(plan.fee || 0);
    setIsLoadingData(true);
    
    try {
      // 1. Supabaseからmembersテーブルの最新データを取得試行
      const { data: membersData, error: mError } = await supabase.from('members').select('*');
      
      if (membersData && membersData.length > 0) {
        setMembers(membersData);
      } else {
        // データが無い場合はモックをベースに初期化
        const initialMembers = MOCK_MEMBERS.map(m => ({ 
          ...m, 
          inPlan: plan.participants && plan.participants.includes(m.name),
          status: '参加', 
          payment: '未' 
        }));
        setMembers(initialMembers);
      }

      // 2. Supabaseからaccountingテーブルの最新データを取得試行
      const { data: accData, error: aError } = await supabase.from('accounting').select('*');
      if (accData && accData.length > 0) {
        // 例: accDataを適切な形式にパースしてセット（ここでは省略しモックを使用）
      }
      
    } catch (error) {
      console.error("Data fetch error:", error);
    } finally {
      setIsLoadingData(false);
      setIsAutoSyncIncome(true);
    }
  };

  const toggleInPlan = async (id) => {
    const member = members.find(m => m.id === id);
    if (!member) return;
    const newInPlan = !member.inPlan;
    
    // UI即時反映
    setMembers(prev => prev.map(m => m.id === id ? { ...m, inPlan: newInPlan } : m));
    
    // DB更新
    try {
      await supabase.from('members').update({ inPlan: newInPlan }).eq('id', id);
    } catch (e) {
      console.error("Supabase update error:", e);
    }
  };

  const toggleMemberStatus = async (id) => {
    const member = members.find(m => m.id === id);
    if (!member) return;
    const newStatus = member.status === '参加' ? '不参加' : '参加';
    
    setMembers(prev => prev.map(m => m.id === id ? { ...m, status: newStatus } : m));
    try {
      await supabase.from('members').update({ status: newStatus }).eq('id', id);
    } catch (e) {
      console.error("Supabase update error:", e);
    }
  };

  const toggleMemberPayment = async (id) => {
    const member = members.find(m => m.id === id);
    if (!member) return;
    const newPayment = member.payment === '済' ? '未' : '済';
    
    setMembers(prev => prev.map(m => m.id === id ? { ...m, payment: newPayment } : m));
    try {
      await supabase.from('members').update({ payment: newPayment }).eq('id', id);
    } catch (e) {
      console.error("Supabase update error:", e);
    }
  };

  const collectedCount = useMemo(() => members.filter(m => m.inPlan && m.status === '参加' && m.payment === '済').length, [members]);
  const autoIncomeAmount = fee * collectedCount;
  const autoIncomeMemo = `¥${fee.toLocaleString()} × ${collectedCount}名`;

  useEffect(() => {
    if (isAutoSyncIncome) {
      setAccounting(prev => ({
        ...prev,
        incomes: prev.incomes.map(item => item.id === 1 ? { ...item, actual: autoIncomeAmount, memo: autoIncomeMemo } : item)
      }));
      // DB更新 (当日回収)
      supabase.from('accounting').update({ actual: autoIncomeAmount, memo: autoIncomeMemo }).eq('id', 1).catch(e => console.error(e));
    }
  }, [isAutoSyncIncome, autoIncomeAmount, autoIncomeMemo]);

  const totalIncome = useMemo(() => accounting.incomes.reduce((sum, item) => sum + (Number(item.actual) || 0), 0), [accounting.incomes]);
  const totalExpense = useMemo(() => accounting.expenses.reduce((sum, item) => sum + (Number(item.actual) || 0), 0), [accounting.expenses]);
  const balance = totalIncome - totalExpense;

  const handleUpdateItem = async (type, id, field, value) => {
    setAccounting(prev => ({
      ...prev,
      [type]: prev[type].map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
    
    try {
      await supabase.from('accounting').update({ [field]: value }).eq('id', id);
    } catch (e) {
      console.error("Supabase update error:", e);
    }
  };

  const handleAddItem = (type) => {
    const newItem = { id: Date.now(), name: '', budget: '', actual: '', memo: '' };
    setAccounting(prev => ({
      ...prev,
      [type]: [...prev[type], newItem]
    }));
    // supabase insert
    supabase.from('accounting').insert([newItem]).catch(e => console.error(e));
  };

  const handleRemoveItem = (type, id) => {
    setAccounting(prev => ({
      ...prev,
      [type]: prev[type].filter(item => item.id !== id)
    }));
    // supabase delete
    supabase.from('accounting').delete().eq('id', id).catch(e => console.error(e));
  };

  const toggleAccordion = (e, planId) => {
    e.stopPropagation();
    setExpandedPlanId(prev => prev === planId ? null : planId);
  };

  if (showMemberSelect) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <button onClick={() => setShowMemberSelect(false)} className="p-2 -ml-2 text-gray-600">
            <ChevronLeft size={24} />
          </button>
          <h2 className="font-bold text-lg text-gray-900">メンバーを追加</h2>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-sm text-gray-500 mb-4">名簿から追加するメンバーを選択してください</p>
          <div className="space-y-2 h-[60vh] overflow-y-auto">
            {members.map(m => (
              <label key={m.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={m.inPlan || false}
                  onChange={() => toggleInPlan(m.id)}
                  className="w-5 h-5 text-blue-500 rounded focus:ring-blue-500" 
                />
                <span className="text-gray-800 text-sm">{m.grade} {m.faculty} - {m.name}</span>
              </label>
            ))}
          </div>
          <button 
            onClick={() => setShowMemberSelect(false)}
            className="w-full mt-6 bg-blue-400 text-white font-bold py-3 rounded-xl active:bg-blue-500 shadow-sm min-h-[48px]"
          >
            選択したメンバーを追加
          </button>
        </div>
      </div>
    );
  }

  if (selectedPlan) {
    if (isLoadingData) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 size={32} className="text-blue-400 animate-spin mb-3" />
          <p className="text-sm text-gray-500 font-bold">データを同期しています...</p>
        </div>
      );
    }

    const participatingMembers = members.filter(m => m.inPlan);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <button onClick={() => setSelectedPlan(null)} className="p-2 -ml-2 text-gray-600 flex items-center min-h-[44px]">
            <ChevronLeft size={24} />
            <span className="font-bold text-lg ml-1">戻る</span>
          </button>
          <span className={`text-xs px-2 py-1 rounded font-bold ${
            selectedPlan.status === '進行中' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
          }`}>
            {selectedPlan.status}
          </span>
        </div>

        {/* ① 企画の概要 */}
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-3 border-t-4 border-[#20387B]">
          <h2 className="text-xl font-bold text-gray-900">{selectedPlan.title}</h2>
          <div className="flex flex-col gap-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-[#20387B]" />
              <span>{selectedPlan.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-[#20387B]" />
              <span>{selectedPlan.location}</span>
            </div>
          </div>

          <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-2 mt-2">
            <span className="font-bold text-gray-700 text-sm">一人あたりの参加費</span>
            <div className="flex items-center gap-1">
              <span className="text-gray-500 font-bold">¥</span>
              <input 
                type="number" 
                value={fee} 
                onChange={(e) => setFee(Number(e.target.value))} 
                className="w-20 bg-white border border-gray-300 rounded px-2 py-1.5 text-sm font-bold text-right outline-none focus:ring-2 focus:ring-[#20387B] min-h-[40px]"
              />
            </div>
          </div>
        </div>

        {/* ② 参加者リスト */}
        <div className="bg-white rounded-xl shadow-sm p-4 border-t-4 border-[#20387B]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Users size={18} className="text-[#20387B]" />
              参加者 ({participatingMembers.length}名)
            </h3>
            <button 
              onClick={() => setShowMemberSelect(true)}
              className="text-xs text-white font-bold bg-blue-400 px-3 py-1.5 rounded-lg active:bg-blue-500 transition-colors flex items-center shadow-sm min-h-[36px]"
            >
              ＋ メンバー追加
            </button>
          </div>
          
          <div className="space-y-2">
            {participatingMembers.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-2">参加メンバーがいません。</p>
            ) : (
              participatingMembers.map(member => (
                <div key={member.id} className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-2 last:border-0 last:pb-0 gap-1.5">
                  <span className={`font-medium text-sm ${member.status === '参加' ? 'text-gray-800' : 'text-gray-400 line-through'}`}>
                    {member.name}
                  </span>
                  <div className="flex gap-2 text-sm font-bold">
                    <button 
                      onClick={() => toggleMemberStatus(member.id)}
                      className={`flex-1 sm:flex-none px-2 py-1.5 rounded-lg border flex items-center justify-center gap-1 transition-colors min-h-[40px] ${
                      member.status === '参加' ? 'bg-blue-100 border-blue-200 text-blue-700' : 'bg-gray-100 border-gray-200 text-gray-400'
                    }`}>
                      {member.status === '参加' ? <CheckSquare size={14}/> : <XSquare size={14}/>}
                      {member.status}
                    </button>
                    <button 
                      onClick={() => toggleMemberPayment(member.id)}
                      disabled={member.status !== '参加'}
                      className={`flex-1 sm:flex-none px-2 py-1.5 rounded-lg border transition-colors min-h-[40px] ${
                      member.status !== '参加' ? 'bg-gray-50 border-gray-100 text-gray-300' :
                      member.payment === '済' ? 'bg-green-100 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-600'
                    }`}>
                      集金{member.status !== '参加' ? '-' : member.payment}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ③ 会計報告 */}
        <div className="bg-white rounded-xl shadow-sm p-3 space-y-3 border-t-4 border-[#20387B]">
          <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-1">
            <Calculator size={18} className="text-[#20387B]" />
            会計報告（収支管理）
          </h3>

          {/* 1. サマリー表示 */}
          <div className="grid grid-cols-3 gap-1 bg-gray-50 p-2 rounded-lg border border-gray-100">
            <div className="text-center p-1">
              <p className="text-[10px] text-gray-500 mb-0.5 flex items-center justify-center gap-1">
                <TrendingUp size={10} className="text-[#20387B]" />収入合計
              </p>
              <p className="font-bold text-sm text-[#20387B]">¥{totalIncome.toLocaleString()}</p>
            </div>
            <div className="text-center p-1 border-l border-gray-200">
              <p className="text-[10px] text-gray-500 mb-0.5 flex items-center justify-center gap-1">
                <TrendingDown size={10} className="text-red-500" />支出合計
              </p>
              <p className="font-bold text-sm text-red-600">¥{totalExpense.toLocaleString()}</p>
            </div>
            <div className={`text-center p-1 border-l border-gray-200 ${balance >= 0 ? 'bg-blue-50/50 rounded-md' : 'bg-red-50/50 rounded-md'}`}>
              <p className="text-[10px] font-bold text-gray-600 mb-0.5">繰越</p>
              <p className={`font-bold text-sm ${balance >= 0 ? 'text-[#20387B]' : 'text-red-600'}`}>
                {balance >= 0 ? '+' : ''}¥{balance.toLocaleString()}
              </p>
            </div>
          </div>

          {/* 2. 収入明細リスト */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-green-700 flex items-center gap-1 border-b border-green-100 pb-0.5">
              <Plus size={12} /> 収入の部
            </h4>
            <div className="space-y-2">
              {accounting.incomes.map(item => (
                <div key={item.id} className={`bg-white border rounded-lg p-2 shadow-sm ${item.id === 1 && isAutoSyncIncome ? 'border-blue-200 bg-blue-50/30' : 'border-gray-100'}`}>
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="flex items-center gap-1.5 flex-1">
                      <input 
                        type="text"
                        value={item.name}
                        onChange={(e) => handleUpdateItem('incomes', item.id, 'name', e.target.value)}
                        placeholder="科目名"
                        disabled={item.id === 1}
                        className={`font-bold text-gray-800 text-sm border-b py-0.5 outline-none flex-1 min-w-[80px] ${item.id === 1 ? 'bg-transparent border-transparent' : 'border-dashed border-gray-300 focus:border-[#20387B]'}`}
                      />
                      {item.id === 1 && (
                        <button 
                          onClick={() => setIsAutoSyncIncome(!isAutoSyncIncome)}
                          className={`flex items-center gap-1 text-[9px] font-bold px-1 py-0.5 rounded transition-colors ${
                            isAutoSyncIncome ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {isAutoSyncIncome ? <LinkIcon size={10} /> : <Unlink size={10} />}
                          連動 {isAutoSyncIncome ? 'ON' : 'OFF'}
                        </button>
                      )}
                    </div>
                    {item.id !== 1 && (
                      <button onClick={() => handleRemoveItem('incomes', item.id)} className="text-red-400 p-1 hover:text-red-600 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-1.5">
                    <div>
                      <label className="text-[9px] text-gray-500 block mb-0.5">予算 (¥)</label>
                      <input 
                        type="number" 
                        value={item.budget} 
                        onChange={(e) => handleUpdateItem('incomes', item.id, 'budget', e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded px-1.5 py-1.5 text-xs focus:ring-2 focus:ring-[#20387B] outline-none min-h-[36px]"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-green-600 font-bold block mb-0.5">決算 (¥)</label>
                      <input 
                        type="number" 
                        value={item.actual} 
                        disabled={item.id === 1 && isAutoSyncIncome}
                        onChange={(e) => handleUpdateItem('incomes', item.id, 'actual', e.target.value)}
                        className={`w-full border rounded px-1.5 py-1.5 text-xs font-bold outline-none focus:ring-2 focus:ring-green-500 min-h-[36px] ${
                          item.id === 1 && isAutoSyncIncome ? 'bg-gray-100 border-gray-200 text-gray-500' : 'bg-green-50 border-green-200'
                        }`}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap ${
                      Number(item.actual) - Number(item.budget) >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                    }`}>
                      差額: {Number(item.actual) - Number(item.budget) >= 0 ? '+' : ''}{(Number(item.actual) - Number(item.budget)).toLocaleString()}
                    </span>
                    <input 
                      type="text" 
                      placeholder="備考" 
                      value={item.memo}
                      disabled={item.id === 1 && isAutoSyncIncome}
                      onChange={(e) => handleUpdateItem('incomes', item.id, 'memo', e.target.value)}
                      className={`w-full text-xs bg-transparent border-b border-dashed py-1 outline-none min-h-[36px] ${
                        item.id === 1 && isAutoSyncIncome ? 'border-gray-200 text-gray-400' : 'border-gray-300 focus:border-[#20387B]'
                      }`}
                    />
                  </div>
                </div>
              ))}
              <button 
                onClick={() => handleAddItem('incomes')}
                className="w-full border border-dashed border-green-200 text-green-600 font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 active:bg-green-50 transition-colors text-xs min-h-[36px]"
              >
                <Plus size={12} /> 収入項目を追加
              </button>
            </div>
          </div>

          {/* 3. 支出リスト */}
          <div className="space-y-2 mt-3">
            <h4 className="text-xs font-bold text-red-700 flex items-center gap-1 border-b border-red-100 pb-0.5">
              <Plus size={12} className="rotate-45" /> 支出の部
            </h4>
            <div className="space-y-2">
              {accounting.expenses.map(item => (
                <div key={item.id} className="bg-white border border-gray-100 rounded-lg p-2 shadow-sm">
                  <div className="flex justify-between items-center mb-1.5">
                    <input 
                      type="text"
                      value={item.name}
                      onChange={(e) => handleUpdateItem('expenses', item.id, 'name', e.target.value)}
                      placeholder="科目名"
                      className="font-bold text-gray-800 text-sm border-b border-dashed border-gray-300 py-0.5 outline-none flex-1 min-w-[80px] focus:border-[#20387B]"
                    />
                    <button onClick={() => handleRemoveItem('expenses', item.id)} className="text-red-400 p-1 hover:text-red-600 transition-colors ml-1">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-1.5">
                    <div>
                      <label className="text-[9px] text-gray-500 block mb-0.5">予算 (¥)</label>
                      <input 
                        type="number" 
                        value={item.budget} 
                        onChange={(e) => handleUpdateItem('expenses', item.id, 'budget', e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded px-1.5 py-1.5 text-xs focus:ring-2 focus:ring-[#20387B] outline-none min-h-[36px]"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-red-600 font-bold block mb-0.5">決算 (¥)</label>
                      <input 
                        type="number" 
                        value={item.actual} 
                        onChange={(e) => handleUpdateItem('expenses', item.id, 'actual', e.target.value)}
                        className="w-full bg-red-50 border border-red-200 rounded px-1.5 py-1.5 text-xs font-bold focus:ring-2 focus:ring-red-500 outline-none min-h-[36px]"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap ${
                      Number(item.budget) - Number(item.actual) >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                    }`}>
                      差額: {Number(item.budget) - Number(item.actual) >= 0 ? '+' : ''}{(Number(item.budget) - Number(item.actual)).toLocaleString()}
                    </span>
                    <input 
                      type="text" 
                      placeholder="備考" 
                      value={item.memo}
                      onChange={(e) => handleUpdateItem('expenses', item.id, 'memo', e.target.value)}
                      className="w-full text-xs bg-transparent border-b border-dashed border-gray-300 py-1 outline-none focus:border-[#20387B] min-h-[36px]"
                    />
                  </div>
                </div>
              ))}
              <button 
                onClick={() => handleAddItem('expenses')}
                className="w-full border border-dashed border-red-200 text-red-600 font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 active:bg-red-50 transition-colors text-xs min-h-[36px]"
              >
                <Plus size={12} /> 支出項目を追加
              </button>
            </div>
          </div>

          {/* 4. 備考欄 */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <h4 className="text-xs font-bold text-gray-700 flex items-center gap-1 mb-1.5">
              <Edit3 size={12} className="text-gray-400" /> 全体備考
            </h4>
            <textarea 
              value={accounting.note}
              onChange={(e) => setAccounting(prev => ({ ...prev, note: e.target.value }))}
              placeholder="参加内訳や補足..."
              className="w-full text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-lg p-2 min-h-[60px] focus:outline-none focus:ring-2 focus:ring-[#20387B]"
            />
          </div>

          <button className="w-full bg-blue-400 text-white font-bold py-3 rounded-xl shadow-md active:bg-blue-500 transition-colors mt-2 min-h-[44px]">
            会計データを保存
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button className="w-full bg-blue-400 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-md active:bg-blue-500 transition-colors min-h-[48px]">
        <Plus size={20} />
        新規企画立案
      </button>

      <div className="space-y-3">
        {mockPlans.map(plan => {
          const isExpanded = expandedPlanId === plan.id;
          const participantCount = plan.participants ? plan.participants.length : 0;
          
          return (
            <div 
              key={plan.id}
              onClick={() => handleSelectPlan(plan)}
              className="bg-white rounded-xl shadow-sm p-4 active:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-200"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-gray-900 text-lg">{plan.title}</h3>
                <span className={`text-xs px-2 py-1 rounded font-bold ${
                  plan.status === '進行中' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                }`}>
                  {plan.status}
                </span>
              </div>
              
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
                <span className="flex items-center gap-1"><Calendar size={14} className="text-[#20387B]/60"/>{plan.date}</span>
                <span className="flex items-center gap-1"><MapPin size={14} className="text-[#20387B]/60"/>{plan.location}</span>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100">
                <button 
                  onClick={(e) => toggleAccordion(e, plan.id)}
                  className="flex items-center justify-between w-full p-1 -m-1 rounded hover:bg-gray-50 text-sm font-bold text-gray-700 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Users size={16} className="text-[#20387B]" />
                    参加予定 {participantCount} 名
                  </span>
                  {isExpanded ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                </button>
                
                {isExpanded && (
                  <div className="mt-2 pl-6 space-y-1" onClick={(e) => e.stopPropagation()}>
                    {plan.participants && plan.participants.length > 0 ? (
                      plan.participants.map((p, idx) => (
                        <div key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                          {p}
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-gray-400">参加予定者はまだいません</div>
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
