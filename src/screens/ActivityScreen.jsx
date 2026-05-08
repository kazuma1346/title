import { useState, useEffect } from 'react';
import { ChevronRight, Calendar, Loader2 } from 'lucide-react';
import EventDetailScreen from './EventDetailScreen';
import { apiFetch } from '../utils';

// ── メイン: イベント一覧 ─────────────────────────────────
export default function ActivityScreen({ onError, activeEventId, onSelectEvent }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // アクティブなイベントがなければ（一覧表示なら）一覧を取得
    if (!activeEventId) {
      loadEvents();
    }
  }, [activeEventId]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/events');
      setEvents(data || []);
    } catch (err) {
      if (onError) onError(err);
    } finally {
      setLoading(false);
    }
  };

  // イベントタップ → 会計報告 + 参加者タブの詳細画面
  if (activeEventId) {
    return (
      <EventDetailScreen
        eventId={activeEventId}
        onError={onError}
        onBack={() => onSelectEvent(null)}
      />
    );
  }

  // イベント一覧
  return (
    <div className="space-y-4">

      {/* タイトル */}
      <div className="pt-2">
        <h2 className="text-lg font-bold">🏃 活動</h2>
        <p className="text-xs text-slate-400 mt-0.5">過去のイベント確認と事後報告</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-500">
          <Loader2 className="animate-spin mb-2" size={32} />
          <p className="text-sm font-bold">読み込み中...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700
                          flex items-center justify-center text-3xl">
            📅
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-300">イベントがまだありません</p>
            <p className="text-xs text-slate-500 mt-1">「予定作成」タブからイベントを登録してください</p>
          </div>
        </div>
      ) : (
        /* ── リスト形式コンテナ ── */
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden">
          {events.map((ev, idx) => {
            const pcnt      = ev.plannedCount || 0; // 一旦予定人数
            const budget    = ev.baseCost || 0;
            const perPerson = ev.adminFeePerPerson || 0;
            const isLast    = idx === events.length - 1;

            // 参加状況ステータス (仮)
            const statusLabel = '完了 / 進行中';
            const statusClass  = 'bg-slate-700/60 border-slate-600/50 text-slate-500';

            return (
              <button
                key={ev.id}
                onClick={() => onSelectEvent(ev.id)}
                className={`w-full flex items-center justify-between gap-3
                            py-3 px-4 text-left
                            hover:bg-slate-700/50 active:bg-slate-700
                            transition-colors duration-100
                            ${!isLast ? 'border-b border-slate-700/70' : ''}`}
              >
                {/* ── 左側: アイコン + テキスト ── */}
                <div className="flex items-center gap-3 min-w-0">
                  {/* 小型アイコン */}
                  <div className="w-8 h-8 rounded-lg bg-blue-900/50 border border-blue-700/40
                                  flex items-center justify-center flex-shrink-0">
                    <Calendar size={14} className="text-blue-400" />
                  </div>
                  {/* イベント名 + 予算 */}
                  <div className="min-w-0">
                    <p className="font-semibold text-white text-sm leading-snug truncate">
                      {ev.name}
                    </p>
                    <p className="text-[10px] text-slate-500 leading-none mt-0.5">
                      予算 ¥{budget.toLocaleString()}
                      {perPerson > 0 && (
                        <span className="ml-1.5">· 運営費 ¥{perPerson.toLocaleString()}/人</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* ── 右側: ステータス + 人数 ── */}
                <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                  <span className={`text-[10px] border px-2 py-0.5 rounded-full font-semibold ${statusClass}`}>
                    {statusLabel}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-500">
                      予定 {pcnt}名
                    </span>
                    <ChevronRight size={12} className="text-slate-600" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

    </div>
  );
}
