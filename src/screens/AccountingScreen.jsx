import { useState, useEffect } from 'react';
import { fmt, cleanNum, apiFetch } from '../utils';
import { Loader2 } from 'lucide-react';

export default function AccountingScreen({ onError, activeEventId }) {
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [eventData, setEventData] = useState(null);
  
  // イベントが選択されていない状態
  if (!activeEventId) {
    return (
      <div className="flex flex-col items-center justify-center p-10 h-64 text-center">
        <p className="text-4xl mb-4">💰</p>
        <p className="text-slate-400 font-bold">イベントが選択されていません</p>
        <p className="text-xs text-slate-500 mt-2">
          「活動」タブからイベントを選ぶか、<br/>「予定作成」から新しいイベントを作成してください。
        </p>
      </div>
    );
  }

  useEffect(() => {
    loadData();
  }, [activeEventId]);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. メンバー一覧の取得
      const membersData = await apiFetch('/members');
      setMembers(membersData || []);

      // 2. イベント基本情報の取得
      const currentEvent = await apiFetch(`/events/${activeEventId}`);
      setEventData(currentEvent);

      // 3. 参加状況の取得
      const participations = await apiFetch(`/events/${activeEventId}/participations`);
      const attMap = {};
      if (Array.isArray(participations)) {
        participations.forEach(p => {
          // p.memberId が必要（バックエンドの構造に合わせて調整）
          // 仮に p.member.id または p.memberId とする
          const mId = p.member?.id || p.memberId;
          if (mId) {
            attMap[mId] = { isAttended: p.isAttended, isPaid: p.isPaid, id: p.id };
          }
        });
      }
      setAttendance(attMap);
    } catch (err) {
      if (onError) onError(err);
    } finally {
      setLoading(false);
    }
  };

  const toggle = async (memberId, field) => {
    const cur = attendance[memberId] || { isAttended: false, isPaid: false };
    const next = { ...cur, [field]: !cur[field] };
    if (field === 'isAttended' && !next.isAttended) next.isPaid = false;

    // オプティミスティックUI更新
    setAttendance(prev => ({ ...prev, [memberId]: next }));

    try {
      if (cur.id) {
        // 既存の参加レコードがある場合は PUT
        await apiFetch(`/participations/${cur.id}`, {
          method: 'PUT',
          body: JSON.stringify({ isAttended: next.isAttended, isPaid: next.isPaid }),
        });
      } else {
        // 新規の場合は POST (バックエンド設計に依存)
        const res = await apiFetch(`/events/${activeEventId}/participations`, {
          method: 'POST',
          body: JSON.stringify({ memberId, isAttended: next.isAttended, isPaid: next.isPaid }),
        });
        // 採番されたIDをセット
        setAttendance(prev => ({ ...prev, [memberId]: { ...next, id: res.id } }));
      }
    } catch (err) {
      // エラー時はフォールバックして元に戻す
      setAttendance(prev => ({ ...prev, [memberId]: cur }));
      if (onError) onError(err);
    }
  };

  // 派生情報の計算
  const attendedCount = Object.values(attendance).filter((s) => s.isAttended).length;
  const paidCount     = Object.values(attendance).filter((s) => s.isPaid).length;

  const baseCost = eventData?.baseCost || 0;
  const adminFee = eventData?.adminFeePerPerson || 0;
  
  let feePerPerson = 0;
  if (attendedCount > 0) {
    feePerPerson = Math.ceil(baseCost / attendedCount / 100) * 100 + Number(adminFee);
  }

  const expectedTotal = attendedCount * feePerPerson;
  const actualTotal   = paidCount     * feePerPerson;
  const difference    = actualTotal   - expectedTotal;
  const isSettled     = difference === 0 && attendedCount > 0;

  if (loading && !eventData) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-500">
        <Loader2 className="animate-spin mb-2" size={32} />
        <p className="text-sm font-bold">データ読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* タイトル */}
      <div className="pt-2">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-lg font-bold">💰 会計ダッシュボード</h2>
            <p className="text-xs text-slate-400 mt-0.5">出席・支払い状況の管理</p>
          </div>
          {eventData && (
            <span className="text-xs bg-blue-900/40 text-blue-300 font-semibold px-2 py-1 rounded-lg border border-blue-700/50">
              {eventData.name || '名称未設定イベント'}
            </span>
          )}
        </div>
      </div>

      {/* ── イベント設定 ── */}
      <section className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-3">📋 イベント設定 (読取専用)</p>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-slate-400">イベント実費合計（円）</span>
            <input
              type="text" readOnly value={fmt(baseCost).replace('¥', '')}
              className="bg-slate-900/50 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-400 text-sm text-right font-mono outline-none"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-slate-400">1人あたりの運営費（円）</span>
            <input
              type="text" readOnly value={fmt(adminFee).replace('¥', '')}
              className="bg-slate-900/50 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-400 text-sm text-right font-mono outline-none"
            />
          </label>
        </div>
        {/* 徴収額プレビュー ── h-24固定でレイアウトシフトを防止 */}
        <div className="mt-3 bg-blue-950/50 border border-blue-700/50 rounded-xl h-24
                        flex flex-col items-center justify-center text-center gap-1 overflow-hidden">
          {attendedCount > 0 ? (
            <>
              <span className="text-xs text-blue-400 leading-none">
                {attendedCount}名出席 → 1人あたりの徴収額
              </span>
              <p className="text-2xl font-bold text-blue-300 leading-none">{fmt(feePerPerson)}</p>
            </>
          ) : (
            <span className="text-xs text-blue-300/60">
              出席を登録すると徴収額を計算します
            </span>
          )}
        </div>
      </section>

      {/* ── 金額サマリー ── */}
      <section className="grid grid-cols-3 gap-2">
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-3 text-center">
          <p className="text-[10px] text-slate-400 mb-1">回収予定</p>
          <p className="text-base font-bold leading-tight">{fmt(expectedTotal)}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">{attendedCount}名</p>
        </div>
        <div className="bg-slate-800/60 border border-blue-700/50 rounded-2xl p-3 text-center">
          <p className="text-[10px] text-blue-400 mb-1">現在回収済</p>
          <p className="text-base font-bold text-blue-300 leading-tight">{fmt(actualTotal)}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">{paidCount}名</p>
        </div>
        <div className={`rounded-2xl p-3 text-center border ${
          isSettled      ? 'bg-emerald-900/40 border-emerald-600/50' :
          difference < 0 ? 'bg-red-900/40 border-red-700/50' :
                           'bg-slate-800/60 border-slate-700'
        }`}>
          <p className={`text-[10px] mb-1 ${isSettled ? 'text-emerald-400' : difference < 0 ? 'text-red-400' : 'text-slate-400'}`}>
            過不足
          </p>
          <p className={`text-base font-bold leading-tight ${isSettled ? 'text-emerald-300' : difference < 0 ? 'text-red-400' : 'text-green-400'}`}>
            {difference > 0 ? '+' : ''}{fmt(difference)}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">{isSettled ? '✅ OK' : difference < 0 ? '未回収' : '—'}</p>
        </div>
      </section>

      {/* 精算OKバナー */}
      {isSettled && (
        <div className="bg-emerald-800/50 border border-emerald-500 rounded-xl py-3 text-center
                        text-emerald-300 font-bold text-sm animate-pulse shadow-lg shadow-emerald-900/20">
          🎉 金額が一致しました！精算可能です
        </div>
      )}

      {/* ── メンバーリスト ── */}
      <section className="bg-slate-800/60 border border-slate-700 rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">👥 メンバー一覧</p>
          <span className="text-xs text-slate-500">{members.length}名</span>
        </div>

        {members.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">名簿にメンバーがいません</div>
        ) : (
          <ul className="divide-y divide-slate-700/60 relative">
            {loading && (
              <div className="absolute inset-0 bg-slate-900/50 z-10 flex items-center justify-center">
                <Loader2 className="animate-spin text-white" />
              </div>
            )}
            {members.map((member) => {
              const status = attendance[member.id] ?? { isAttended: false, isPaid: false };
              return (
                <li key={member.id}
                    className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-700
                                    flex items-center justify-center text-xs font-bold text-slate-300 flex-shrink-0">
                      {member.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-white text-sm truncate">{member.name}</p>
                      {member.department && (
                        <p className="text-[10px] text-slate-400">{member.department}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-2 flex-shrink-0 relative z-20">
                    {/* 出席トグル */}
                    <button
                      onClick={() => toggle(member.id, 'isAttended')}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 w-16 ${
                        status.isAttended
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                          : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                      }`}
                    >
                      {status.isAttended ? '出席' : '欠席'}
                    </button>
                    {/* 支払トグル */}
                    <button
                      onClick={() => toggle(member.id, 'isPaid')}
                      disabled={!status.isAttended}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 w-16 ${
                        !status.isAttended
                          ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                          : status.isPaid
                            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40'
                            : 'bg-amber-700/60 text-amber-300 hover:bg-amber-700'
                      }`}
                    >
                      {status.isPaid ? '支払済' : '未払い'}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

    </div>
  );
}
