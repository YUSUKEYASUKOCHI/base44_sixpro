
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Plus, User, Target, Activity } from "lucide-react";
import { motion } from "framer-motion";

const ACTIVITY_LEVELS = {
  sedentary: "座りがち（デスクワーク中心）",
  light: "軽い活動（週1-3回の軽い運動）", 
  moderate: "適度な活動（週3-5回の運動）",
  active: "活発（週6-7回の運動）",
  very_active: "非常に活発（1日2回の運動または肉体労働）"
};

const GOALS = {
  maintain: "現在の体重を維持",
  lose_weight: "体重を減らしたい",
  gain_weight: "体重を増やしたい", 
  muscle_gain: "筋肉をつけたい",
  health_improvement: "健康改善"
};

const COMMON_ALLERGIES = [
  "卵", "乳製品", "小麦", "そば", "えび", "かに", "ピーナッツ", "ナッツ類", "大豆", "魚"
];

const COMMON_RESTRICTIONS = [
  "ベジタリアン", "ヴィーガン", "グルテンフリー", "糖質制限", "塩分制限", "低脂肪"
];

const CUISINE_TYPES = [
  "和食", "洋食", "中華", "イタリアン", "フレンチ", "韓国料理", "タイ料理", "インド料理", "メキシカン"
];

export default function ProfileForm({ profile, onSave }) {
  const [formData, setFormData] = useState({
    age: "",
    gender: "",
    height: "",
    weight: "",
    activity_level: "",
    goal: "",
    allergies: [],
    dietary_restrictions: [],
    preferred_cuisine: [],
    disliked_foods: []
  });

  const [customInputs, setCustomInputs] = useState({
    allergy: "",
    restriction: "",
    cuisine: "",
    disliked: ""
  });

  useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addToArray = (field, value) => {
    if (value && !formData[field].includes(value)) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value]
      }));
    }
  };

  const removeFromArray = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter(item => item !== value)
    }));
  };

  const handleCustomAdd = (field, customField) => {
    const value = customInputs[customField];
    if (value.trim()) {
      addToArray(field, value.trim());
      setCustomInputs(prev => ({ ...prev, [customField]: "" }));
    }
  };

  const calculateBMI = () => {
    const height = parseFloat(formData.height);
    const weight = parseFloat(formData.weight);
    if (height && weight) {
      const bmi = weight / ((height / 100) ** 2);
      return bmi.toFixed(1);
    }
    return null;
  };

  const getBMICategory = (bmi) => {
    if (!bmi) return "";
    if (bmi < 18.5) return "低体重";
    if (bmi < 25) return "普通体重"; 
    if (bmi < 30) return "肥満（1度）";
    return "肥満（2度以上）";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const processedData = {
      ...formData,
      age: parseInt(formData.age),
      height: parseFloat(formData.height),
      weight: parseFloat(formData.weight)
    };
    onSave(processedData);
  };

  const bmi = calculateBMI();

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-8"
    >
      {/* 基本情報 */}
      <Card className="glass-effect border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <User className="w-6 h-6" style={{ color: '#183041' }} />
            基本情報
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="age" className="font-medium">年齢</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                placeholder="例: 25"
                required
                className="border-gray-200"
                style={{ '--tw-ring-color': '#183041' }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender" className="font-medium">性別</Label>
              <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                <SelectTrigger className="border-gray-200" style={{ '--tw-ring-color': '#183041' }}>
                  <SelectValue placeholder="選択してください" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">男性</SelectItem>
                  <SelectItem value="female">女性</SelectItem>
                  <SelectItem value="other">その他</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="height" className="font-medium">身長 (cm)</Label>
              <Input
                id="height"
                type="number"
                value={formData.height}
                onChange={(e) => handleInputChange('height', e.target.value)}
                placeholder="例: 170"
                required
                className="border-gray-200"
                style={{ '--tw-ring-color': '#183041' }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight" className="font-medium">体重 (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={(e) => handleInputChange('weight', e.target.value)}
                placeholder="例: 65.5"
                required
                className="border-gray-200"
                style={{ '--tw-ring-color': '#183041' }}
              />
            </div>
          </div>
          
          {bmi && (
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700">BMI</span>
                <div className="text-right">
                  <span className="text-xl font-bold" style={{ color: '#183041' }}>{bmi}</span>
                  <span className="ml-2 text-sm text-gray-600">({getBMICategory(bmi)})</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 活動レベルと目標 */}
      <Card className="glass-effect border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Target className="w-6 h-6" style={{ color: '#183041' }} />
            目標設定
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="activity_level" className="font-medium">活動レベル</Label>
            <Select value={formData.activity_level} onValueChange={(value) => handleInputChange('activity_level', value)}>
              <SelectTrigger className="border-gray-200" style={{ '--tw-ring-color': '#183041' }}>
                <SelectValue placeholder="選択してください" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ACTIVITY_LEVELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="goal" className="font-medium">目標</Label>
            <Select value={formData.goal} onValueChange={(value) => handleInputChange('goal', value)}>
              <SelectTrigger className="border-gray-200" style={{ '--tw-ring-color': '#183041' }}>
                <SelectValue placeholder="選択してください" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(GOALS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 食事制限・アレルギー */}
      <Card className="glass-effect border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Activity className="w-6 h-6" style={{ color: '#183041' }} />
            食事制限・アレルギー
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* アレルギー */}
          <div className="space-y-3">
            <Label className="font-medium">アレルギー</Label>
            <div className="flex flex-wrap gap-2">
              {COMMON_ALLERGIES.map(allergy => (
                <Badge
                  key={allergy}
                  variant={formData.allergies.includes(allergy) ? "default" : "outline"}
                  className={`cursor-pointer transition-all ${
                    formData.allergies.includes(allergy) 
                      ? "bg-red-500 hover:bg-red-600" 
                      : "hover:bg-red-50 hover:border-red-300"
                  }`}
                  onClick={() => {
                    if (formData.allergies.includes(allergy)) {
                      removeFromArray('allergies', allergy);
                    } else {
                      addToArray('allergies', allergy);
                    }
                  }}
                >
                  {allergy}
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={customInputs.allergy}
                onChange={(e) => setCustomInputs(prev => ({ ...prev, allergy: e.target.value }))}
                placeholder="その他のアレルギーを追加"
                className="flex-1 border-gray-200"
                style={{ '--tw-ring-color': '#183041' }}
              />
              <Button
                type="button"
                onClick={() => handleCustomAdd('allergies', 'allergy')}
                size="icon"
                variant="outline"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {formData.allergies.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.allergies.map(allergy => (
                  <Badge key={allergy} variant="secondary" className="bg-red-100 text-red-800">
                    {allergy}
                    <X
                      className="w-3 h-3 ml-1 cursor-pointer"
                      onClick={() => removeFromArray('allergies', allergy)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* 食事制限 */}
          <div className="space-y-3">
            <Label className="font-medium">食事制限</Label>
            <div className="flex flex-wrap gap-2">
              {COMMON_RESTRICTIONS.map(restriction => (
                <Badge
                  key={restriction}
                  variant={formData.dietary_restrictions.includes(restriction) ? "default" : "outline"}
                  className={`cursor-pointer transition-all ${
                    formData.dietary_restrictions.includes(restriction)
                      ? "bg-blue-500 hover:bg-blue-600"
                      : "hover:bg-blue-50 hover:border-blue-300"
                  }`}
                  onClick={() => {
                    if (formData.dietary_restrictions.includes(restriction)) {
                      removeFromArray('dietary_restrictions', restriction);
                    } else {
                      addToArray('dietary_restrictions', restriction);
                    }
                  }}
                >
                  {restriction}
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={customInputs.restriction}
                onChange={(e) => setCustomInputs(prev => ({ ...prev, restriction: e.target.value }))}
                placeholder="その他の食事制限を追加"
                className="flex-1 border-gray-200"
                style={{ '--tw-ring-color': '#183041' }}
              />
              <Button
                type="button"
                onClick={() => handleCustomAdd('dietary_restrictions', 'restriction')}
                size="icon"
                variant="outline"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {formData.dietary_restrictions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.dietary_restrictions.map(restriction => (
                  <Badge key={restriction} variant="secondary" className="bg-blue-100 text-blue-800">
                    {restriction}
                    <X
                      className="w-3 h-3 ml-1 cursor-pointer"
                      onClick={() => removeFromArray('dietary_restrictions', restriction)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 好み */}
      <Card className="glass-effect border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">食事の好み</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 好みの料理ジャンル */}
          <div className="space-y-3">
            <Label className="font-medium">好みの料理ジャンル</Label>
            <div className="flex flex-wrap gap-2">
              {CUISINE_TYPES.map(cuisine => (
                <Badge
                  key={cuisine}
                  variant={formData.preferred_cuisine.includes(cuisine) ? "default" : "outline"}
                  className={`cursor-pointer transition-all ${
                    formData.preferred_cuisine.includes(cuisine)
                      ? "bg-green-500 hover:bg-green-600"
                      : "hover:bg-green-50 hover:border-green-300"
                  }`}
                  onClick={() => {
                    if (formData.preferred_cuisine.includes(cuisine)) {
                      removeFromArray('preferred_cuisine', cuisine);
                    } else {
                      addToArray('preferred_cuisine', cuisine);
                    }
                  }}
                >
                  {cuisine}
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={customInputs.cuisine}
                onChange={(e) => setCustomInputs(prev => ({ ...prev, cuisine: e.target.value }))}
                placeholder="その他の料理ジャンルを追加"
                className="flex-1 border-gray-200"
                style={{ '--tw-ring-color': '#183041' }}
              />
              <Button
                type="button"
                onClick={() => handleCustomAdd('preferred_cuisine', 'cuisine')}
                size="icon"
                variant="outline"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* 苦手な食材 */}
          <div className="space-y-3">
            <Label className="font-medium">苦手な食材</Label>
            <div className="flex gap-2">
              <Input
                value={customInputs.disliked}
                onChange={(e) => setCustomInputs(prev => ({ ...prev, disliked: e.target.value }))}
                placeholder="例: きのこ、パクチー、レバー"
                className="flex-1 border-gray-200"
                style={{ '--tw-ring-color': '#183041' }}
              />
              <Button
                type="button"
                onClick={() => handleCustomAdd('disliked_foods', 'disliked')}
                size="icon"
                variant="outline"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {formData.disliked_foods.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.disliked_foods.map(food => (
                  <Badge key={food} variant="secondary" className="bg-gray-100 text-gray-800">
                    {food}
                    <X
                      className="w-3 h-3 ml-1 cursor-pointer"
                      onClick={() => removeFromArray('disliked_foods', food)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Button
        type="submit"
        className="w-full text-white font-medium py-3 rounded-xl shadow-lg transition-all duration-300
                   bg-[linear-gradient(to_right,#183041,#2D4A5C)] hover:bg-[linear-gradient(to_right,#0F1F28,#183041)]"
      >
        プロフィールを保存
      </Button>
    </motion.form>
  );
}
