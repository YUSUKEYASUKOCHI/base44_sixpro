import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno'

// Stripe初期化 - Supabase環境変数から秘密鍵を取得
export const stripe = Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16', // 最新のAPIバージョンを使用
})