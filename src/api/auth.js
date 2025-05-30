import supabase from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

// ユーザー認証関連の関数
export const Auth = {
  // 現在のユーザー情報を取得
  getCurrentUser: async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    } catch (error) {
      console.error('認証エラー:', error.message);
      return null;
    }
  },
  
  // メールアドレスとパスワードでサインアップ
  signUp: async (email, password, metadata = {}) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        }
      });
      
      if (error) throw error;
      
      // 確認メールが送信されたことをユーザーに知らせる
      toast({
        title: "確認メールを送信しました",
        description: "メールをご確認いただき、記載されたリンクをクリックして登録を完了してください。",
      });
      
      return data;
    } catch (error) {
      console.error('サインアップエラー:', error.message);
      toast({
        variant: "destructive",
        title: "サインアップに失敗しました",
        description: error.message,
      });
      throw error;
    }
  },
  
  // メールアドレスとパスワードでログイン
  signInWithPassword: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('ログインエラー:', error.message);
      toast({
        variant: "destructive",
        title: "ログインに失敗しました",
        description: error.message,
      });
      throw error;
    }
  },
  
  // パスワードリセットのメールを送信
  resetPassword: async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      toast({
        title: "パスワードリセットメールを送信しました",
        description: "メールをご確認いただき、記載されたリンクからパスワードをリセットしてください。",
      });
      
      return true;
    } catch (error) {
      console.error('パスワードリセットエラー:', error.message);
      toast({
        variant: "destructive",
        title: "パスワードリセットに失敗しました",
        description: error.message,
      });
      throw error;
    }
  },
  
  // 新しいパスワードを設定
  updatePassword: async (newPassword) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      toast({
        title: "パスワードを更新しました",
        description: "新しいパスワードでログインできます。",
      });
      
      return true;
    } catch (error) {
      console.error('パスワード更新エラー:', error.message);
      toast({
        variant: "destructive",
        title: "パスワード更新に失敗しました",
        description: error.message,
      });
      throw error;
    }
  },
  
  // ログアウト
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('ログアウトエラー:', error.message);
      throw error;
    }
  },
  
  // 認証状態の変更を監視
  onAuthStateChange: (callback) => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        callback(event, session);
      }
    );
    
    // 監視解除用の関数を返す
    return () => {
      subscription.unsubscribe();
    };
  }
};

export default Auth;