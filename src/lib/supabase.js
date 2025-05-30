import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './env';

// 環境変数から接続情報を取得
const supabaseUrl = SUPABASE_URL;
const supabaseAnonKey = SUPABASE_ANON_KEY;

// 接続情報がない場合、開発用の警告を表示
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ Supabase接続情報が設定されていません。.env.localファイルを作成し、以下の変数を設定してください：\n' +
    'VITE_SUPABASE_URL=https://your-project-url.supabase.co\n' +
    'VITE_SUPABASE_ANON_KEY=your-anon-key'
  );
}

// Supabaseクライアントの初期化
const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

export default supabase;