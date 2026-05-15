import { useState, useEffect } from 'react';
import { User, Plus, X, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';

const YEARS = ['1年生', '2年生', '3年生', '4年生'];
const DEPTS = ['経済学部', '文学部', '法学部', '工学部', '理学部', '商学部', '医学部', 'その他'];

export default function MemberScreen() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Supabaseからメンバー取得
  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('year', { ascending: true });

    if (error) {
      setError('データの取得に失敗しました');
    } else {
      setMembers(data);
    }
    setLoading(false);
  };

  // 学年 → 学部 でグルーピング
  const grouped = members.reduce((acc, member) => {
    const year = member.year || '不明';
    const dept = member.dept || '不明';
    if (!acc[year]) acc[year] = {};
    if (!acc[year][dept]) acc[year][dept] = [];
    acc[year][dept].push(member);
    return acc;
  }, {});

  const grades = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 size={32} className="text-blue-400 animate-spin mb-3" />
        <p className="text-sm text-gray-500">メンバーを読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-red-500">
        <AlertCircle size={32} className="mb-3" />
        <p className="text-sm">{error}</p>
        <button onClick={fetchMembers} className="mt-4 text-sm text-blue-600 underline">
          再試行
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 登録人数 */}
      <div className="bg-white rounded-xl shadow-sm p-4 text-center">
        <h2 className="text-sm font-bold text-gray-500 mb-1">現在の登録人数</h2>
        <p className="text-2xl font-bold text-[#20387B]">{members.length} 名</p>
      </div>

      {/* メンバー追加ボタン */}
      <button
        onClick={() => setShowModal(true)}
        className="w-full flex items-center justify-center gap-2 bg-[#20387B] hover:bg-[#162d66] text-white font-bold py-3 rounded-xl shadow-sm transition-colors"
      >
        <Plus size={20} />
        メンバーを追加
      </button>

      {/* メンバーリスト */}
      <div className="space-y-6">
        {grades.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-8">まだメンバーがいません</p>
        )}
        {grades.map(grade => (
          <div key={grade}>
            <h3 className="font-bold text-lg text-gray-800 border-b-2 border-[#20387B] pb-1 mb-3 inline-block">
              {grade}
            </h3>
            <div className="space-y-4">
              {Object.keys(grouped[grade]).sort().map(dept => (
                <div key={`${grade}-${dept}`} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="bg-[#20387B]/10 px-3 py-2 text-sm font-bold text-[#20387B]">
                    {dept}
                  </div>
                  <div className="divide-y divide-gray-100">
                    {grouped[grade][dept].map(member => (
                      <div key={member.id} className="p-3 flex items-center gap-3 min-h-[56px]">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                          <User size={16} />
                        </div>
                        <span className="font-medium text-gray-800">{member.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 追加モーダル */}
      {showModal && (
        <AddMemberModal
          onClose={() => setShowModal(false)}
          onAdded={(newMember) => {
            setMembers(prev => [...prev, newMember]);
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}

function AddMemberModal({ onClose, onAdded }) {
  const [name, setName] = useState('');
  const [year, setYear] = useState('1年生');
  const [dept, setDept] = useState('経済学部');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('名前を入力してください');
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from('members')
      .insert([{ name: name.trim(), year, dept }])
      .select()
      .single();

    if (error) {
      setError('追加に失敗しました。もう一度お試しください。');
      setLoading(false);
    } else {
      onAdded(data);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={onClose}>
      <div
        className="bg-white w-full max-w-[400px] rounded-t-2xl p-6 space-y-4"
        onClick={e => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-800">メンバーを追加</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* 名前 */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500">名前</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="例：田中 悠斗"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#20387B]"
            autoFocus
          />
        </div>

        {/* 学年 */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500">学年</label>
          <select
            value={year}
            onChange={e => setYear(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#20387B] bg-white"
          >
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        {/* 学部 */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500">学部</label>
          <select
            value={dept}
            onChange={e => setDept(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#20387B] bg-white"
          >
            {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {/* エラー */}
        {error && <p className="text-red-500 text-xs">{error}</p>}

        {/* 追加ボタン */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-[#20387B] hover:bg-[#162d66] disabled:bg-gray-300 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
          {loading ? '追加中...' : '追加する'}
        </button>
      </div>
    </div>
  );
}
