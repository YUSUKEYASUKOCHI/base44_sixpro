import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Heart, Save, ShoppingCart, Clock, Users, ChefHat, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MEAL_TYPES = {
  breakfast: { label: "朝食", icon: "☀️", color: "text-yellow-600" },
  lunch: { label: "昼食", icon: "🌞", color: "text-orange-600" },
  dinner: { label: "夕食", icon: "🌙", color: "text-blue-600" },
  snack: { label: "間食", icon: "🍎", color: "text-green-600" }
};

export default function GeneratedMenuDisplay({ menu, onSave, onGenerateShoppingList }) {
  const [selectedMeal, setSelectedMeal] = useState("breakfast");
  const [expandedDish, setExpandedDish] = useState(null);

  const getMealsByType = (mealType) => {
    return menu.meals?.filter(meal => meal.meal_type === mealType) || [];
  };

  const calculateMealCalories = (mealType) => {
    const meals = getMealsByType(mealType);
    return meals.reduce((total, meal) => {
      return total + (meal.dishes?.reduce((dishTotal, dish) => dishTotal + (dish.calories || 0), 0) || 0);
    }, 0);
  };

  const generateShoppingList = () => {
    const allIngredients = [];
    menu.meals?.forEach(meal => {
      meal.dishes?.forEach(dish => {
        if (dish.ingredients) {
          allIngredients.push(...dish.ingredients);
        }
      });
    });
    
    const uniqueIngredients = [...new Set(allIngredients)];
    onGenerateShoppingList(uniqueIngredients);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 md:space-y-6"
    >
      {/* メニュー概要 */}
      <Card className="glass-effect border-0 shadow-xl overflow-hidden mx-2 md:mx-0">
        <div className="p-4 md:p-6 text-white" style={{ background: 'linear-gradient(to right, #183041, #2D4A5C)' }}>
          <h2 className="text-xl md:text-2xl font-bold mb-2">{menu.title}</h2>
          <p className="opacity-90 text-sm md:text-base">対象日: {new Date(menu.target_date).toLocaleDateString('ja-JP')}</p>
        </div>
        <CardContent className="p-4 md:p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <div className="text-center p-3 md:p-0">
              <div className="text-xl md:text-2xl font-bold" style={{ color: '#183041' }}>{menu.total_calories}</div>
              <div className="text-xs md:text-sm text-gray-600">総カロリー</div>
            </div>
            <div className="text-center p-3 md:p-0">
              <div className="text-xl md:text-2xl font-bold text-blue-600">{menu.total_protein}g</div>
              <div className="text-xs md:text-sm text-gray-600">タンパク質</div>
            </div>
            <div className="text-center p-3 md:p-0">
              <div className="text-xl md:text-2xl font-bold text-orange-600">{menu.total_carbs}g</div>
              <div className="text-xs md:text-sm text-gray-600">炭水化物</div>
            </div>
            <div className="text-center p-3 md:p-0">
              <div className="text-xl md:text-2xl font-bold text-red-600">{menu.total_fat}g</div>
              <div className="text-xs md:text-sm text-gray-600">脂質</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 食事タブ */}
      <Card className="glass-effect border-0 shadow-xl mx-2 md:mx-0">
        <CardHeader className="pb-3 md:pb-4">
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <ChefHat className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
            詳細メニュー
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedMeal} onValueChange={setSelectedMeal}>
            <TabsList className="grid w-full grid-cols-4 mb-4 md:mb-6 h-auto">
              {Object.entries(MEAL_TYPES).map(([key, meal]) => (
                <TabsTrigger 
                  key={key} 
                  value={key}
                  className="flex flex-col items-center gap-1 py-3 md:py-2 px-2 mobile-optimized"
                >
                  <span className="text-lg md:text-base">{meal.icon}</span>
                  <span className="text-xs md:text-sm font-medium">{meal.label}</span>
                  <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                    {calculateMealCalories(key)}kcal
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.keys(MEAL_TYPES).map(mealType => (
              <TabsContent key={mealType} value={mealType}>
                <AnimatePresence mode="wait">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-3 md:space-y-4"
                  >
                    {getMealsByType(mealType).map((meal, mealIndex) => (
                      <div key={mealIndex} className="space-y-2 md:space-y-3">
                        {meal.dishes?.map((dish, dishIndex) => (
                          <Card key={dishIndex} className="border border-gray-200 hover:border-green-300 transition-colors">
                            <CardHeader 
                              className="pb-2 md:pb-3 cursor-pointer mobile-optimized"
                              onClick={() => setExpandedDish(
                                expandedDish === `${mealType}-${mealIndex}-${dishIndex}` 
                                  ? null 
                                  : `${mealType}-${mealIndex}-${dishIndex}`
                              )}
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-base md:text-lg">{dish.name}</h4>
                                  <div className="flex flex-wrap gap-2 md:gap-4 mt-2 text-xs md:text-sm text-gray-600">
                                    <span>🔥 {dish.calories}kcal</span>
                                    <span>🥩 {dish.protein}g</span>
                                    <span>🍞 {dish.carbs}g</span>
                                    <span>🧈 {dish.fat}g</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 ml-2">
                                  <Badge variant="outline" className="shrink-0 text-xs">
                                    <Clock className="w-3 h-3 mr-1" />
                                    30分
                                  </Badge>
                                  {expandedDish === `${mealType}-${mealIndex}-${dishIndex}` ? (
                                    <ChevronUp className="w-5 h-5 text-gray-400" />
                                  ) : (
                                    <ChevronDown className="w-5 h-5 text-gray-400" />
                                  )}
                                </div>
                              </div>
                            </CardHeader>
                            
                            <AnimatePresence>
                              {expandedDish === `${mealType}-${mealIndex}-${dishIndex}` && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.3 }}
                                >
                                  <CardContent className="pt-0 px-4 md:px-6">
                                    <div className="space-y-3 md:space-y-4">
                                      <div>
                                        <h5 className="font-medium mb-2 text-sm md:text-base">材料</h5>
                                        <div className="flex flex-wrap gap-1.5 md:gap-2">
                                          {dish.ingredients?.map((ingredient, idx) => (
                                            <Badge key={idx} variant="secondary" className="bg-green-100 text-green-800 text-xs">
                                              {ingredient}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>
                                      
                                      {dish.recipe && (
                                        <div>
                                          <h5 className="font-medium mb-2 text-sm md:text-base">作り方</h5>
                                          <p className="text-gray-700 leading-relaxed whitespace-pre-line text-sm md:text-base">
                                            {dish.recipe}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </CardContent>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </Card>
                        ))}
                      </div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* アクションボタン */}
      <div className="flex flex-col gap-3 md:gap-4 px-2 md:px-0">
        <Button
          onClick={() => onSave(menu)}
          className="w-full text-white font-medium py-4 rounded-xl shadow-lg transition-all duration-300 text-base mobile-optimized"
          style={{ background: 'linear-gradient(to right, #183041, #2D4A5C)' }}
        >
          <Save className="w-5 h-5 mr-2" />
          メニューを保存
        </Button>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button
            onClick={generateShoppingList}
            variant="outline"
            className="font-medium py-4 rounded-xl transition-all duration-300 text-base mobile-optimized"
            style={{ borderColor: '#183041', color: '#183041' }}
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            買い物リスト生成
          </Button>
          
          <Button
            onClick={() => onSave({ ...menu, is_favorite: true })}
            variant="outline"
            className="border-red-500 text-red-700 hover:bg-red-50 font-medium py-4 rounded-xl transition-all duration-300 text-base mobile-optimized"
          >
            <Heart className="w-5 h-5 mr-2" />
            お気に入り登録
          </Button>
        </div>
      </div>
    </motion.div>
  );
}