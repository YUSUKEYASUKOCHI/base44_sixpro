import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Sparkles, Clock, Target } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function MenuGenerationForm({ onGenerate, isGenerating }) {
  const [formData, setFormData] = useState({
    target_date: format(new Date(), "yyyy-MM-dd"),
    meal_count: "3",
    special_requests: "",
    calorie_adjustment: "0"
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onGenerate(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 md:space-y-6"
    >
      <Card className="glass-effect border-0 shadow-xl mx-2 md:mx-0">
        <CardHeader className="pb-3 md:pb-4">
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <Target className="w-5 h-5 md:w-6 md:h-6 text-orange-600" />
            メニュー生成設定
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <Label htmlFor="target_date" className="font-medium flex items-center gap-2 text-sm md:text-base">
                  <Calendar className="w-4 h-4" />
                  対象日
                </Label>
                <Input
                  id="target_date"
                  type="date"
                  value={formData.target_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, target_date: e.target.value }))}
                  className="border-gray-200 focus:border-green-500 h-12 md:h-10 text-base mobile-optimized"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="meal_count" className="font-medium flex items-center gap-2 text-sm md:text-base">
                  <Clock className="w-4 h-4" />
                  食事回数
                </Label>
                <Select 
                  value={formData.meal_count} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, meal_count: value }))}
                >
                  <SelectTrigger className="border-gray-200 focus:border-green-500 h-12 md:h-10 mobile-optimized">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2食（朝・昼 または 昼・夜）</SelectItem>
                    <SelectItem value="3">3食（朝・昼・夜）</SelectItem>
                    <SelectItem value="4">4食（3食 + 間食）</SelectItem>
                    <SelectItem value="5">5食（3食 + 2回間食）</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="calorie_adjustment" className="font-medium text-sm md:text-base">カロリー調整</Label>
                <Select 
                  value={formData.calorie_adjustment} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, calorie_adjustment: value }))}
                >
                  <SelectTrigger className="border-gray-200 focus:border-green-500 h-12 md:h-10 mobile-optimized">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-300">-300kcal（ダイエット強化）</SelectItem>
                    <SelectItem value="-150">-150kcal（軽いダイエット）</SelectItem>
                    <SelectItem value="0">標準（維持）</SelectItem>
                    <SelectItem value="150">+150kcal（軽い増量）</SelectItem>
                    <SelectItem value="300">+300kcal（増量）</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="special_requests" className="font-medium text-sm md:text-base">特別なリクエスト</Label>
              <Input
                id="special_requests"
                value={formData.special_requests}
                onChange={(e) => setFormData(prev => ({ ...prev, special_requests: e.target.value }))}
                placeholder="例: 今日は疲れているので簡単な料理がいい、旬の野菜を使いたい"
                className="border-gray-200 focus:border-green-500 h-12 md:h-10 text-base mobile-optimized"
              />
            </div>

            <Button
              type="submit"
              disabled={isGenerating}
              className="w-full text-white font-medium py-4 md:py-4 rounded-xl shadow-lg transition-all duration-300 disabled:opacity-50 text-base md:text-lg mobile-optimized"
              style={{ 
                background: 'linear-gradient(to right, #183041, #2D4A5C)',
              }}
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-5 h-5 mr-2 animate-pulse" />
                  AIがメニューを生成中...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  栄養メニューを生成
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}