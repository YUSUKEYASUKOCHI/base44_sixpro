-- 1. ユーザープロファイルテーブル
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  age INTEGER,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  height NUMERIC(5,2),
  weight NUMERIC(5,2),
  activity_level TEXT CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  goal TEXT CHECK (goal IN ('maintain', 'lose_weight', 'gain_weight', 'muscle_gain', 'health_improvement')),
  allergies TEXT[] DEFAULT '{}',
  dietary_restrictions TEXT[] DEFAULT '{}',
  preferred_cuisine TEXT[] DEFAULT '{}',
  disliked_foods TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT NOT NULL
);

-- 2. 生成されたメニューテーブル
CREATE TABLE IF NOT EXISTS generated_menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  total_calories INTEGER,
  total_protein NUMERIC(6,2),
  total_carbs NUMERIC(6,2),
  total_fat NUMERIC(6,2),
  target_date DATE NOT NULL,
  is_favorite BOOLEAN DEFAULT FALSE,
  meals JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT NOT NULL
);

-- ユーザープロファイルのインデックス
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles (user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_by ON user_profiles (created_by);

-- 生成メニューのインデックス
CREATE INDEX IF NOT EXISTS idx_generated_menus_user_id ON generated_menus (user_id);
CREATE INDEX IF NOT EXISTS idx_generated_menus_target_date ON generated_menus (target_date);
CREATE INDEX IF NOT EXISTS idx_generated_menus_is_favorite ON generated_menus (is_favorite);
CREATE INDEX IF NOT EXISTS idx_generated_menus_created_by ON generated_menus (created_by);

-- 自動更新日時用の関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ユーザープロファイルの更新日時トリガー
CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- メニューの更新日時トリガー
CREATE TRIGGER update_generated_menus_updated_at
BEFORE UPDATE ON generated_menus
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- RLSの設定: デフォルトで全てのアクセスを拒否
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_menus ENABLE ROW LEVEL SECURITY;

-- ユーザープロファイル用RLSポリシー
CREATE POLICY "ユーザーは自分のプロファイルのみ閲覧可能" 
  ON user_profiles FOR SELECT 
  USING (auth.uid() = user_id OR created_by = auth.jwt()->>'email');

CREATE POLICY "ユーザーは自分のプロファイルのみ作成可能" 
  ON user_profiles FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR created_by = auth.jwt()->>'email');

CREATE POLICY "ユーザーは自分のプロファイルのみ更新可能" 
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id OR created_by = auth.jwt()->>'email');

CREATE POLICY "ユーザーは自分のプロファイルのみ削除可能" 
  ON user_profiles FOR DELETE
  USING (auth.uid() = user_id OR created_by = auth.jwt()->>'email');

-- 生成メニュー用RLSポリシー
CREATE POLICY "ユーザーは自分のメニューのみ閲覧可能" 
  ON generated_menus FOR SELECT 
  USING (auth.uid() = user_id OR created_by = auth.jwt()->>'email');

CREATE POLICY "ユーザーは自分のメニューのみ作成可能" 
  ON generated_menus FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR created_by = auth.jwt()->>'email');

CREATE POLICY "ユーザーは自分のメニューのみ更新可能" 
  ON generated_menus FOR UPDATE
  USING (auth.uid() = user_id OR created_by = auth.jwt()->>'email');

CREATE POLICY "ユーザーは自分のメニューのみ削除可能" 
  ON generated_menus FOR DELETE
  USING (auth.uid() = user_id OR created_by = auth.jwt()->>'email');