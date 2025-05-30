import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { UserProfile } from "@/api/mock";
import Auth from "@/api/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Calendar, TrendingDown, Target, AlertTriangle, Check } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';
import { ja } from 'date-fns/locale';
import AuthRequired from "@/components/auth/AuthRequired";

// 体重記録データのモック
const MOCK_WEIGHT_DATA = [
  { date: format(subDays(new Date(), 59), 'yyyy-MM-dd'), weight: 75.2 },
  { date: format(subDays(new Date(), 52), 'yyyy-MM-dd'), weight: 74.8 },
  { date: format(subDays(new Date(), 45), 'yyyy-MM-dd'), weight: 74.3 },
  { date: format(subDays(new Date(), 38), 'yyyy-MM-dd'), weight: 73.9 },
  { date: format(subDays(new Date(), 31), 'yyyy-MM-dd'), weight: 73.2 },
  { date: format(subDays(new Date(), 24), 'yyyy-MM-dd'), weight: 72.7 },
  { date: format(subDays(new Date(), 17), 'yyyy-MM-dd'), weight: 72.1 },
  { date: format(subDays(new Date(), 10), 'yyyy-MM-dd'), weight: 71.6 },
  { date: format(subDays(new Date(), 3), 'yyyy-MM-dd'), weight: 71.0 },
];

export default function ProgressTracking() {
  const [profile, setProfile] = useState(null);
  const [weightData, setWeightData] = useState(MOCK_WEIGHT_DATA);
  const [newWeight, setNewWeight] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [currentUserForPage, setCurrentUserForPage] = useState(null);

  useEffect(() => {
    const fetchCurrentUserAndProfile = async () => {
      setIsLoading(true);
      try {
        const user = await Auth.getCurrentUser();
        setCurrentUserForPage(user);
        const profiles = await UserProfile.filter({ created_by: user.email });
        if (profiles.length > 0) {
          setProfile(profiles[0]);
        }
        // 実際のAPIから体重データを取得する処理をここに追加
      } catch (error) {
        setCurrentUserForPage(null);
        setProfile(null);
      }
      setIsLoading(false);
    };
    fetchCurrentUserAndProfile();
  }, []);

  // 最新の体重を取得
  const getLatestWeight = () => {
    return weightData.length > 0 
      ? weightData[weightData.length - 1].weight 
      : profile?.weight || 0;
  };

  // 初期体重を取得
  const getInitialWeight = () => {
    return weightData.length > 0 
      ? weightData[0].weight 
      : profile?.weight || 0;
  };

  // 総減量を計算
  const getTotalWeightLoss = () => {
    const initialWeight = getInitialWeight();
    const latestWeight = getLatestWeight();
    return initialWeight - latestWeight;
  };

  // 体重減少率を計算
  const getWeightLossPercentage = () => {
    const initialWeight = getInitialWeight();
    if (initialWeight === 0) return 0;
    return (getTotalWeightLoss() / initialWeight * 100).toFixed(1);
  };

  // 目標達成率を計算
  const getGoalProgress = () => {
    // 仮の目標: 初期体重から5%減
    const initialWeight = getInitialWeight();
    const targetWeight = initialWeight * 0.95;
    const latestWeight = getLatestWeight();
    
    const totalTargetLoss = initialWeight - targetWeight;
    const currentLoss = initialWeight - latestWeight;
    
    if (totalTargetLoss <= 0) return 100;
    const progress = (currentLoss / totalTargetLoss) * 100;
    return Math.min(Math.max(progress, 0), 100).toFixed(0);
  };

  // チャート用のデータフォーマット
  const formatChartData = () => {
    return weightData.map(record => ({
      date: format(new Date(record.date), 'M/d', { locale: ja }),
      weight: record.weight,
      originalDate: record.date // ソート用
    }));
  };

  // 新しい体重を記録
  const handleAddWeight = () => {
    if (!newWeight || isNaN(newWeight) || parseFloat(newWeight) <= 0) {
      setError('有効な体重を入力してください');
      return;
    }

    setIsSaving(true);
    setError(null);
    
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const newWeightValue = parseFloat(newWeight);
      
      // 既存のデータを更新（同じ日付の場合は置き換え）
      const existingIndex = weightData.findIndex(record => record.date === today);
      
      let updatedData;
      if (existingIndex >= 0) {
        updatedData = [...weightData];
        updatedData[existingIndex] = { date: today, weight: newWeightValue };
      } else {
        updatedData = [...weightData, { date: today, weight: newWeightValue }];
        // 日付でソート
        updatedData.sort((a, b) => new Date(a.date) - new Date(b.date));
      }
      
      setWeightData(updatedData);
      setNewWeight('');
      setSaveSuccess(true);
      
      // 成功メッセージを3秒後に消す
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      setError('体重の記録に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AuthRequired>
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 md:mb-8"
          >
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              進捗トラッキング
            </h1>
            <p className="text-gray-600 text-base md:text-lg">
              あなたの60日間プログラムの進捗状況を記録・確認できます
            </p>
          </motion.div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-main" />
            </div>
          ) : (
            <>
              {/* 体重記録フォーム */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <Card className="glass-effect border-0 shadow-lg lg:col-span-1">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Calendar className="w-5 h-5 text-primary-main" />
                      今日の体重を記録
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {error && (
                      <Alert variant="destructive" className="mb-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-sm">{error}</AlertDescription>
                      </Alert>
                    )}
                    
                    {saveSuccess && (
                      <Alert className="mb-4 bg-green-50 border-green-200 text-green-800">
                        <Check className="h-4 w-4 text-green-500" />
                        <AlertDescription className="text-sm">体重を記録しました</AlertDescription>
                      </Alert>
                    )}
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="weight" className="text-sm font-medium">体重 (kg)</Label>
                        <div className="flex mt-1.5">
                          <Input
                            id="weight"
                            type="number"
                            step="0.1"
                            min="0"
                            placeholder="例: 65.5"
                            value={newWeight}
                            onChange={(e) => setNewWeight(e.target.value)}
                            className="flex-1"
                          />
                          <Button 
                            onClick={handleAddWeight}
                            disabled={isSaving}
                            className="ml-2 primary-gradient text-white"
                          >
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : '記録'}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="py-3 px-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">今日の日付:</span>
                          <span className="font-semibold text-gray-800">
                            {format(new Date(), 'yyyy年MM月dd日 (E)', { locale: ja })}
                          </span>
                        </div>
                      </div>
                      
                      <div className="py-3 px-4 bg-green-50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-green-700 text-sm">最新の記録:</span>
                          <span className="font-bold text-green-800 text-lg">
                            {getLatestWeight()} kg
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 統計情報 */}
                <Card className="glass-effect border-0 shadow-lg lg:col-span-2">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <TrendingDown className="w-5 h-5 text-green-600" />
                      60日プログラム進捗
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <div className="text-sm text-blue-600 mb-1">開始時体重</div>
                        <div className="text-2xl font-bold text-blue-800">{getInitialWeight()} kg</div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                        <div className="text-sm text-green-600 mb-1">総減量</div>
                        <div className="text-2xl font-bold text-green-800">
                          {getTotalWeightLoss().toFixed(1)} kg
                          <span className="text-sm font-medium ml-1">({getWeightLossPercentage()}%)</span>
                        </div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                        <div className="text-sm text-purple-600 mb-1">目標達成率</div>
                        <div className="text-2xl font-bold text-purple-800">{getGoalProgress()}%</div>
                      </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg border border-gray-100 h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={formatChartData()}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="date" stroke="#666" />
                          <YAxis 
                            domain={['dataMin - 1', 'dataMax + 1']} 
                            stroke="#666"
                            width={40}
                          />
                          <Tooltip 
                            formatter={(value) => [`${value} kg`, '体重']}
                            contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: 'none', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="weight" 
                            stroke="#10B981" 
                            strokeWidth={3} 
                            dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, fill: '#059669' }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 目標設定セクション */}
              <Card className="glass-effect border-0 shadow-lg mb-8">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Target className="w-5 h-5 text-orange-600" />
                    あなたの60日間目標
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">目標体重:</span>
                        <span className="font-semibold text-gray-800">
                          {(getInitialWeight() * 0.95).toFixed(1)} kg
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">目標減量率:</span>
                        <span className="font-semibold text-gray-800">5%</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">プログラム期間:</span>
                        <span className="font-semibold text-gray-800">60日間</span>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg border border-blue-100">
                      <h3 className="text-primary-main font-medium mb-2">目標までの残り</h3>
                      <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold text-primary-main">
                          {Math.max(0, (getInitialWeight() * 0.95 - getLatestWeight()).toFixed(1))} kg
                        </span>
                        <div className="text-sm text-gray-600 mb-1">
                          ({100 - getGoalProgress()}%)
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-3">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-green-500 h-2.5 rounded-full"
                          style={{ width: `${getGoalProgress()}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* アドバイスセクション */}
              <Card className="glass-effect border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">AIアドバイス</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-gradient-to-r from-primary-main/5 to-primary-light/5 rounded-lg border border-primary-main/10">
                    <p className="text-gray-700 leading-relaxed">
                      現在の進捗は順調です。体重の減少ペースは健康的で、急激な変化がないため体に負担が少なく、リバウンドのリスクも低いでしょう。
                      <br /><br />
                      この調子で続けると、60日プログラムの完了時には目標体重に到達できる見込みです。水分摂取を十分に行い、メニューに沿った食事と適度な活動を継続してください。
                    </p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </AuthRequired>
  );
}