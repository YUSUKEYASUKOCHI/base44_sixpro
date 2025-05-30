import React, { useState, useEffect } from "react";
import { UserProfile, GeneratedMenu } from "@/api/mock";
import Auth from "@/api/auth";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, AlertTriangle, Sparkles } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import AuthRequired from "../components/auth/AuthRequired";
import MenuGenerationForm from "../components/menu/MenuGenerationForm";
import GeneratedMenuDisplay from "../components/menu/GeneratedMenuDisplay";
import MenuGenerationModal from "../components/menu/MenuGenerationModal";
import { NutritionPlan } from "@/api/nutrition-plan";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import NutritionPlanCalendar from "@/components/menu/NutritionPlanCalendar";
import DayMenuDetail from "@/components/menu/DayMenuDetail";

export default function MenuGeneration() {
  const [profile, setProfile] = useState(null);
  const [generatedMenu, setGeneratedMenu] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [shoppingList, setShoppingList] = useState(null);
  const [currentUserForPage, setCurrentUserForPage] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [isGenerationModalOpen, setIsGenerationModalOpen] = useState(false);
  const [nutritionPlan, setNutritionPlan] = useState(null);
  const [selectedDayMenu, setSelectedDayMenu] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [activeTab, setActiveTab] = useState("daily"); // "daily" or "plan"

  useEffect(() => {
    const fetchCurrentUserAndProfile = async () => {
      setProfileLoading(true);
      try {
        const user = await Auth.getCurrentUser();
        setCurrentUserForPage(user);
        
        // プロフィール取得
        const profiles = await UserProfile.filter({ created_by: user.email });
        if (profiles.length > 0) {
          setProfile(profiles[0]);
        } else {
          setProfile(null);
        }
        
        // 栄養プラン取得
        const plan = await NutritionPlan.getUserPlan(user.id);
        if (plan) {
          setNutritionPlan(plan);
        }
      } catch (error) {
        setCurrentUserForPage(null);
        setProfile(null);
      }
      setProfileLoading(false);
    };
    
    fetchCurrentUserAndProfile();
  }, []);

  const generateMenu = async (formData) => {
    if (!currentUserForPage) {
      setError("メニュー生成にはログインが必要です。");
      return;
    }
    if (!profile) {
      setError("プロフィールが設定されていません。先にプロフィールを設定してください。");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setShoppingList(null);

    try {
      // 通常のメニュー生成（1日分）の場合
      if (activeTab === "daily") {
        // モックデータを使用
        const result = await import("@/api/mock").then(module => module.InvokeLLM());
        
        // モックデータと合わせてメニューデータを生成
        const menuData = {
          title: result.title || `${formData.target_date}の特別メニュー`,
          total_calories: result.total_calories || 0,
          total_protein: result.total_protein || 0,
          total_carbs: result.total_carbs || 0,
          total_fat: result.total_fat || 0,
          meals: result.meals || [],
          target_date: formData.target_date,
          created_by: currentUserForPage.email,
        };
        setGeneratedMenu(menuData);
      } 
      // 60日プラン生成の場合
      else if (activeTab === "plan") {
        // 60日間プランの生成
        const planOptions = {
          lifestyle: formData.lifestyle || 'standard',
          weightLossGoal: parseInt(formData.weight_loss_goal || 4), // 月4%減量をデフォルト
          startDate: formData.start_date || new Date().toISOString().split('T')[0]
        };
        
        const menus = await NutritionPlan.generate(currentUserForPage.id, profile, planOptions);
        
        // プランをステートに設定
        setNutritionPlan({
          userId: currentUserForPage.id,
          startDate: planOptions.startDate,
          endDate: new Date(new Date(planOptions.startDate).getTime() + 60*24*60*60*1000).toISOString().split('T')[0],
          menus
        });
        
        // 最初の日のメニューを選択
        if (menus.length > 0) {
          setSelectedDayMenu(menus[0]);
          setSelectedDate(new Date(menus[0].target_date));
        }
      }
    } catch (error) {
      console.error("メニュー生成エラー:", error);
      setError("メニューの生成に失敗しました。AIが予期せぬ形式で応答したか、システムエラーが発生した可能性があります。しばらくしてから再度お試しください。");
    }
    setIsGenerating(false);
  };

  const saveMenu = async (menuDataToSave) => {
    if (!currentUserForPage) {
      setError("メニュー保存にはログインが必要です。");
      return;
    }
    try {
      // Ensure created_by is set before saving
      const finalMenuData = { ...menuDataToSave, created_by: currentUserForPage.email };
      await GeneratedMenu.create(finalMenuData);
      setError(null); 
    } catch (error) {
      console.error("メニュー保存エラー:", error);
      setError("メニューの保存に失敗しました。");
    }
  };

  const handleDaySelect = (menu, date) => {
    setSelectedDayMenu(menu);
    setSelectedDate(date);
  };

  const handleGenerateShoppingList = (ingredients) => {
    setShoppingList(ingredients);
  };
  
  return (
    <AuthRequired>
      <div className="min-h-screen p-3 md:p-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 md:mb-8"
          >
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              AIメニュー生成
            </h1>
            <p className="text-gray-600 text-base md:text-lg">
              あなたのプロフィールに基づいて、最適な栄養メニューを自動生成します
            </p>
          </motion.div>

          {error && (
            <Alert variant="destructive" className="mb-4 md:mb-6 mx-2 md:mx-0">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}

          {profileLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-main" />
            </div>
          ) : !profile ? (
             <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12 md:py-16 glass-effect rounded-xl shadow-lg mx-2 md:mx-0"
            >
              <AlertTriangle className="w-12 md:w-16 h-12 md:h-16 text-orange-500 mx-auto mb-4 md:mb-6" />
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4 px-4">
                プロフィール設定が必要です
              </h2>
              <p className="text-gray-600 mb-6 md:mb-8 max-w-md mx-auto px-4 text-sm md:text-base">
                あなたに最適な栄養メニューを生成するために、まずプロフィールを設定してください。
              </p>
              <Link
                to={createPageUrl("ProfileSettings")}
                className="inline-flex items-center gap-2 primary-gradient text-white font-medium px-6 md:px-8 py-3 rounded-xl transition-all duration-300 text-sm md:text-base mobile-optimized"
              >
                プロフィールを設定する
              </Link>
            </motion.div>
          ) : (
            <div>
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="mb-6"
              >
                <TabsList className="grid w-full md:w-auto grid-cols-2 mb-4">
                  <TabsTrigger value="daily">1日メニュー</TabsTrigger>
                  <TabsTrigger value="plan">60日プラン</TabsTrigger>
                </TabsList>
                
                <TabsContent value="daily" className="mt-0">
                  <div className="text-center">
                    {/* 生成ボタン - クリックでモーダルを開く */}
                    {!generatedMenu && !isGenerating && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-8 md:mb-12 max-w-xl mx-auto px-4"
                      >
                        <div className="glass-effect rounded-xl p-6 md:p-8 text-center border border-gray-100 shadow-xl">
                          <Sparkles className="w-12 h-12 text-primary-main mx-auto mb-6" />
                          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                            新しいメニューを生成
                          </h2>
                          <p className="text-gray-600 mb-6">
                            AIがあなたに合わせた栄養バランスの取れたメニューを提案します。いくつかの質問に答えるだけで最適なメニューが作成されます。
                          </p>
                          <Button 
                            onClick={() => setIsGenerationModalOpen(true)}
                            className="primary-gradient text-white font-medium px-8 py-4 rounded-xl shadow-lg transition-all duration-300 text-base md:text-lg mobile-optimized"
                          >
                            <Sparkles className="w-5 h-5 mr-2" />
                            メニュー生成を開始
                          </Button>
                        </div>
                      </motion.div>
                    )}

                    {/* モーダル */}
                    <MenuGenerationModal 
                      open={isGenerationModalOpen} 
                      onOpenChange={setIsGenerationModalOpen}
                      onGenerate={generateMenu}
                      isGenerating={isGenerating}
                    />

                    {/* 生成中表示 */}
                    {isGenerating && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 md:mt-6"
                      >
                        <div className="glass-effect rounded-xl p-6 md:p-8 text-center relative overflow-hidden mx-2 md:mx-0">
                          {/* 背景のキラキラアニメーション */}
                          <div className="absolute inset-0 pointer-events-none">
                            {[...Array(15)].map((_, i) => ( // モバイルでは少し減らす
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0, x: Math.random() * 100, y: Math.random() * 100 }}
                                animate={{ 
                                  opacity: [0, 1, 0], 
                                  scale: [0, 1, 0],
                                  x: Math.random() * 250, // モバイル用に調整
                                  y: Math.random() * 150
                                }}
                                transition={{ 
                                  duration: 2 + Math.random() * 2,
                                  repeat: Infinity,
                                  delay: Math.random() * 2
                                }}
                                className="absolute w-1.5 h-1.5 md:w-2 md:h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
                                style={{
                                  boxShadow: '0 0 8px rgba(255, 215, 0, 0.8)'
                                }}
                              />
                            ))}
                          </div>

                          {/* メインアニメーション */}
                          <motion.div
                            animate={{ 
                              rotateY: [0, 360],
                              scale: [1, 1.1, 1]
                            }}
                            transition={{ 
                              rotateY: { duration: 3, repeat: Infinity, ease: "linear" },
                              scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                            }}
                            className="relative w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 md:mb-6"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-full opacity-20 blur-lg"></div>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                              className="relative w-full h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center"
                            >
                              <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </motion.div>
                          </motion.div>

                          {/* タイトル */}
                          <motion.h3
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-lg md:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3 md:mb-4"
                          >
                            ✨ AIシェフが特別メニューを調理中 ✨
                          </motion.h3>

                          {/* 動的メッセージ */}
                          <motion.div className="space-y-2 md:space-y-3">
                            {[
                              "🧑‍🍳 あなたの好みを分析中...",
                              "🥗 栄養バランスを計算中...",
                              "🌟 美味しい料理を選定中...",
                              "📝 レシピを準備中..."
                            ].map((message, index) => (
                              <motion.p
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: [0, 1, 0.7], x: 0 }}
                                transition={{ 
                                  delay: index * 1.5,
                                  duration: 1.5,
                                  repeat: Infinity,
                                  repeatDelay: 4.5
                                }}
                                className="text-gray-700 font-medium text-sm md:text-base"
                              >
                                {message}
                              </motion.p>
                            ))}
                          </motion.div>

                          {/* プログレスバー */}
                          <div className="mt-6 md:mt-8 w-full bg-gray-200 rounded-full h-2.5 md:h-3 overflow-hidden">
                            <motion.div
                              initial={{ width: "0%" }}
                              animate={{ width: "100%" }}
                              transition={{ duration: 8, ease: "easeInOut" }}
                              className="h-full bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 rounded-full relative"
                            >
                              <motion.div
                                animate={{ x: ["-100%", "100%"] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
                              />
                            </motion.div>
                          </div>

                          {/* エンカレッジメント */}
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 2 }}
                            className="mt-4 md:mt-6 text-xs md:text-sm text-gray-600"
                          >
                            <span className="inline-block animate-pulse">🎯</span>
                            <span className="ml-2">あと少しで完成です！</span>
                          </motion.div>
                        </div>
                      </motion.div>
                    )}

                    {/* 生成されたメニュー表示 */}
                    <AnimatePresence mode="wait">
                      {generatedMenu && !isGenerating && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9, y: 50 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                        >
                          {!isGenerationModalOpen && (
                            <div className="mb-6">
                              <Button 
                                onClick={() => setIsGenerationModalOpen(true)}
                                variant="outline"
                                className="border-primary-main text-primary-main hover:bg-primary-main/10"
                              >
                                <Sparkles className="w-4 h-4 mr-2" />
                                別のメニューを生成
                              </Button>
                            </div>
                          )}
                          <GeneratedMenuDisplay
                            menu={generatedMenu}
                            onSave={saveMenu}
                            onGenerateShoppingList={handleGenerateShoppingList}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </TabsContent>
                
                <TabsContent value="plan" className="mt-0">
                  <div className="mb-8">
                    {nutritionPlan ? (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <NutritionPlanCalendar 
                          nutritionPlan={nutritionPlan} 
                          onDaySelect={handleDaySelect}
                        />
                        
                        <DayMenuDetail
                          menu={selectedDayMenu}
                          date={selectedDate}
                          onGenerateShoppingList={handleGenerateShoppingList}
                        />
                      </div>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-8 md:mb-12 max-w-xl mx-auto px-4"
                      >
                        <div className="glass-effect rounded-xl p-6 md:p-8 text-center border border-gray-100 shadow-xl">
                          <Sparkles className="w-12 h-12 text-primary-main mx-auto mb-6" />
                          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                            60日間の栄養プランを生成
                          </h2>
                          <p className="text-gray-600 mb-6">
                            あなたの目標達成を確実にサポートする、60日間の完全栄養プランをAIが生成します。全ての食事メニューが事前に計画されるので、「何を食べるか」悩む必要はありません。
                          </p>
                          <Button 
                            onClick={() => setIsGenerationModalOpen(true)}
                            className="primary-gradient text-white font-medium px-8 py-4 rounded-xl shadow-lg transition-all duration-300 text-base md:text-lg mobile-optimized"
                          >
                            <Sparkles className="w-5 h-5 mr-2" />
                            60日プランを生成
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              {shoppingList && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 md:mt-6 glass-effect rounded-xl p-4 md:p-6 mx-2 md:mx-0"
                >
                  <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">買い物リスト</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {shoppingList.map((ingredient, index) => (
                      <motion.div 
                        key={index} 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <span className="text-primary-main">✓</span>
                        <span className="text-gray-800 text-sm md:text-base">{ingredient}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>
    </AuthRequired>
  );
}