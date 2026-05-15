import { useState, useRef, useCallback } from 'react';
import {
  X, Upload, FileText, Sparkles, CheckCircle2, Trash2, Plus,
} from 'lucide-react';

// ── テキスト解析（モック） ────────────────────────────────
function parseText(raw) {
  return raw
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .map((line, i) => {
      // パターン1: "佐藤 健太（工学部）" or "佐藤 健太(工学部)"
      const bracket = line.match(/^(.+?)[\s　]*[（(](.+?)[)）]/);
      if (bracket) {
        return { id: Date.now() + i, name: bracket[1].trim(), department: bracket[2].trim() };
      }
      // パターン2: スペース区切りの末尾が "〜学部/研究科/学科"
      const parts = line.split(/[\s\t　]+/);
      if (parts.length >= 2) {
        const last = parts[parts.length - 1];
        if (/学部|研究科|学院|学科/.test(last)) {
          return { id: Date.now() + i, name: parts.slice(0, -1).join(' '), department: last };
        }
      }
      // パターン3: 名前のみ
      return { id: Date.now() + i, name: line, department: '' };
    });
}

// ── 画像アップ時のダミーデータ ────────────────────────────
const DUMMY_FROM_IMAGE = [
  { name: '田村 響',   department: '経済学部' },
  { name: '小林 杏奈', department: '文学部'   },
  { name: '中村 大輝', department: '工学部'   },
  { name: '松本 恵理', department: '医学部'   },
];

// ── モーダル本体 ─────────────────────────────────────────
export default function AiBulkImportModal({ onClose, onImport }) {
  const [tab,          setTab]          = useState('text');  // 'text' | 'photo'
  const [textInput,    setTextInput]    = useState('');
  const [imageFile,    setImageFile]    = useState(null);
  const [isDragging,   setIsDragging]   = useState(false);
  const [phase,        setPhase]        = useState('input'); // 'input' | 'loading' | 'preview'
  const [previewItems, setPreviewItems] = useState([]);
  const fileRef = useRef(null);

  // ── 解析実行 ──────────────────────────────────────────
  const handleAnalyze = async () => {
    if (tab === 'text' && !textInput.trim()) return;
    if (tab === 'photo' && !imageFile)       return;
    setPhase('loading');
    await new Promise((r) => setTimeout(r, 1800));
    const items = tab === 'text'
      ? parseText(textInput)
      : DUMMY_FROM_IMAGE.map((m, i) => ({ ...m, id: Date.now() + i }));
    setPreviewItems(items);
    setPhase('preview');
  };

  // ── プレビュー操作 ────────────────────────────────────
  const updateItem = (id, field, val) =>
    setPreviewItems((p) => p.map((m) => (m.id === id ? { ...m, [field]: val } : m)));
  const removeItem = (id) =>
    setPreviewItems((p) => p.filter((m) => m.id !== id));
  const addRow = () =>
    setPreviewItems((p) => [...p, { id: Date.now(), name: '', department: '' }]);

  // ── ドラッグ＆ドロップ ────────────────────────────────
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith('image/')) setImageFile(file);
  }, []);

  // ── 登録完了 ─────────────────────────────────────────
  const handleImport = () => {
    const valid = previewItems.filter((m) => m.name.trim());
    onImport(valid);
    onClose();
  };

  const detectedCount = textInput.split('\n').filter((l) => l.trim()).length;
  const validCount    = previewItems.filter((m) => m.name.trim()).length;

  return (
    /* ── 背景オーバーレイ ── */
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center
                 bg-black/75 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* ── モーダル本体 ── */}
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80
                      rounded-t-[28px] sm:rounded-[28px] shadow-2xl
                      max-h-[93vh] flex flex-col">

        {/* ヘッダー（sticky） */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-violet-600/20 border border-violet-500/30
                            flex items-center justify-center">
              <Sparkles size={15} className="text-violet-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">AI 一括読み込み</p>
              <p className="text-[10px] text-slate-500">テキスト / 写真から部員を一括登録</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* スクロール可能エリア */}
        <div className="overflow-y-auto flex-1 p-4 space-y-4">

          {/* ════ ローディング ════ */}
          {phase === 'loading' && (
            <div className="flex flex-col items-center justify-center py-20 gap-5">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full border-4 border-violet-900/60" />
                <div className="absolute inset-0 rounded-full border-4 border-transparent
                                border-t-violet-500 border-r-violet-400 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles size={22} className="text-violet-400 animate-pulse" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-base font-bold text-white">AIが解析中...</p>
                <p className="text-xs text-slate-500 mt-1">氏名・学部を読み取っています</p>
              </div>
              {/* ドット波アニメーション */}
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <div key={i}
                       className="w-2 h-2 rounded-full bg-violet-500 animate-bounce"
                       style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          )}

          {/* ════ 入力フェーズ ════ */}
          {phase === 'input' && (
            <>
              {/* タブ切り替え */}
              <div className="flex bg-slate-800 rounded-2xl p-1 gap-1">
                {[
                  { id: 'text',  label: 'テキストをペースト', Icon: FileText },
                  { id: 'photo', label: '写真をアップロード',  Icon: Upload  },
                ].map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    onClick={() => setTab(id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl
                                text-xs font-semibold transition-all duration-200 ${
                      tab === id
                        ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/30'
                        : 'text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    <Icon size={13} />
                    <span className="hidden xs:inline">{label}</span>
                    <span className="xs:hidden">{id === 'text' ? 'テキスト' : '写真'}</span>
                  </button>
                ))}
              </div>

              {/* ── テキストタブ ── */}
              {tab === 'text' && (
                <div className="space-y-2">
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    LINEのグループメンバー、Excelの名簿など
                    <br />1行に1名ずつ、名前（＋学部）を貼り付けてください
                  </p>
                  <textarea
                    rows={9}
                    placeholder={"例:\n佐藤 健太 工学部\n鈴木 翔太（経済学部）\n高橋 海人\n田中 美咲 文学部"}
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-600 rounded-2xl px-4 py-3
                               text-white text-sm placeholder-slate-600
                               focus:outline-none focus:ring-2 focus:ring-violet-500 transition
                               resize-none leading-relaxed font-mono"
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] text-slate-600">
                      氏名の後に空白＋学部名を入れると自動で分類されます
                    </p>
                    <p className="text-[10px] text-violet-400 font-semibold">
                      {detectedCount}行 検出
                    </p>
                  </div>
                </div>
              )}

              {/* ── 写真タブ ── */}
              {tab === 'photo' && (
                <div className="space-y-2">
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    名簿の写真・スクリーンショットをアップロードしてください
                    <br />AIが氏名・学部を読み取ります
                  </p>
                  <div
                    onDrop={handleDrop}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onClick={() => fileRef.current?.click()}
                    className={`relative flex flex-col items-center justify-center gap-3 py-14
                                rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 ${
                      isDragging
                        ? 'border-violet-400 bg-violet-900/20 scale-[1.01]'
                        : imageFile
                          ? 'border-emerald-500 bg-emerald-900/20'
                          : 'border-slate-600 bg-slate-800/60 hover:border-violet-500/60 hover:bg-slate-800'
                    }`}
                  >
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setImageFile(e.target.files[0] ?? null)}
                    />
                    {imageFile ? (
                      <>
                        <CheckCircle2 size={36} className="text-emerald-400" />
                        <div className="text-center px-4">
                          <p className="text-sm font-semibold text-emerald-300 truncate max-w-[200px]">
                            {imageFile.name}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">タップして変更</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-14 h-14 rounded-2xl bg-slate-700 border border-slate-600
                                        flex items-center justify-center">
                          <Upload size={26} className="text-slate-400" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-semibold text-slate-300">
                            {isDragging ? 'ここにドロップ' : '写真をドラッグ＆ドロップ'}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">またはタップしてファイルを選択</p>
                        </div>
                      </>
                    )}
                  </div>
                  {/* ※デモ注記 */}
                  <p className="text-[10px] text-slate-600 text-center">
                    ※デモ版: 画像アップロード時はサンプルデータを生成します
                  </p>
                </div>
              )}

              {/* 解析ボタン */}
              <button
                onClick={handleAnalyze}
                disabled={
                  (tab === 'text'  && !textInput.trim()) ||
                  (tab === 'photo' && !imageFile)
                }
                className={`w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2
                            transition-all duration-200 active:scale-[0.98] ${
                  (tab === 'text'  && !textInput.trim()) ||
                  (tab === 'photo' && !imageFile)
                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                    : 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-900/40'
                }`}
              >
                <Sparkles size={16} />
                AIで解析する
              </button>
            </>
          )}

          {/* ════ プレビューフェーズ ════ */}
          {phase === 'preview' && (
            <>
              {/* ヘッダー行 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-400" />
                  <p className="text-xs text-slate-300 font-semibold">
                    {previewItems.length}名を検出 — 内容を確認・修正できます
                  </p>
                </div>
                <button
                  onClick={() => setPhase('input')}
                  className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                >
                  ← やり直す
                </button>
              </div>

              {/* 編集可能リスト */}
              <div className="bg-slate-800/60 border border-slate-700 rounded-2xl overflow-hidden">
                {/* 列ヘッダー */}
                <div className="grid grid-cols-[28px_1fr_1fr_28px] gap-2 px-3 py-2
                                border-b border-slate-700 bg-slate-800/80">
                  <span className="text-[10px] text-slate-600 text-center">#</span>
                  <span className="text-[10px] text-slate-500 font-semibold">氏名</span>
                  <span className="text-[10px] text-slate-500 font-semibold">学部</span>
                  <span />
                </div>
                {/* 各行（編集可能） */}
                <div className="divide-y divide-slate-700/50">
                  {previewItems.map((item, idx) => (
                    <div key={item.id}
                         className="grid grid-cols-[28px_1fr_1fr_28px] gap-2 items-center px-3 py-2.5">
                      <span className="text-[10px] text-slate-600 text-center tabular-nums">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                        placeholder="氏名"
                        className="bg-slate-900/70 border border-slate-600/60 rounded-lg px-2.5 py-1.5
                                   text-white text-xs focus:outline-none focus:ring-1 focus:ring-violet-500 transition"
                      />
                      <input
                        type="text"
                        value={item.department}
                        onChange={(e) => updateItem(item.id, 'department', e.target.value)}
                        placeholder="学部"
                        className="bg-slate-900/70 border border-slate-600/60 rounded-lg px-2.5 py-1.5
                                   text-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-violet-500 transition"
                      />
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1 text-slate-600 hover:text-red-400 transition-colors rounded"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
                {/* 行追加 */}
                <button
                  onClick={addRow}
                  className="w-full py-3 flex items-center justify-center gap-1.5 text-xs text-slate-500
                             hover:text-slate-300 hover:bg-slate-700/40 transition-colors border-t border-slate-700/60"
                >
                  <Plus size={13} />
                  行を追加
                </button>
              </div>

              {/* 一括登録ボタン */}
              <button
                onClick={handleImport}
                disabled={validCount === 0}
                className={`w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2
                            transition-all duration-150 active:scale-[0.98] ${
                  validCount === 0
                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/40'
                }`}
              >
                <CheckCircle2 size={16} />
                この内容で名簿に登録（{validCount}名）
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
