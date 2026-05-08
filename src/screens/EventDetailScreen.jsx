import { useState } from 'react';
import { ChevronLeft, Plus, Trash2 } from 'lucide-react';
import { cleanNum } from '../utils';

// ── ユーティリティ ───────────────────────────────────────
const toInt  = (v) => parseInt(v, 10) || 0;
const newInc = () => ({ id: Date.now() + Math.random(), label: '', unitPrice: '', count: '' });
const newExp = () => ({ id: Date.now() + Math.random(), label: '', amount: '' });

// ── 共通: セクションヘッダー ─────────────────────────────
function SectionHeader({ children }) {
  return (
    <div className="flex items-center gap-2 pt-1">
      <span className="text-[11px] font-bold text-slate-400 tracking-widest uppercase whitespace-nowrap">
        {children}
      </span>
      <div className="flex-1 h-px bg-slate-700" />
    </div>
  );
}

// ── 共通: ラベル付き入力ラッパー ─────────────────────────
function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] text-slate-500">{label}</span>
      {children}
    </div>
  );
}

// ── スタイル定数 ─────────────────────────────────────────
const INP   = 'bg-transparent border border-slate-600 rounded text-white text-sm px-2 py-1.5 w-full focus:outline-none focus:border-blue-400 transition-colors';
const INP_R = INP + ' font-mono text-right tabular-nums';

// ═══════════════════════════════════════════════════════
//  参加者登録タブ（ParticipantScreen から移植）
// ═══════════════════════════════════════════════════════
function ParticipantTab({ members, participants, onToggle }) {
  const set   = new Set(participants);
  const count = set.size;
  return (
    <div className="space-y-3">
      {/* 参加人数サマリー（固定高で安定） */}
      <div className="h-16 border border-slate-700 rounded flex flex-col items-center justify-center text-center gap-0.5">
        {count > 0 ? (
          <>
            <span className="text-[10px] text-slate-500">参加予定</span>
            <p className="text-2xl font-bold text-blue-300 font-mono leading-none">{count}<span className="text-sm ml-0.5">名</span></p>
          </>
        ) : (
          <span className="text-xs text-slate-600">参加するメンバーを選択してください</span>
        )}
      </div>

      {/* メンバーリスト */}
      <div className="border border-slate-700 rounded overflow-hidden">
        {members.length === 0 ? (
          <p className="p-6 text-center text-slate-500 text-sm">先に名簿でメンバーを追加してください</p>
        ) : (
          <ul className="divide-y divide-slate-700/60">
            {members.map((m) => {
              const active = set.has(m.id);
              return (
                <li key={m.id}
                    className={`flex items-center gap-3 px-4 py-3 transition-colors ${active ? 'bg-blue-950/30' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    active ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'
                  }`}>
                    {m.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${active ? 'text-white' : 'text-slate-400'}`}>{m.name}</p>
                    {m.department && <p className="text-[10px] text-slate-500">{m.department}</p>}
                  </div>
                  <button
                    onClick={() => onToggle(m.id)}
                    className={`px-4 py-1.5 rounded text-xs font-bold w-18 transition-all flex-shrink-0 ${
                      active ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                    }`}
                  >
                    {active ? '参加' : '不参加'}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* 全員操作ボタン */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => members.forEach((m) => { if (!set.has(m.id)) onToggle(m.id); })}
          className="py-2 rounded text-sm font-semibold bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
        >全員参加</button>
        <button
          onClick={() => members.forEach((m) => { if (set.has(m.id)) onToggle(m.id); })}
          className="py-2 rounded text-sm font-semibold bg-slate-700 text-slate-400 hover:bg-slate-600 transition-colors"
        >全員解除</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  会計報告タブ（メイン）
// ═══════════════════════════════════════════════════════
function ReportTab({ event }) {
  // 基本情報
  const [date,      setDate]      = useState('');
  const [eventName, setEventName] = useState(event?.name || '');

  // 収入の部
  const [incRows, setIncRows] = useState([
    { id: 1, label: '参加費', unitPrice: String(event?.adminFeePerPerson || ''), count: '' },
  ]);

  // 支出の部
  const [expRows, setExpRows] = useState([
    { id: 1, label: '', amount: '' },
  ]);

  // 参加者内訳
  const [grade1,    setGrade1]    = useState('');
  const [grade2,    setGrade2]    = useState('');
  const [grade3p,   setGrade3p]   = useState('');

  // ── 計算 ──────────────────────────────────────────
  const totalIncome  = incRows.reduce((s, r) => s + toInt(r.unitPrice) * toInt(r.count), 0);
  const totalExpense = expRows.reduce((s, r) => s + toInt(r.amount), 0);
  const balance      = totalIncome - totalExpense;

  const totalIncCount   = incRows.reduce((s, r) => s + toInt(r.count), 0);
  const totalGradeCount = toInt(grade1) + toInt(grade2) + toInt(grade3p);
  const mismatch        = totalIncCount > 0 && totalGradeCount > 0 && totalIncCount !== totalGradeCount;
  const matched         = totalIncCount > 0 && totalGradeCount > 0 && totalIncCount === totalGradeCount;

  // ── CRUD: 収入 ────────────────────────────────────
  const updInc = (id, f, v) => setIncRows(p => p.map(r => r.id === id ? { ...r, [f]: v } : r));
  const addInc = () => setIncRows(p => [...p, newInc()]);
  const delInc = (id) => setIncRows(p => p.filter(r => r.id !== id));

  // ── CRUD: 支出 ────────────────────────────────────
  const updExp = (id, f, v) => setExpRows(p => p.map(r => r.id === id ? { ...r, [f]: v } : r));
  const addExp = () => setExpRows(p => [...p, newExp()]);
  const delExp = (id) => setExpRows(p => p.filter(r => r.id !== id));

  return (
    <div className="space-y-5">

      {/* ── 1. 基本情報 ────────────────────────────── */}
      <section className="space-y-2">
        <SectionHeader>基本情報</SectionHeader>
        <div className="grid grid-cols-2 gap-2">
          <Field label="日付">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={INP + ' [color-scheme:dark]'}
            />
          </Field>
          <Field label="イベント名">
            <input
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder={event?.name || 'イベント名'}
              className={INP}
            />
          </Field>
        </div>
      </section>

      {/* ── 2. サマリー（テキストのみ・グラフなし） ── */}
      <section className="space-y-2">
        <SectionHeader>集計</SectionHeader>
        <div className="grid grid-cols-3 divide-x divide-slate-700 border border-slate-700 rounded">
          <div className="flex flex-col items-center py-3 gap-0.5">
            <span className="text-[10px] text-slate-500">総収入</span>
            <span className="text-sm font-bold font-mono text-emerald-400 tabular-nums">
              ¥{totalIncome.toLocaleString()}
            </span>
          </div>
          <div className="flex flex-col items-center py-3 gap-0.5">
            <span className="text-[10px] text-slate-500">総支出</span>
            <span className="text-sm font-bold font-mono text-rose-400 tabular-nums">
              ¥{totalExpense.toLocaleString()}
            </span>
          </div>
          <div className="flex flex-col items-center py-3 gap-0.5">
            <span className="text-[10px] text-slate-500">繰越金</span>
            <span className={`text-sm font-bold font-mono tabular-nums ${
              balance > 0 ? 'text-blue-300' : balance < 0 ? 'text-orange-400' : 'text-slate-400'
            }`}>
              {balance > 0 ? '+' : ''}¥{balance.toLocaleString()}
            </span>
          </div>
        </div>
      </section>

      {/* ── 3. 収入の部 ────────────────────────────── */}
      <section className="space-y-1.5">
        <SectionHeader>収入の部</SectionHeader>

        {/* 列ヘッダー */}
        <div className="grid grid-cols-[1fr_72px_56px_68px_20px] gap-1 px-0.5">
          <span className="text-[10px] text-slate-600">項目名</span>
          <span className="text-[10px] text-slate-600 text-right">単価（円）</span>
          <span className="text-[10px] text-slate-600 text-right">人数</span>
          <span className="text-[10px] text-slate-600 text-right">小計</span>
          <span />
        </div>

        {/* 明細行 */}
        {incRows.map((row) => {
          const sub = toInt(row.unitPrice) * toInt(row.count);
          return (
            <div key={row.id} className="grid grid-cols-[1fr_72px_56px_68px_20px] gap-1 items-center">
              <input
                type="text"
                value={row.label}
                onChange={(e) => updInc(row.id, 'label', e.target.value)}
                placeholder="参加費"
                className={INP}
              />
              <input
                type="text" inputMode="numeric" pattern="\d*"
                value={row.unitPrice}
                onChange={(e) => updInc(row.id, 'unitPrice', cleanNum(e.target.value))}
                placeholder="0"
                className={INP_R}
              />
              <input
                type="text" inputMode="numeric" pattern="\d*"
                value={row.count}
                onChange={(e) => updInc(row.id, 'count', cleanNum(e.target.value))}
                placeholder="0"
                className={INP_R}
              />
              {/* 小計: 読み取り専用テキスト */}
              <span className="text-sm font-mono text-right text-slate-300 tabular-nums pr-0.5">
                ¥{sub.toLocaleString()}
              </span>
              <button
                onClick={() => delInc(row.id)}
                className="text-slate-600 hover:text-rose-400 transition-colors"
              >
                <Trash2 size={13} />
              </button>
            </div>
          );
        })}

        {/* 合計行 */}
        <div className="grid grid-cols-[1fr_72px_56px_68px_20px] gap-1 px-0.5 border-t border-slate-700 pt-1 mt-0.5">
          <span className="text-[10px] text-slate-500 col-span-2 text-right">合計</span>
          <span className="text-[10px] font-mono text-slate-400 text-right tabular-nums">{totalIncCount}名</span>
          <span className="text-[10px] font-mono font-bold text-emerald-400 text-right tabular-nums">
            ¥{totalIncome.toLocaleString()}
          </span>
          <span />
        </div>

        <button
          onClick={addInc}
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-200 transition-colors pt-1"
        >
          <Plus size={13} />収入行を追加
        </button>
      </section>

      {/* ── 4. 支出の部 ────────────────────────────── */}
      <section className="space-y-1.5">
        <SectionHeader>支出の部</SectionHeader>

        {/* 列ヘッダー */}
        <div className="grid grid-cols-[1fr_88px_20px] gap-1 px-0.5">
          <span className="text-[10px] text-slate-600">項目名</span>
          <span className="text-[10px] text-slate-600 text-right">金額（円）</span>
          <span />
        </div>

        {/* 明細行 */}
        {expRows.map((row) => (
          <div key={row.id} className="grid grid-cols-[1fr_88px_20px] gap-1 items-center">
            <input
              type="text"
              value={row.label}
              onChange={(e) => updExp(row.id, 'label', e.target.value)}
              placeholder="会場費"
              className={INP}
            />
            <input
              type="text" inputMode="numeric" pattern="\d*"
              value={row.amount}
              onChange={(e) => updExp(row.id, 'amount', cleanNum(e.target.value))}
              placeholder="0"
              className={INP_R}
            />
            <button
              onClick={() => delExp(row.id)}
              className="text-slate-600 hover:text-rose-400 transition-colors"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}

        {/* 合計行 */}
        <div className="grid grid-cols-[1fr_88px_20px] gap-1 px-0.5 border-t border-slate-700 pt-1 mt-0.5">
          <span className="text-[10px] text-slate-500 text-right">合計</span>
          <span className="text-[10px] font-mono font-bold text-rose-400 text-right tabular-nums">
            ¥{totalExpense.toLocaleString()}
          </span>
          <span />
        </div>

        <button
          onClick={addExp}
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-200 transition-colors pt-1"
        >
          <Plus size={13} />支出行を追加
        </button>
      </section>

      {/* ── 5. 参加者内訳 ──────────────────────────── */}
      <section className="space-y-2">
        <SectionHeader>参加者内訳（学年別）</SectionHeader>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: '1年生',     val: grade1,  set: setGrade1  },
            { label: '2年生',     val: grade2,  set: setGrade2  },
            { label: '3年生以上', val: grade3p, set: setGrade3p },
          ].map(({ label, val, set }) => (
            <Field key={label} label={label}>
              <input
                type="text" inputMode="numeric" pattern="\d*"
                value={val}
                onChange={(e) => set(cleanNum(e.target.value))}
                placeholder="0"
                className={INP_R}
              />
            </Field>
          ))}
        </div>

        {/* 内訳合計表示 */}
        <div className="flex items-center justify-between px-0.5">
          <span className="text-[10px] text-slate-600">内訳合計</span>
          <span className="text-[10px] font-mono text-slate-400 tabular-nums">{totalGradeCount}名</span>
        </div>

        {/* バリデーション: 赤文字警告（ポップアップなし） */}
        {mismatch && (
          <p className="text-xs text-red-400 leading-snug">
            ※ 人数が一致していません（収入合計 {totalIncCount}名 ≠ 内訳合計 {totalGradeCount}名）
          </p>
        )}
        {matched && (
          <p className="text-xs text-emerald-500">✓ 人数一致（{totalGradeCount}名）</p>
        )}
      </section>

      {/* 下部スペーサー */}
      <div className="h-4" />
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  メインエクスポート: 活動詳細画面（タブ切り替え）
// ═══════════════════════════════════════════════════════
import { useEffect } from 'react';
import { apiFetch } from '../utils';
import { Loader2 } from 'lucide-react';

export default function EventDetailScreen({ eventId, onError, onBack }) {
  const [tab, setTab] = useState('report'); 
  const [loading, setLoading] = useState(true);
  const [eventData, setEventData] = useState(null);
  const [members, setMembers] = useState([]);
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    if (eventId) {
      loadDetails();
    }
  }, [eventId]);

  const loadDetails = async () => {
    setLoading(true);
    try {
      // 1. イベント詳細
      const ev = await apiFetch(`/events/${eventId}`);
      setEventData(ev);
      // 2. メンバー一覧
      const mems = await apiFetch('/members');
      setMembers(mems || []);
      // 3. 参加者情報
      const parts = await apiFetch(`/events/${eventId}/participations`);
      if (Array.isArray(parts)) {
        const attendedIds = parts.filter(p => p.isAttended).map(p => p.member?.id || p.memberId);
        setParticipants(attendedIds);
      }
    } catch (err) {
      if (onError) onError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleParticipant = async (memberId) => {
    // 実際にはサーバーにPUT/POSTするが、UIを先行更新
    const isCurrentlyAttending = participants.includes(memberId);
    let nextParticipants = [];
    if (isCurrentlyAttending) {
      nextParticipants = participants.filter(id => id !== memberId);
    } else {
      nextParticipants = [...participants, memberId];
    }
    setParticipants(nextParticipants);

    try {
      // ここを実際に同期する場合は、APIエンドポイントを叩く
      // 簡易的にエラーが出ないように捕捉だけしておく（Accountingと同じ仕様）
      // const res = await apiFetch(`/events/${eventId}/participations`, { method: 'POST', body: ... });
    } catch (err) {
      // エラー時はフォールバック
      if (isCurrentlyAttending) {
        setParticipants([...participants]); 
      } else {
        setParticipants(participants.filter(id => id !== memberId));
      }
      if (onError) onError(err);
    }
  };

  if (loading || !eventData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <Loader2 className="animate-spin mb-2" size={32} />
        <p className="text-sm font-bold">データ読み込み中...</p>
      </div>
    );
  }

  const pcnt = participants.length;

  return (
    <div className="space-y-0">

      {/* ── ヘッダー（タイトル＋タブ切り替え） ── */}
      <div className="flex items-center gap-2 pt-2 pb-3">
        <button
          onClick={onBack}
          className="p-1.5 rounded text-slate-400 hover:text-white transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-bold truncate">{eventData.name}</h2>
        </div>

        {/* タブ */}
        <div className="flex bg-slate-800 border border-slate-700 rounded p-0.5 gap-0.5 flex-shrink-0">
          <button
            onClick={() => setTab('report')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
              tab === 'report'
                ? 'bg-slate-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            会計報告
          </button>
          <button
            onClick={() => setTab('participants')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
              tab === 'participants'
                ? 'bg-slate-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            参加者{pcnt > 0 && <span className="ml-0.5 text-blue-400">({pcnt})</span>}
          </button>
        </div>
      </div>

      {/* ── コンテンツ領域 ── */}
      {tab === 'report' && (
        <ReportTab event={eventData} />
      )}
      {tab === 'participants' && (
        <ParticipantTab
          members={members}
          participants={participants}
          onToggle={handleToggleParticipant}
        />
      )}

    </div>
  );
}
