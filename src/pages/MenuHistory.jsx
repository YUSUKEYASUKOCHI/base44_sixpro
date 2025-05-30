import React, { useState, useEffect } from "react";
import { GeneratedMenu } from "@/api/mock";
import Auth from "@/api/auth";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Calendar, BarChart3, ChefHat, Loader2 } from "lucide-react";
import { format } from "date-fns";
import AuthRequired from "../components/auth/AuthRequired";

export default function MenuHistory() {
  const [menus, setMenus] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [currentUserForPage, setCurrentUserForPage] = useState(null);

  useEffect(() => {
    const fetchCurrentUserAndMenus = async () => {
      setIsLoading(true);
      try {
        const user = await Auth.getCurrentUser();
        setCurrentUserForPage(user);
        const data = await GeneratedMenu.filter({ created_by: user.email }, "-created_date");
        setMenus(data);
      } catch (error) {
        setCurrentUserForPage(null);
        setMenus([]); // Clear menus if user not logged in or error
        console.error("メニュー読み込みエラー:", error);
      }
      setIsLoading(false);
    };
    fetchCurrentUserAndMenus();
  }, []);


  const filteredMenus = menus.filter(menu => {
    if (activeTab === "favorites") return menu.is_favorite;
    return true;
  });

  const totalMenus = menus.length;
  const favoriteMenus = menus.filter(menu => menu.is_favorite).length;
  const averageCalories = menus.length > 0 
    ? Math.round(menus.reduce((sum, menu) => sum + (menu.total_calories || 0), 0) / menus.length)
    : 0;

  const toggleFavorite = async (menuToUpdate) => {
    if (!currentUserForPage) return;
    const updatedIsFavorite = !menuToUpdate.is_favorite;
    try {
      await GeneratedMenu.update(menuToUpdate.id, { is_favorite: updatedIsFavorite });
      // Update local state
      setMenus(prevMenus => 
        prevMenus.map(m => 
          m.id === menuToUpdate.id ? { ...m, is_favorite: updatedIsFavorite } : m
        )
      );
      if (selectedMenu && selectedMenu.id === menuToUpdate.id) {
        setSelectedMenu(prev => ({ ...prev, is_favorite: updatedIsFavorite }));
      }
    } catch (error) {
      console.error("お気に入り更新エラー:", error);
    }
  };
  
  return (
    <AuthRequired>
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              メニュー履歴・管理
            </h1>
            <p className="text-gray-600 text-lg">
              過去に生成したメニューの確認と管理ができます
            </p>
          </motion.div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-main" />
            </div>
          ) : (
            <>
              {/* 統計カード */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="glass-effect border-0 shadow-lg">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">総メニュー数</CardTitle>
                      <ChefHat className="w-6 h-6 text-primary-main" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary-main">{totalMenus}</div>
                    <p className="text-sm text-gray-600 mt-1">生成したメニュー</p>
                  </CardContent>
                </Card>

                <Card className="glass-effect border-0 shadow-lg">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">お気に入り</CardTitle>
                      <Heart className="w-6 h-6 text-red-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-red-600">{favoriteMenus}</div>
                    <p className="text-sm text-gray-600 mt-1">保存済み</p>
                  </CardContent>
                </Card>

                <Card className="glass-effect border-0 shadow-lg">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">平均カロリー</CardTitle>
                      <BarChart3 className="w-6 h-6 text-orange-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-orange-600">{averageCalories}</div>
                    <p className="text-sm text-gray-600 mt-1">kcal</p>
                  </CardContent>
                </Card>
              </div>

              {/* メニューリスト */}
              <Card className="glass-effect border-0 shadow-xl">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <CardTitle className="text-xl">保存済みメニュー</CardTitle>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
                      <TabsList className="grid w-full grid-cols-2 sm:w-auto">
                        <TabsTrigger value="all">すべて</TabsTrigger>
                        <TabsTrigger value="favorites">お気に入り</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </CardHeader>
                <CardContent>
                  {filteredMenus.length === 0 ? (
                    <div className="text-center py-12">
                      <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">
                        {activeTab === "favorites" ? "お気に入りのメニューがありません" : "まだメニューが生成されていません"}
                      </p>
                      <p className="text-gray-400 mt-2">
                        メニュー生成ページでAIメニューを作成してみましょう
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <AnimatePresence>
                        {filteredMenus.map((menu) => (
                          <motion.div
                            key={menu.id}
                            layout // Enable layout animations
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
                            className="cursor-pointer"
                          >
                            <Card 
                              className="border border-gray-200 hover:border-primary-light transition-all duration-300 h-full flex flex-col"
                              onClick={() => setSelectedMenu(menu)}
                            >
                              <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="font-semibold text-lg line-clamp-2 text-gray-800">{menu.title}</h3>
                                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                                      <Calendar className="w-4 h-4" />
                                      {format(new Date(menu.target_date), "yyyy年MM月dd日")}
                                    </div>
                                  </div>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={(e) => { e.stopPropagation(); toggleFavorite(menu); }}
                                    className="text-gray-400 hover:text-red-500"
                                  >
                                    <Heart className={`w-5 h-5 ${menu.is_favorite ? "text-red-500 fill-current" : ""}`} />
                                  </Button>
                                </div>
                              </CardHeader>
                              <CardContent className="pt-0 flex-grow">
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                  <div className="flex justify-between"><span className="text-gray-500">ｶﾛﾘｰ</span><span className="font-medium text-gray-700">{menu.total_calories}kcal</span></div>
                                  <div className="flex justify-between"><span className="text-gray-500">ﾀﾝﾊﾟｸ質</span><span className="font-medium text-gray-700">{menu.total_protein}g</span></div>
                                  <div className="flex justify-between"><span className="text-gray-500">炭水化物</span><span className="font-medium text-gray-700">{menu.total_carbs}g</span></div>
                                  <div className="flex justify-between"><span className="text-gray-500">脂質</span><span className="font-medium text-gray-700">{menu.total_fat}g</span></div>
                                </div>
                                <div className="mt-4">
                                  <Badge variant="secondary" className="bg-primary-main/10 text-primary-dark">
                                    {menu.meals?.length || 0}食分
                                  </Badge>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {/* メニュー詳細モーダル */}
          <AnimatePresence>
            {selectedMenu && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
                onClick={() => setSelectedMenu(null)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-6 md:p-8">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">{selectedMenu.title}</h2>
                        <p className="text-gray-600 mt-1">
                          {format(new Date(selectedMenu.target_date), "yyyy年MM月dd日")}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedMenu(null)}
                        className="text-gray-400 hover:text-gray-600 rounded-full -mr-2 -mt-2"
                      >
                        ✕
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      {[
                        { label: "総カロリー", value: selectedMenu.total_calories, unit: "kcal", color: "text-green-600" },
                        { label: "タンパク質", value: selectedMenu.total_protein, unit: "g", color: "text-blue-600" },
                        { label: "炭水化物", value: selectedMenu.total_carbs, unit: "g", color: "text-orange-600" },
                        { label: "脂質", value: selectedMenu.total_fat, unit: "g", color: "text-red-600" },
                      ].map(item => (
                        <div key={item.label} className="text-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                          <div className={`text-xl font-bold ${item.color}`}>{item.value}{item.unit}</div>
                          <div className="text-sm text-gray-500 mt-1">{item.label}</div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4">
                      {selectedMenu.meals?.map((meal, index) => (
                        <Card key={index} className="border border-gray-200">
                          <CardHeader className="pb-3 bg-gray-50 rounded-t-lg">
                            <CardTitle className="text-lg text-primary-dark">
                              {meal.meal_type === 'breakfast' && '☀️ 朝食'}
                              {meal.meal_type === 'lunch' && '🌞 昼食'}
                              {meal.meal_type === 'dinner' && '🌙 夕食'}
                              {meal.meal_type === 'snack' && '🍎 間食'}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pt-4">
                            <div className="space-y-3">
                              {meal.dishes?.map((dish, dishIndex) => (
                                <div key={dishIndex} className="p-3 bg-white border border-gray-100 rounded-lg">
                                  <h4 className="font-medium text-gray-800">{dish.name}</h4>
                                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-600">
                                    <span>🔥 {dish.calories}kcal</span>
                                    <span>🥩 {dish.protein}g</span>
                                    <span>🍞 {dish.carbs}g</span>
                                    <span>🧈 {dish.fat}g</span>
                                  </div>
                                  {dish.ingredients && dish.ingredients.length > 0 && (
                                    <div className="mt-2">
                                      <p className="text-xs text-gray-500">材料: {dish.ingredients.join(', ')}</p>
                                    </div>
                                  )}
                                  {dish.recipe && (
                                     <p className="text-xs text-gray-500 mt-1 whitespace-pre-line">レシピ: {dish.recipe}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AuthRequired>
  );
}