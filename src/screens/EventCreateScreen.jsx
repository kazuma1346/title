import { useState } from 'react';
import { cleanNum, apiFetch } from '../utils';

const EMPTY = { title: '', baseCost: '', estimatedCount: '', adminFeePerPerson: '' };

export default function EventCreateScreen({ onError, onEventCreated }) {
  const [form,       setForm]       = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [done,       setDone]       = useState(false);

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const b = parseInt(form.baseCost)          || 0;
  const n = parseInt(form.estimatedCount)    || 0;
  const a = parseInt(form.adminFeePerPerson) || 0;
  const perPerson   = n > 0 ? Math.ceil(b / n / 100) * 100 + a : 0;
  const totalBudget = perPerson * n;
  const canPreview  = n > 0;

  const handleSubmit = async () => {
    if (!form.title.trim()) { alert('イベント名を入力してください'); return; }
    setSubmitting(true);
    const payload = {
      name:              form.title,
      baseCost:          parseInt(form.baseCost)          || 0,
      adminFeePerPerson: parseInt(form.adminFeePerPerson) || 0,
      plannedCount:      parseInt(form.estimatedCount)    || 0,
    };
    try {
      const created = await apiFetch('/events', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      // 成功時のみ遷移処理
      setDone(true);
      setTimeout(() => {
        setForm(EMPTY);
        setDone(false);
        onEventCreated(created.id); // 生成されたイベントIDをAppに渡す
      }, 800);
    } catch (err) {
      if (onError) onError(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">

      {/* タイトル */}
      <div className="pt-2">
        <h2 className="text-lg font-bold">📅 予定作成</h2>
        <p className="text-xs text-slate-400 mt-0.5">新しいイベントの予算と徴収額を設定します</p>
      </div>

      {/* ── 入力カード ── */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 space-y-3">

        {/* 1. イベント名 */}
        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-400 font-medium">イベント名 *</span>
          <input
            type="text"
            placeholder="例: 夏合宿2025"
            value={form.title}
            onChange={(e) => { const v = e.target.value; set('title', v); }}
            className="bg-slate-900 border border-slate-600 rounded-xl px-3 py-2.5 text-white
                       focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
          />
        </label>

        {/* 2. 必要経費 */}
        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-400 font-medium">わかっている必要経費（円）</span>
          <input
            type="text" inputMode="numeric" pattern="\d*"
            placeholder="例: 85200"
            value={form.baseCost}
            onChange={(e) => { const v = e.target.value; set('baseCost', cleanNum(v)); }}
            className="bg-slate-900 border border-slate-600 rounded-xl px-3 py-2.5 text-white
                       focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-right font-mono text-sm"
          />
        </label>

        {/* 3. 運営費 */}
        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-400 font-medium">1人あたりの運営費（円）</span>
          <input
            type="text" inputMode="numeric" pattern="\d*"
            placeholder="例: 300"
            value={form.adminFeePerPerson}
            onChange={(e) => { const v = e.target.value; set('adminFeePerPerson', cleanNum(v)); }}
            className="bg-slate-900 border border-slate-600 rounded-xl px-3 py-2.5 text-white
                       focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-right font-mono text-sm"
          />
        </label>

        {/* 4. 参加予定人数 */}
        <label className="flex flex-col gap-1">
          <span className="text-xs text-slate-400 font-medium">参加予定人数（人）</span>
          <input
            type="text" inputMode="numeric" pattern="\d*"
            placeholder="例: 15"
            value={form.estimatedCount}
            onChange={(e) => { const v = e.target.value; set('estimatedCount', cleanNum(v)); }}
            className="bg-slate-900 border border-slate-600 rounded-xl px-3 py-2.5 text-white
                       focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-right font-mono text-sm"
          />
        </label>
      </div>

      {/* ── 区切り → 計算結果 ── */}
      {canPreview ? (
        <>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-700/60" />
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-slate-500 text-[10px] font-medium tracking-widest uppercase">計算結果</span>
              <span className="text-slate-500 text-sm leading-none">↓</span>
            </div>
            <div className="flex-1 h-px bg-slate-700/60" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* ① 徴収額 */}
            <div className="bg-blue-950/60 border border-blue-600/50 rounded-2xl p-4 text-center">
              <p className="text-[10px] text-blue-400 font-semibold mb-1 uppercase tracking-wide">① 1人あたりの徴収額</p>
              <p className="text-2xl font-bold text-blue-200">¥{perPerson.toLocaleString()}</p>
              <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">
                ({b.toLocaleString()} ÷ {n}人)<br />切り上げ＋運営費{a.toLocaleString()}円
              </p>
            </div>
            {/* ② 総予算 */}
            <div className="bg-emerald-950/50 border border-emerald-600/40 rounded-2xl p-4 text-center">
              <p className="text-[10px] text-emerald-400 font-semibold mb-1 uppercase tracking-wide">② 活動の総予算</p>
              <p className="text-2xl font-bold text-emerald-200">¥{totalBudget.toLocaleString()}</p>
              <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">
                ①{perPerson.toLocaleString()}円<br />× {n}人
              </p>
            </div>
          </div>
        </>
      ) : (
        <p className="text-center text-xs text-slate-600 py-2">
          参加予定人数を入力すると徴収額を計算します
        </p>
      )}

      {/* ── 作成ボタン ── */}
      <button
        onClick={handleSubmit}
        disabled={submitting || done}
        className={`w-full py-4 rounded-2xl font-bold text-base transition-all duration-200 active:scale-[0.98] ${
          done
            ? 'bg-emerald-600 text-white shadow-emerald-900/40 shadow-lg'
            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/40 shadow-lg'
        }`}
      >
        {done ? '✅ 作成しました！会計画面へ移動します' : submitting ? '⏳ 作成中...' : 'イベントを作成して会計を始める →'}
      </button>

    </div>
  );
}
