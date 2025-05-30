import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion } from "framer-motion";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, AlertTriangle, CheckCircle } from "lucide-react";
import supabase from "@/lib/supabase";

const resetPasswordSchema = z.object({
  password: z.string().min(6, { message: 'パスワードは6文字以上で入力してください' }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "パスワードが一致しません",
  path: ["confirmPassword"],
});

export default function ResetPassword() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');

  const form = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    // URLからハッシュを取得してemailを抽出
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    setEmail(hashParams.get('email') || '');
    
    // Supabaseのセッションを確認
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          setError('セッションの取得に失敗しました。リンクが無効か期限切れの可能性があります。');
          return;
        }
        
        if (!data.session) {
          setError('ログインセッションが見つかりません。リンクが無効か期限切れの可能性があります。');
        }
      } catch (err) {
        setError('エラーが発生しました。もう一度お試しください。');
      }
    };
    
    checkSession();
  }, []);

  const onSubmit = async (formData) => {
    setIsLoading(true);
    setError('');
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.password
      });
      
      if (error) throw error;
      
      setSuccess(true);
      // 5秒後にホームページにリダイレクト
      setTimeout(() => {
        navigate('/');
      }, 5000);
    } catch (error) {
      setError(error.message || 'パスワードの更新に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg border">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/ee265bd28_95.png" 
              alt="NutriAI Logo" 
              className="w-10 h-10 object-contain"
            />
          </div>
        </div>
        
        <Card className="glass-effect border-0 shadow-xl p-6 md:p-8 rounded-2xl">
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6"
            >
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">パスワードを更新しました</h2>
              <p className="text-gray-600 mb-6">
                新しいパスワードでログインできるようになりました。5秒後にホームページに移動します。
              </p>
              <Button onClick={() => navigate('/')} className="primary-gradient text-white">
                ホームページへ移動
              </Button>
            </motion.div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">パスワードのリセット</h2>
              <p className="text-gray-600 mb-6 text-center">
                {email && `${email} の`}新しいパスワードを設定してください。
              </p>
              
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>新しいパスワード</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>パスワード（確認）</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="pt-2">
                    <Button type="submit" className="w-full primary-gradient text-white" disabled={isLoading}>
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      パスワードを更新
                    </Button>
                  </div>
                  
                  <div className="text-center">
                    <Button
                      variant="link"
                      onClick={() => navigate('/')}
                      className="text-gray-600"
                    >
                      キャンセルしてホームに戻る
                    </Button>
                  </div>
                </form>
              </Form>
            </>
          )}
        </Card>
      </motion.div>
    </div>
  );
}