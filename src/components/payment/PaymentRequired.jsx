import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Shield, Check, Loader2, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { createStripeCheckout } from "@/api/mock";

export default function PaymentRequired({ onPaymentComplete }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handlePayment = async () => {
    setIsProcessing(true);
    setError(null);
    console.log('PaymentRequired: handlePayment initiated.');

    try {
      console.log('PaymentRequired: Calling createStripeCheckout...');
      const backendResponse = await createStripeCheckout({
        amount: 50000 // 金額はここで固定。必要なら動的に変更
      });

      console.log('PaymentRequired: Raw response object from createStripeCheckout:', backendResponse);
      // backendResponse が null や undefined でないことを確認
      // Axiosのレスポンス形式を考慮し、backendResponse.dataをチェック
      if (backendResponse && backendResponse.data) {
        console.log('PaymentRequired: Parsed response from createStripeCheckout:', JSON.stringify(backendResponse.data, null, 2));

        if (backendResponse.data.success && backendResponse.data.checkout_url) {
          console.log('PaymentRequired: Success! Checkout URL found:', backendResponse.data.checkout_url);
          console.log('PaymentRequired: Attempting to redirect to Stripe Checkout URL at top level...');
          // トップレベルウィンドウでリダイレクト
          window.top.location.href = backendResponse.data.checkout_url;
          console.log('PaymentRequired: Top-level redirect initiated.');
          // リダイレクトが開始されたら、この後のコードは通常実行されない
          // 念のため、処理をここで終了
          return; 
        } else {
          // エラーの場合、詳細をログに出力
          const errorMsg = backendResponse.data.error || '不明なエラー';
          const errorDetails = backendResponse.data.details || '詳細情報なし';
          console.error(`PaymentRequired: Payment initiation failed. Success: ${backendResponse.data.success}, Checkout URL: ${backendResponse.data.checkout_url}, Error: ${errorMsg}, Details: ${errorDetails}`);
          setError(`決済の開始に失敗しました。理由: ${errorMsg} ${errorDetails !== '詳細情報なし' ? `(${errorDetails})` : ''}`);
        }
      } else {
        console.error('PaymentRequired: Received null, undefined, or malformed response from createStripeCheckout. Response:', backendResponse);
        setError('決済サーバーから有効な応答がありませんでした。');
      }

    } catch (catchError) {
      console.error('PaymentRequired: Exception during payment process (catch block):', catchError);
      let errorMessage = '決済処理中に予期せぬエラーが発生しました。';
      // catchErrorがErrorオブジェクトの場合、messageプロパティがある
      if (catchError && catchError.message) {
        errorMessage = `例外エラー: ${catchError.message}`;
      }
      // Axiosエラーの場合、response.dataを参照
      if (catchError.response && catchError.response.data && catchError.response.data.error) {
        errorMessage = `APIエラー: ${catchError.response.data.error}`;
        if (catchError.response.data.details) {
          errorMessage += ` (${catchError.response.data.details})`;
        }
      }
      setError(errorMessage);
    } finally {
        setIsProcessing(false);
        console.log('PaymentRequired: handlePayment finished (finally block).');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-8"
    >
      <Card className="max-w-2xl w-full glass-effect border-0 shadow-xl">
        <CardHeader className="text-center pb-6">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <CreditCard className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900 mb-4">
            SIXPRO プレミアムプラン
          </CardTitle>
          <p className="text-gray-600 text-lg">
            AIによるパーソナライズされた栄養管理を始めましょう
          </p>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {/* 料金情報 */}
          <div className="text-center py-8 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-100">
            <div className="text-5xl font-bold text-gray-900 mb-2">¥50,000</div>
            <div className="text-gray-600">一括払い（買い切り）</div>
          </div>

          {/* 機能一覧 */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 text-center mb-6">
              含まれる機能
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "AIパーソナライズメニュー生成",
                "栄養分析ダッシュボード",
                "無制限メニュー作成",
                "詳細な栄養素追跡",
                "買い物リスト自動生成",
                "レシピ詳細表示",
                "お気に入り機能",
                "履歴管理"
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* エラーメッセージ */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-800 font-medium">決済エラー</p>
                  <p className="text-red-700 text-sm mt-1">{error}</p>
                  <p className="text-red-600 text-xs mt-2">
                    問題が続く場合は、サポートまでお問い合わせください。
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 支払いボタン */}
          <div className="space-y-4">
            <Button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full py-4 text-lg font-semibold text-white rounded-xl shadow-lg transition-all duration-300"
              style={{ background: 'linear-gradient(to right, #183041, #2D4A5C)' }}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  決済処理中...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5 mr-2" />
                  今すぐ購入する
                </>
              )}
            </Button>
            
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Shield className="w-4 h-4" />
              <span>Stripeによる安全な決済</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}