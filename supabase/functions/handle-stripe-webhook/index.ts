// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
import { stripe } from "../_shared/stripe.js"
import { corsHeaders } from "../_shared/cors.js"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

console.log("Hello from Stripe Webhook Function!")

serve(async (req) => {
  // CORSヘッダー
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // リクエストからStripeシグネチャを取得
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return new Response(
      JSON.stringify({ error: 'No signature provided' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    // リクエストボディを取得
    const body = await req.text()
    
    // Stripeイベントを検証・構築
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

    // Supabaseクライアント初期化
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 支払い成功イベントの処理
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      
      // ユーザーID（メタデータかカスタマーIDから取得）
      const userId = session.client_reference_id || session.customer
      
      if (userId) {
        // ユーザーのプレミアムステータスを更新
        const { data, error } = await supabase
          .from('user_subscriptions')
          .upsert({
            user_id: userId,
            payment_status: 'completed',
            subscription_type: 'premium',
            payment_id: session.id,
            amount_paid: session.amount_total / 100,  // セントから円に変換
            is_active: true,
            expires_at: null,  // 買い切りなので期限なし
            payment_method: session.payment_method_types[0],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          
        if (error) {
          console.error('Error updating user subscription:', error)
        }
      }
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('Error processing webhook:', err)
    return new Response(
      JSON.stringify({ error: `Webhook Error: ${err.message}` }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})