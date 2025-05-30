import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { format, addDays, subDays, startOfWeek, addWeeks, subWeeks } from 'date-fns';
import { ja } from 'date-fns/locale';

export default function NutritionPlanCalendar({ nutritionPlan, onDaySelect }) {
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedDate, setSelectedDate] = useState(null);

  // 週の日付を計算
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  // 次の週へ
  const nextWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  };

  // 前の週へ
  const prevWeek = () => {
    setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  };

  // 今日へ戻る
  const goToday = () => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
  };

  // 日付選択処理
  const handleDaySelect = (date) => {
    setSelectedDate(date);
    // 選択された日付のメニューを親コンポーネントに渡す
    if (onDaySelect) {
      const formattedDate = format(date, 'yyyy-MM-dd');
      const dayMenu = nutritionPlan?.menus?.find(menu => menu.target_date === formattedDate);
      onDaySelect(dayMenu, date);
    }
  };

  // 日のメニュー情報を取得
  const getDayMenu = (date) => {
    if (!nutritionPlan?.menus) return null;
    const formattedDate = format(date, 'yyyy-MM-dd');
    return nutritionPlan.menus.find(menu => menu.target_date === formattedDate);
  };

  // 曜日の日本語表記
  const getDayName = (date) => {
    return format(date, 'E', { locale: ja });
  };

  return (
    <Card className="glass-effect border-0 shadow-lg">
      <CardHeader className="pb-4 flex flex-row justify-between items-center">
        <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
          <CalendarIcon className="w-5 h-5 md:w-6 md:h-6 text-primary-main" />
          60日間プログラム
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 px-2"
            onClick={prevWeek}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 px-3 font-normal"
            onClick={goToday}
          >
            今日
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 px-2"
            onClick={nextWeek}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!nutritionPlan ? (
          <div className="text-center py-12">
            <Info className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">
              60日間の栄養プランを生成するとここに表示されます
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-7 gap-2 md:gap-3 mb-3 text-center">
              {weekDays.map((day) => (
                <div key={day.toString()} className="text-xs font-medium text-gray-500">
                  {getDayName(day)}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2 md:gap-3">
              {weekDays.map((day) => {
                const dayMenu = getDayMenu(day);
                const isToday = format(new Date(), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
                const isSelected = selectedDate && format(selectedDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
                const isPast = day < new Date() && !isToday;
                const hasMenu = !!dayMenu;

                return (
                  <motion.div 
                    key={day.toString()}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleDaySelect(day)}
                    className={`
                      cursor-pointer rounded-lg border transition-all duration-200 min-h-20 md:min-h-24
                      flex flex-col overflow-hidden
                      ${isSelected ? 'ring-2 ring-primary-main border-primary-main shadow-md' : 'border-gray-200'}
                      ${isToday ? 'bg-blue-50' : 'bg-white'}
                      ${isPast ? 'opacity-60' : ''}
                    `}
                  >
                    <div className={`
                      py-1 px-2 text-center text-xs
                      ${isToday ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}
                    `}>
                      {format(day, 'd日')}
                    </div>
                    
                    <div className="flex-1 p-1 md:p-2 flex flex-col justify-between">
                      {hasMenu ? (
                        <>
                          <div className="text-[10px] md:text-xs text-center line-clamp-2 font-medium text-gray-700">
                            {dayMenu.title}
                          </div>
                          <div className="text-[9px] text-center text-green-600 font-medium mt-auto">
                            {dayMenu.total_calories}kcal
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center justify-center h-full text-[10px] text-gray-400">
                          未設定
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}