import { useState, useEffect } from 'react';
import { UserPlus, Trash2, CheckCircle, Sparkles, Loader2 } from 'lucide-react';
import { apiFetch } from '../utils';
import AiBulkImportModal from '../components/AiBulkImportModal';

export default function MemberScreen({ onError }) {
  const [members,    setMembers]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [name,       setName]       = useState('');
  const [department, setDepartment] = useState('');
  const [adding,     setAdding]     = useState(false);
  const [flashId,    setFlashId]    = useState(null);
  const [showAiModal, setShowAiModal] = useState(false);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/members');
      setMembers(data || []);
    } catch (err) {
      if (onError) onError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    const n = name.trim();
    if (!n) return;
    setAdding(true);
    try {
      const created = await apiFetch('/members', {
        method: 'POST',
        body: JSON.stringify({ name: n, department: department.trim() }),
      });
      setMembers((prev) => [...prev, created]);
      setFlashId(created.id);
      setTimeout(() => setFlashId(null), 1500);
      setName('');
      setDepartment('');
    } catch (err) {
      if (onError) onError(err);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      // APIにDELETEエンドポイントがある前提
      await apiFetch(`/members/${id}`, { method: 'DELETE' });
      setMembers((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      if (onError) onError(err);
    }
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleAdd(); };

  const handleBulkImport = async (items) => {
    try {
      // 実際には一括POST用のエンドポイントを使うか、一つずつPOSTする
      // ここは並行POSTの簡易実装
      const promises = items.map((m) => 
        apiFetch('/members', {
          method: 'POST',
          body: JSON.stringify({ name: m.name.trim(), department: (m.department || '').trim() }),
        })
      );
      const results = await Promise.all(promises);
      setMembers((prev) => [...prev, ...results]);
    } catch (err) {
      if (onError) onError(err);
    }
  };

  return (
    <>
      <div className="space-y-4">

        {/* タイトル */}
        <div className="pt-2">
          <h2 className="text-lg font-bold">👥 名簿</h2>
          <p className="text-xs text-slate-400 mt-0.5">部員のマスター管理</p>
        </div>

        {/* ── AI一括読み込みボタン ── */}
        <button
          onClick={() => setShowAiModal(true)}
          className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl font-bold text-sm
                     bg-gradient-to-r from-violet-700 to-indigo-700
                     hover:from-violet-600 hover:to-indigo-600
                     text-white shadow-lg shadow-violet-900/40
                     border border-violet-500/30
                     transition-all duration-200 active:scale-[0.98]"
        >
          <Sparkles size={16} className="text-violet-200" />
          AIで一括読み込み（写真 / テキスト）
        </button>

        {/* ── 通常の手動追加フォーム ── */}
        <section className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 space-y-3">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
            ＋ 新規メンバーを手動追加
          </p>

          <label className="flex flex-col gap-1">
            <span className="text-xs text-slate-400 font-medium">氏名 *</span>
            <input
              type="text"
              placeholder="例: 山田 太郎"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              className="bg-slate-900 border border-slate-600 rounded-xl px-3 py-2.5 text-white text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs text-slate-400 font-medium">学部（任意）</span>
            <input
              type="text"
              placeholder="例: 工学部"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              onKeyDown={handleKeyDown}
              className="bg-slate-900 border border-slate-600 rounded-xl px-3 py-2.5 text-white text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </label>

          <button
            onClick={handleAdd}
            disabled={adding || !name.trim()}
            className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2
                        transition-all duration-150 active:scale-[0.98] ${
              !name.trim()
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/30'
            }`}
          >
            {adding ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
            {adding ? '追加中...' : 'メンバーを追加'}
          </button>
        </section>

        {/* ── メンバー一覧 ── */}
        <section>
          <div className="flex items-center justify-between mb-2 px-1">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest">登録済み部員</p>
            <span className="text-xs bg-slate-700 text-slate-300 px-2.5 py-0.5 rounded-full font-medium">
              {members.length}名
            </span>
          </div>

          {loading ? (
            <div className="p-8 flex flex-col items-center justify-center text-slate-500">
              <Loader2 className="animate-spin mb-2" size={24} />
              <p className="text-sm">読み込み中...</p>
            </div>
          ) : members.length === 0 ? (
            <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-10 text-center">
              <p className="text-3xl mb-3">👀</p>
              <p className="text-slate-500 text-sm">まだ部員が登録されていません</p>
              <p className="text-slate-600 text-xs mt-1">上の「AI一括読み込み」または手動追加フォームから登録しましょう</p>
            </div>
          ) : (
            <div className="bg-slate-800/60 border border-slate-700 rounded-2xl overflow-hidden">
              <ul className="divide-y divide-slate-700/60">
                {members.map((m) => (
                  <li key={m.id}
                      className={`flex items-center gap-3 px-4 py-3.5 transition-colors duration-500 ${
                        flashId === m.id ? 'bg-blue-900/30' : ''
                      }`}>
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700
                                    flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                      {m.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white text-sm truncate">{m.name}</p>
                      {m.department && (
                        <p className="text-[10px] text-slate-400">{m.department}</p>
                      )}
                    </div>
                    {flashId === m.id ? (
                      <CheckCircle size={18} className="text-emerald-400 flex-shrink-0" />
                    ) : (
                      <button
                        onClick={() => handleDelete(m.id)}
                        className="p-2 text-slate-600 hover:text-red-400 active:text-red-500 transition-colors rounded-lg flex-shrink-0"
                        aria-label="削除"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

      </div>

      {/* AI一括登録モーダル */}
      {showAiModal && (
        <AiBulkImportModal
          onClose={() => setShowAiModal(false)}
          onImport={handleBulkImport}
        />
      )}
    </>
  );
}
