import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import supabase from '@/lib/supabase';
import AuthDialog from './AuthDialog';

export default function AuthRequired({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      setIsLoading(true);
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        setCurrentUser(user);
      } catch (error) {
        setCurrentUser(null);
        console.info("User not logged in.");
      } finally {
        setIsLoading(false);
      }
    };
    
    // 初回チェック
    checkUser();
    
    // 認証状態の変更を監視（トースト通知は表示しない）
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setCurrentUser(session.user);
        } else if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
          navigate('/');
        }
      }
    );
    
    // クリーンアップ関数
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleOpenAuthDialog = () => {
    setAuthDialogOpen(true);
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
          alt="SIXPRO ロゴ" 
          className="w-20 h-20 object-contain mb-8"
        />
        <h2 className="text-3xl font-bold text-gray-800 mb-4">SIXPROへようこそ</h2>
        <p className="text-gray-600 mb-8 max-w-md">
          あなたの健康的な食生活をサポートします。続けるにはログインしてください。
        </p>
        <Button 
          onClick={handleOpenAuthDialog} 
          className="px-8 py-3 text-lg primary-gradient text-white rounded-xl shadow-md hover:shadow-lg transition-shadow"
        >
          ログイン / 新規登録
        </Button>
        
        {/* 認証ダイアログ */}
        <AuthDialog 
          open={authDialogOpen} 
          onOpenChange={setAuthDialogOpen} 
        />
      </motion.div>
    );
  }

  // 認証済みの場合は子コンポーネント（実際のページコンテンツ）を表示
  return children;
}