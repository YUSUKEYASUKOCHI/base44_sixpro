import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function AuthRequired({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      setIsLoading(true);
      try {
        const user = await User.me();
        setCurrentUser(user);
      } catch (error) {
        setCurrentUser(null);
        console.info("User not logged in.");
      } finally {
        setIsLoading(false);
      }
    };
    checkUser();
  }, []);

  const handleLogin = async () => {
    await User.login();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-8">
        <Loader2 className="w-12 h-12 animate-spin text-primary-main mb-6" />
        <p className="text-lg text-gray-600">認証情報を確認しています...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-8 bg-gradient-to-br from-neutral-50 to-white rounded-xl shadow-lg m-4 md:m-8"
      >
        <img 
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/ee265bd28_95.png" 
          alt="NutriAI ロゴ" 
          className="w-20 h-20 object-contain mb-8"
        />
        <h2 className="text-3xl font-bold text-gray-800 mb-4">NutriAIへようこそ</h2>
        <p className="text-gray-600 mb-8 max-w-md">
          あなたの健康的な食生活をサポートします。続けるにはログインしてください。
        </p>
        <Button 
          onClick={handleLogin} 
          className="px-8 py-3 text-lg primary-gradient text-white rounded-xl shadow-md hover:shadow-lg transition-shadow flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path><path fill="none" d="M0 0h48v48H0z"></path></svg>
          Googleで続ける
        </Button>
      </motion.div>
    );
  }

  // 認証済みの場合、決済チェックをスキップして子コンポーネント（実際のページコンテンツ）を表示
  return children;
}