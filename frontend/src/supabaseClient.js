import { createClient } from '@supabase/supabase-js';

// VITE_ プレフィックスの環境変数を想定しつつ、フォールバックとしてユーザー指定のプレースホルダーを使用
const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || 'https://[ここにあなたのProject URLを貼る].supabase.co';
const supabaseKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || '[ここにあなたのAPI Keyを貼る]';

export const supabase = createClient(supabaseUrl, supabaseKey);
