import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PWAUpdateNotification() {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [registration, setRegistration] = useState(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => {
          setRegistration(reg);
          
          // アップデート検知
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setShowUpdatePrompt(true);
                }
              });
            }
          });
        })
        .catch((error) => {
          console.log('Service worker registration failed:', error);
        });

      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }
  }, []);

  const handleUpdate = () => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    setShowUpdatePrompt(false);
  };

  const handleDismiss = () => {
    setShowUpdatePrompt(false);
  };

  return (
    <AnimatePresence>
      {showUpdatePrompt && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          className="fixed top-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm"
        >
          <Card className="glass-effect border-0 shadow-2xl">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <RefreshCw className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">アップデート利用可能</h3>
                    <p className="text-sm text-gray-600">
                      新しいバージョンが利用できます
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
                  onClick={handleUpdate}
                  size="sm"
                  className="flex-1 primary-gradient text-white"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  更新
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}