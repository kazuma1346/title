// ─── 共通定数 / ユーティリティ ────────────────────────────

export const API_BASE = import.meta.env.VITE_API_URL || '/api';

/**
 * 共通APIフェッチラッパー
 * レスポンスの ok をチェックし、NGならエラーをthrowする
 */
export const apiFetch = async (endpoint, options = {}) => {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    if (!res.ok) {
      throw new Error(`API Error: ${res.status}`);
    }
    // 204 No Content などボディが空の場合のケア
    if (res.status === 204) return null;
    return await res.json();
  } catch (err) {
    console.error(`[apiFetch error] ${endpoint}:`, err);
    throw err; // App側でcatchして全体エラーにする
  }
};

/** ¥カンマ区切りフォーマット */
export const fmt = (n) => `¥${n.toLocaleString()}`;

/** 全角数字→半角変換 ＋ 数字以外を除去して文字列を返す */
export const cleanNum = (raw) =>
  raw
    .replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0))
    .replace(/[^0-9]/g, '');
