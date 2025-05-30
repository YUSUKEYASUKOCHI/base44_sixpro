import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Calendar, ChevronDown, ChevronUp, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DayMenuDetail({ menu, date, onGenerateShoppingList }) {
  const [expandedMeal, setExpandedMeal] = React.useState(null);
  
  if (!menu) {
    return (
      <Card className="glass-effect border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="w-5 h-5 text-primary-main" />
            {date ? format(date, 'yyyy年MM月dd日 (E)', { locale: ja }) : '日付が選択されていません'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12">
          <p className="text-gray-500">この日のメニューは設定されていません。</p>
          <p className="text-gray-500 text-sm mt-2">カレンダーから日付を選択してください。</p>
        </CardContent>
      </Card>
    );
  }
  
  const MEAL_TYPES = {
    breakfast: { label: "朝食", icon: "☀️", color: "text-yellow-600" },
    lunch: { label: "昼食", icon: "🌞", color: "text-orange-600" },
    dinner: { label: "夕食", icon: "🌙", color: "text-blue-600" },
    snack: { label: "間食", icon: "🍎", color: "text-green-600" }
  };
  
  const toggleMeal = (mealType) => {
    setExpandedMeal(expandedMeal === mealType ? null : mealType);
  };
  
  const handleGenerateShoppingList = () => {
    if (onGenerateShoppingList) {
      const allIngredients = [];
      menu.meals?.forEach(meal => {
        meal.dishes?.forEach(dish => {
          if (dish.ingredients) {
            // 分量情報を含む形式に変換
            const ingredientsWithQuantity = dish.ingredients.map(ingredient => {
              // 既に分量がある場合はそのまま、ない場合は適量を追加
              if (typeof ingredient === 'object' && ingredient.name && ingredient.quantity) {
                return `${ingredient.name} ${ingredient.quantity}`;
              } else if (typeof ingredient === 'string' && ingredient.includes(' ')) {
                return ingredient; // 既に「材料名 分量」の形式の場合
              } else {
                return `${ingredient} 適量`;
              }
            });
            allIngredients.push(...ingredientsWithQuantity);
          }
        });
      });
      
      // 重複を削除して並べ替え
      const uniqueIngredients = [...new Set(allIngredients)].sort();
      onGenerateShoppingList(uniqueIngredients);
    }
  };
  
  return (
    <Card className="glass-effect border-0 shadow-lg">
      <CardHeader className="border-b pb-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="w-5 h-5 text-primary-main" />
            {date ? format(date, 'yyyy年MM月dd日 (E)', { locale: ja }) : '選択された日付'}
          </CardTitle>
          {menu.meals?.length > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs border-primary-main text-primary-main hover:bg-primary-main/10"
              onClick={handleGenerateShoppingList}
            >
              <ShoppingCart className="w-3.5 h-3.5 mr-1" />
              この日の買い物リスト
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <h3 className="font-medium text-lg mb-3">{menu.title}</h3>
        <div className="text-sm flex justify-between items-center mb-4 bg-gray-50 p-2 rounded-lg">
          <span className="text-gray-600">総カロリー</span>
          <span className="font-bold text-green-600">{menu.total_calories} kcal</span>
        </div>
        
        <div className="space-y-3">
          {menu.meals?.map((meal, mealIndex) => {
            const mealType = meal.meal_type;
            const mealInfo = MEAL_TYPES[mealType] || {
              label: mealType, icon: "🍽️", color: "text-gray-600" 
            };
            
            return (
              <div key={`${mealType}-${mealIndex}`} className="border rounded-lg overflow-hidden">
                <div 
                  className="flex justify-between items-center p-3 bg-gray-50 cursor-pointer"
                  onClick={() => toggleMeal(mealType)}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{mealInfo.icon}</span>
                    <h4 className={`font-medium ${mealInfo.color}`}>{mealInfo.label}</h4>
                  </div>
                  {expandedMeal === mealType ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </div>
                
                {expandedMeal === mealType && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="p-3 border-t"
                  >
                    {meal.dishes?.map((dish, dishIndex) => (
                      <div key={`${mealType}-dish-${dishIndex}`} className="mb-4 last:mb-0">
                        <h5 className="font-medium text-gray-800 mb-1">{dish.name}</h5>
                        <div className="text-xs text-gray-500 mb-2">🔥 {dish.calories}kcal</div>
                        
                        {dish.ingredients && dish.ingredients.length > 0 && (
                          <div className="mb-2">
                            <h6 className="text-xs font-medium text-gray-700 mb-1">材料:</h6>
                            <div className="flex flex-wrap gap-1.5">
                              {dish.ingredients.map((ingredient, idx) => {
                                // 材料の表示を処理（オブジェクト形式と文字列形式の両方に対応）
                                let displayText = '';
                                if (typeof ingredient === 'object' && ingredient.name && ingredient.quantity) {
                                  displayText = `${ingredient.name} ${ingredient.quantity}`;
                                } else if (typeof ingredient === 'string') {
                                  displayText = ingredient;
                                }
                                
                                return (
                                  <Badge key={idx} variant="secondary" className="bg-green-100 text-green-800 text-xs">
                                    {displayText}
                                  </Badge>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        
                        {dish.recipe && (
                          <div>
                            <h6 className="text-xs font-medium text-gray-700 mb-1">作り方:</h6>
                            <p className="text-xs text-gray-600 whitespace-pre-line">{dish.recipe}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}