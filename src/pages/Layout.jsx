import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User as UserIcon, ChefHat, History, BarChart3, Settings, LogIn, LogOut, Loader2, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import PWAInstallPrompt from "@/components/pwa/PWAInstallPrompt";
import PWAUpdateNotification from "@/components/pwa/PWAUpdateNotification";
import supabase from "@/lib/supabase";
import AuthDialog from "@/components/auth/AuthDialog";

const navigationItems = [
  {
    title: "メニュー生成",
    url: createPageUrl("MenuGeneration"),
    icon: ChefHat,
    requiresAuth: true,
  },
  {
    title: "履歴・管理",
    url: createPageUrl("MenuHistory"),
    icon: History,
    requiresAuth: true,
  },
  {
    title: "栄養分析",
    url: createPageUrl("NutritionAnalysis"),
    icon: BarChart3,
    requiresAuth: true,
  },
  {
    title: "プロフィール設定",
    url: createPageUrl("ProfileSettings"),
    icon: Settings,
    requiresAuth: true,
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      setIsAuthLoading(true);
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        setCurrentUser(user);
      } catch (error) {
        setCurrentUser(null);
        console.info("User not logged in or session expired.");
      }
      setIsAuthLoading(false);
    };
    fetchUser();

    // 認証状態の変更を監視 - トースト通知なし
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setCurrentUser(session.user);
        } else if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
          navigate('/');
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, [location.key, navigate]);

  // PWA関連のheadタグを動的に追加
  useEffect(() => {
    // マニフェストリンク
    const manifestLink = document.createElement('link');
    manifestLink.rel = 'manifest';
    manifestLink.href = '/manifest.json';
    document.head.appendChild(manifestLink);

    // テーマカラー
    const themeColorMeta = document.createElement('meta');
    themeColorMeta.name = 'theme-color';
    themeColorMeta.content = '#183041';
    document.head.appendChild(themeColorMeta);

    // Apple用メタタグ
    const appleCapableMeta = document.createElement('meta');
    appleCapableMeta.name = 'apple-mobile-web-app-capable';
    appleCapableMeta.content = 'yes';
    document.head.appendChild(appleCapableMeta);

    const appleStatusMeta = document.createElement('meta');
    appleStatusMeta.name = 'apple-mobile-web-app-status-bar-style';
    appleStatusMeta.content = 'black-translucent';
    document.head.appendChild(appleStatusMeta);

    const appleTitleMeta = document.createElement('meta');
    appleTitleMeta.name = 'apple-mobile-web-app-title';
    appleTitleMeta.content = 'NutriAI';
    document.head.appendChild(appleTitleMeta);

    // Apple Touch Icon
    const appleTouchIcon = document.createElement('link');
    appleTouchIcon.rel = 'apple-touch-icon';
    appleTouchIcon.href = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/ee265bd28_95.png';
    document.head.appendChild(appleTouchIcon);

    // スプラッシュスクリーン用 (これは通常、さまざまな解像度で複数のエントリを持つべきですが、ここでは例として1つだけ追加します)
    const appleSplashLink = document.createElement('link');
    appleSplashLink.rel = 'apple-touch-startup-image';
    appleSplashLink.href = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/ee265bd28_95.png'; // 実際の画像パスとサイズに合わせる
    document.head.appendChild(appleSplashLink);

    return () => {
      // クリーンアップ
      document.head.removeChild(manifestLink);
      document.head.removeChild(themeColorMeta);
      document.head.removeChild(appleCapableMeta);
      document.head.removeChild(appleStatusMeta);
      document.head.removeChild(appleTitleMeta);
      document.head.removeChild(appleTouchIcon);
      document.head.removeChild(appleSplashLink);
    };
  }, []);

  const handleLogin = () => {
    setAuthDialogOpen(true);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  
  const visibleNavigationItems = navigationItems.filter(item => !item.requiresAuth || currentUser);

  return (
    <>
      <style>{`
        :root {
          --primary-main: #183041;
          --primary-light: #2D4A5C;
          --primary-dark: #0F1F28;
          --primary-green: #10B981;
          --primary-orange: #F59E0B;
          --neutral-50: #F9FAFB;
          --neutral-100: #F3F4F6;
          --neutral-200: #E5E7EB;
          --neutral-800: #1F2937;
          --neutral-900: #111827;
        }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: linear-gradient(135deg, var(--neutral-50) 0%, #FFFFFF 100%);
        }
        
        .glass-effect {
          backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .primary-gradient {
          background: linear-gradient(90deg, var(--primary-main) 0%, var(--primary-light) 100%);
        }

        .mobile-safe-area {
          padding-bottom: env(safe-area-inset-bottom);
        }

        @media (max-width: 768px) {
          .mobile-optimized {
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
          }
        }

        /* スプラッシュスクリーン用のスタイル */
        @media (display-mode: standalone) {
          body {
            user-select: none;
            -webkit-user-select: none;
          }
        }
      `}</style>
      
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-white">
        {/* PWA関連コンポーネント */}
        <PWAInstallPrompt />
        <PWAUpdateNotification />

        {/* 認証ダイアログ */}
        <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />

        {/* モバイル用ヘッダー */}
        <header className="md:hidden bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 py-3 sticky top-0 z-50 safe-area-inset-top">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors mobile-optimized"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6 text-gray-700" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-700" />
                )}
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm border">
                  <img 
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/ee265bd28_95.png" 
                    alt="NutriAI Logo" 
                    className="w-5 h-5 object-contain"
                  />
                </div>
                <h1 className="text-lg font-bold text-gray-900">NutriAI</h1>
              </div>
            </div>
            {isAuthLoading ? null : !currentUser && (
              <Button 
                onClick={handleLogin} 
                size="sm" 
                className="primary-gradient text-white text-sm px-4 py-2 mobile-optimized"
              >
                <LogIn className="w-4 h-4 mr-1" />
                ログイン
              </Button>
            )}
          </div>
        </header>

        {/* モバイル用サイドメニュー */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-black/50 z-40 top-[64px]"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <motion.div
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                className="bg-white h-full w-80 max-w-[85vw] shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg border">
                      <img 
                        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/ee265bd28_95.png" 
                        alt="NutriAI Logo" 
                        className="w-8 h-8 object-contain"
                      />
                    </div>
                    <div>
                      <h2 className="font-bold text-gray-900 text-xl">NutriAI</h2>
                      <p className="text-xs text-gray-500 font-medium">パーソナル栄養管理</p>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  {isAuthLoading ? (
                    <div className="flex justify-center items-center h-32">
                      <Loader2 className="w-6 h-6 animate-spin text-primary-main" />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
                        メインメニュー
                      </h3>
                      {visibleNavigationItems.map((item) => (
                        <Link
                          key={item.title}
                          to={item.url}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-4 py-4 rounded-xl transition-all duration-300 mobile-optimized ${
                            location.pathname === item.url 
                              ? 'primary-gradient text-white shadow-lg' 
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium text-base">{item.title}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {currentUser && (
                  <div className="mt-8 p-4 border-t border-gray-100">
                    <div className="p-4 rounded-xl glass-effect">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full flex items-center justify-center">
                          <UserIcon className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm truncate" title={currentUser.email}>
                            {currentUser.user_metadata?.full_name || currentUser.email}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLogout}
                            className="text-xs text-primary-main hover:text-primary-dark p-0 h-auto mt-1 mobile-optimized"
                          >
                            <LogOut className="w-3 h-3 mr-1" />
                            ログアウト
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* デスクトップ用サイドバー */}
        <div className="hidden md:flex flex-1">
          <div className="w-64 bg-gradient-to-b from-white to-gray-50 border-r border-gray-100 flex flex-col">
            <div className="border-b border-gray-100 p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg border">
                  <img 
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/ee265bd28_95.png" 
                    alt="NutriAI Logo" 
                    className="w-8 h-8 object-contain"
                  />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-xl">NutriAI</h2>
                  <p className="text-xs text-gray-500 font-medium">パーソナル栄養管理</p>
                </div>
              </div>
            </div>
            
            <div className="flex-1 p-4">
              {isAuthLoading ? (
                <div className="flex justify-center items-center h-32">
                  <Loader2 className="w-6 h-6 animate-spin text-primary-main" />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
                      メインメニュー
                    </h3>
                    {visibleNavigationItems.map((item) => (
                      <Link
                        key={item.title}
                        to={item.url}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                          location.pathname === item.url 
                            ? 'primary-gradient text-white shadow-lg' 
                            : 'text-gray-700 hover:bg-gray-100 hover:translate-x-1'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.title}</span>
                      </Link>
                    ))}
                  </div>

                  {currentUser && (
                    <div className="mt-8">
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
                        今日の目標
                      </h3>
                      <div className="px-3 py-4 space-y-3">
                        <div className="glass-effect rounded-lg p-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 font-medium">カロリー</span>
                            <span className="font-bold text-green-600">1,800 kcal</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full w-3/4"></div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-600">本日のメニュー</span>
                          <span className="ml-auto font-semibold text-orange-600">未生成</span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="border-t border-gray-100 p-4">
              <div className="p-3 rounded-xl glass-effect">
                {isAuthLoading ? (
                  <div className="flex justify-center items-center py-2">
                    <Loader2 className="w-5 h-5 animate-spin text-primary-main" />
                  </div>
                ) : currentUser ? (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full flex items-center justify-center">
                      <UserIcon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate" title={currentUser.email}>
                        {currentUser.user_metadata?.full_name || currentUser.email}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLogout}
                        className="text-xs text-primary-main hover:text-primary-dark p-0 h-auto"
                      >
                        <LogOut className="w-3 h-3 mr-1" />
                        ログアウト
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={handleLogin}
                    className="w-full primary-gradient text-white"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    ログイン
                  </Button>
                )}
              </div>
            </div>
          </div>

          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>

        {/* モバイル用メインコンテンツ */}
        <main className="md:hidden flex-1 overflow-auto mobile-safe-area">
          {children}
        </main>
      </div>
    </>
  );
}