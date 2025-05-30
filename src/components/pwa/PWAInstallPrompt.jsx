import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, X, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // iOS判定
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // スタンドアロンモード判定
    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                     window.navigator.standalone === true;
    setIsStandalone(standalone);

    // PWAインストールイベントリスナー
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // 既にインストール済みかローカルストレージで確認
      const hasPromptedBefore = localStorage.getItem('pwa-install-prompted');
      if (!hasPromptedBefore && !standalone) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // iOSの場合、手動でプロンプト表示
    if (iOS && !standalone) {
      const hasPromptedBefore = localStorage.getItem('pwa-install-prompted-ios');
      if (!hasPromptedBefore) {
        setTimeout(() => setShowPrompt(true), 3000); // 3秒後に表示
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('PWA installed');
      }
      
      setDeferredPrompt(null);
      setShowPrompt(false);
      localStorage.setItem('pwa-install-prompted', 'true');
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    if (isIOS) {
      localStorage.setItem('pwa-install-prompted-ios', 'true');
    } else {
      localStorage.setItem('pwa-install-prompted', 'true');
    }
  };

  // スタンドアロンモードの場合は表示しない
  if (isStandalone) return null;

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm"
        >
          <Card className="glass-effect border-0 shadow-2xl">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">アプリをインストール</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      ホーム画面から簡単アクセス
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDismiss}
                  className="text-gray-400 hover:text-gray-600 -mt-2 -mr-2"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {isIOS ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-700">
                    Safariの共有ボタン <span className="inline-block">📤</span> をタップして
                    「ホーム画面に追加」を選択してください
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleDismiss}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      後で
                    </Button>
                    <Button
                      onClick={handleDismiss}
                      size="sm"
                      className="flex-1 primary-gradient text-white"
                    >
                      わかりました
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                    <span>✨ オフライン利用可能</span>
                    <span>⚡ 高速起動</span>
                    <span>📱 ネイティブ体験</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleDismiss}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      後で
                    </Button>
                    <Button
                      onClick={handleInstall}
                      size="sm"
                      className="flex-1 primary-gradient text-white"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      インストール
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}