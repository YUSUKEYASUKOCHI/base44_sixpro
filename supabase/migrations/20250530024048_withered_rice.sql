-- ユーザーサブスクリプションテーブル
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_type TEXT NOT NULL CHECK (subscription_type IN ('premium', 'basic')),
  payment_status TEXT NOT NULL CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_id TEXT,
  amount_paid NUMERIC(10,2),
  is_active BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ,
  payment_method TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions (user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_is_active ON user_subscriptions (is_active);

-- 更新日時トリガー
CREATE TRIGGER update_user_subscriptions_updated_at
BEFORE UPDATE ON user_subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- RLS設定
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- サブスクリプション用RLSポリシー
CREATE POLICY "ユーザーは自分のサブスクリプションのみ閲覧可能" 
  ON user_subscriptions FOR SELECT 
  USING (auth.uid() = user_id);

-- サービスロールは全てのサブスクリプションにアクセス可能
-- ※これはStripeウェブフックなどで使用
CREATE POLICY "サービスロールは全ての操作が可能" 
  ON user_subscriptions FOR ALL 
  USING (auth.jwt() ->> 'role' = 'service_role');