import React, { useState, useEffect } from "react";
import { GeneratedMenu } from "@/api/entities";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';
import { TrendingUp, Calendar, Target, Award, Loader2 } from "lucide-react";
import { format, subDays, startOfDay } from "date-fns";
import AuthRequired from "../components/auth/AuthRequired";

const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#3B82F6']; // Primary Green, Primary Orange, Red, Blue

export default function NutritionAnalysis() {
  const [menus, setMenus] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7days'); // Default, can add UI to change later
  const [currentUserForPage, setCurrentUserForPage] = useState(null);

  useEffect(() => {
    const fetchCurrentUserAndMenus = async () => {
      setIsLoading(true);
      try {
        const user = await User.me();
        setCurrentUserForPage(user);
        const data = await GeneratedMenu.filter({ created_by: user.email }, "-target_date");
        setMenus(data);
      } catch (error) {
        setCurrentUserForPage(null);
        setMenus([]);
        console.error("栄養分析データ読み込みエラー:", error);
      }
      setIsLoading(false);
    };
    fetchCurrentUserAndMenus();
  }, []);


  const getFilteredMenus = () => {
    const now = new Date();
    let daysBack;
    switch (timeRange) {
      case '30days': daysBack = 30; break;
      case '90days': daysBack = 90; break;
      default: daysBack = 7; // 7days
    }
    const startDate = startOfDay(subDays(now, daysBack));
    
    return menus.filter(menu => {
      const menuDate = new Date(menu.target_date);
      return menuDate >= startDate;
    });
  };

  const filteredMenus = getFilteredMenus();

  const calculateAverageNutrition = () => {
    if (filteredMenus.length === 0) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    
    const totals = filteredMenus.reduce((acc, menu) => ({
      calories: acc.calories + (menu.total_calories || 0),
      protein: acc.protein + (menu.total_protein || 0),
      carbs: acc.carbs + (menu.total_carbs || 0),
      fat: acc.fat + (menu.total_fat || 0)
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    return {
      calories: Math.round(totals.calories / filteredMenus.length),
      protein: Math.round(totals.protein / filteredMenus.length),
      carbs: Math.round(totals.carbs / filteredMenus.length),
      fat: Math.round(totals.fat / filteredMenus.length)
    };
  };

  const getDailyTrendData = () => {
    // Group by date and average if multiple menus on same day
    const dailyDataMap = new Map();
    filteredMenus.forEach(menu => {
      const dateStr = format(new Date(menu.target_date), 'M/d');
      if (!dailyDataMap.has(dateStr)) {
        dailyDataMap.set(dateStr, { count: 0, calories: 0, protein: 0, carbs: 0, fat: 0, date: dateStr, originalDate: new Date(menu.target_date) });
      }
      const day = dailyDataMap.get(dateStr);
      day.count++;
      day.calories += menu.total_calories || 0;
      day.protein += menu.total_protein || 0;
      day.carbs += menu.total_carbs || 0;
      day.fat += menu.total_fat || 0;
    });

    return Array.from(dailyDataMap.values())
      .sort((a,b) => a.originalDate - b.originalDate) // Sort by actual date
      .map(day => ({
        date: day.date,
        calories: Math.round(day.calories / day.count),
        protein: Math.round(day.protein / day.count),
        carbs: Math.round(day.carbs / day.count),
        fat: Math.round(day.fat / day.count)
      }));
  };

  const getPFCData = () => {
    const avg = calculateAverageNutrition();
    if (avg.protein === 0 && avg.fat === 0 && avg.carbs === 0) {
        return [
            { name: 'データなし', value: 1, color: '#E5E7EB' } // Gray for no data
        ];
    }
    return [
      { name: 'タンパク質', value: avg.protein * 4, color: COLORS[0] }, // Green
      { name: '脂質', value: avg.fat * 9, color: COLORS[2] }, // Red
      { name: '炭水化物', value: avg.carbs * 4, color: COLORS[1] } // Orange
    ];
  };

  const getWeeklyComparison = () => {
    const weeks = [];
    for (let i = 0; i < 4; i++) { // Last 4 weeks
      const weekEnd = subDays(new Date(), i * 7);
      const weekStart = subDays(weekEnd, 6); // Get 7 days for the week
      
      const weekMenus = menus.filter(menu => {
        const menuDate = new Date(menu.target_date);
        return menuDate >= startOfDay(weekStart) && menuDate < startOfDay(subDays(weekEnd, -1)); // Inclusive start, exclusive end
      });

      if (weekMenus.length > 0) {
        const avgCalories = weekMenus.reduce((sum, menu) => sum + (menu.total_calories || 0), 0) / weekMenus.length;
        weeks.push({
          week: `${format(weekStart, 'M/d')} - ${format(weekEnd, 'M/d')}`,
          calories: Math.round(avgCalories),
        });
      } else {
         weeks.push({
          week: `${format(weekStart, 'M/d')} - ${format(weekEnd, 'M/d')}`,
          calories: 0,
        });
      }
    }
    return weeks.reverse(); // Show most recent week last or first, depends on preference
  };

  const averageNutrition = calculateAverageNutrition();
  const dailyTrendData = getDailyTrendData();
  const pfcData = getPFCData();
  const weeklyData = getWeeklyComparison();

  const targetCalories = 2000; // Placeholder, should come from user profile goal
  const achievementRate = targetCalories > 0 ? Math.round((averageNutrition.calories / targetCalories) * 100) : 0;

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
              栄養分析ダッシュボード
            </h1>
            <p className="text-gray-600 text-lg">
              あなたの栄養摂取状況を詳しく分析します
            </p>
          </motion.div>

          {isLoading ? (
             <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary-main" />
              </div>
          ) : filteredMenus.length === 0 ? (
            <Card className="glass-effect border-0 shadow-lg text-center py-16">
              <CardContent>
                <BarChart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">分析データがありません</h3>
                <p className="text-gray-500">
                  メニューを生成・保存すると、ここに栄養分析が表示されます。
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* サマリーカード */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="glass-effect border-0 shadow-lg">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between"><CardTitle className="text-sm text-gray-600">平均カロリー</CardTitle><TrendingUp className="w-5 h-5 text-green-600" /></div>
                  </CardHeader>
                  <CardContent><div className="text-2xl font-bold text-green-600">{averageNutrition.calories}</div><p className="text-xs text-gray-500 mt-1">kcal/日 ({filteredMenus.length}日平均)</p></CardContent>
                </Card>
                 <Card className="glass-effect border-0 shadow-lg">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between"><CardTitle className="text-sm text-gray-600">平均タンパク質</CardTitle><Target className="w-5 h-5 text-blue-600" /></div>
                  </CardHeader>
                  <CardContent><div className="text-2xl font-bold text-blue-600">{averageNutrition.protein}</div><p className="text-xs text-gray-500 mt-1">g/日</p></CardContent>
                </Card>
                <Card className="glass-effect border-0 shadow-lg">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between"><CardTitle className="text-sm text-gray-600">記録メニュー数</CardTitle><Calendar className="w-5 h-5 text-orange-600" /></div>
                  </CardHeader>
                  <CardContent><div className="text-2xl font-bold text-orange-600">{filteredMenus.length}</div><p className="text-xs text-gray-500 mt-1">直近{timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : 90}日間</p></CardContent>
                </Card>
                <Card className="glass-effect border-0 shadow-lg">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between"><CardTitle className="text-sm text-gray-600">目標達成率</CardTitle><Award className="w-5 h-5 text-purple-600" /></div>
                  </CardHeader>
                  <CardContent><div className="text-2xl font-bold text-purple-600">{achievementRate}%</div><p className="text-xs text-gray-500 mt-1">{targetCalories}kcal目標</p></CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* カロリートレンド */}
                <Card className="glass-effect border-0 shadow-xl">
                  <CardHeader><CardTitle className="text-xl">カロリートレンド (直近{dailyTrendData.length}日)</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={dailyTrendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="date" stroke="#666" />
                        <YAxis stroke="#666" domain={['dataMin - 100', 'dataMax + 100']} />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: 'none', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)'}}/>
                        <Line type="monotone" dataKey="calories" stroke={COLORS[0]} strokeWidth={3} dot={{ fill: COLORS[0], strokeWidth: 2, r: 4 }} name="カロリー(kcal)"/>
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* PFCバランス */}
                <Card className="glass-effect border-0 shadow-xl">
                  <CardHeader><CardTitle className="text-xl">PFCバランス (平均)</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie data={pfcData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={5} dataKey="value" labelLine={false}
                             label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                                const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                                const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                                return (
                                  <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize="12px" fontWeight="bold">
                                    {`${(percent * 100).toFixed(0)}%`}
                                  </text>
                                );
                              }}
                        >
                          {pfcData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                        </Pie>
                        <Tooltip formatter={(value, name) => [`${Math.round(value)}kcal (${((value / pfcData.reduce((sum,item) => sum + item.value, 0)) * 100).toFixed(1)}%)`, name]} contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: 'none', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)'}}/>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center flex-wrap gap-x-4 gap-y-2 mt-4">
                      {pfcData.map((item, index) => (item.name !== 'データなし' &&
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                          <span className="text-sm text-gray-600">{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 栄養素詳細 */}
              <Card className="glass-effect border-0 shadow-xl mb-8">
                <CardHeader><CardTitle className="text-xl">栄養素詳細トレンド (直近{dailyTrendData.length}日)</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={dailyTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: 'none', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)'}}/>
                      <Bar dataKey="protein" fill={COLORS[0]} name="タンパク質(g)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="carbs" fill={COLORS[1]} name="炭水化物(g)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="fat" fill={COLORS[2]} name="脂質(g)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              {weeklyData.length > 0 && weeklyData.some(d => d.calories > 0) && (
                <Card className="glass-effect border-0 shadow-xl">
                  <CardHeader><CardTitle className="text-xl">週別平均カロリー比較</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={weeklyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="week" stroke="#666" />
                        <YAxis stroke="#666" domain={[0, 'dataMax + 200']}/>
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: 'none', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)'}}/>
                        <Bar dataKey="calories" name="平均カロリー(kcal)" radius={[8, 8, 0, 0]}>
                           {weeklyData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.calories > 0 ? 'url(#colorGradientWeek)' : '#E5E7EB'} />
                          ))}
                        </Bar>
                        <defs>
                          <linearGradient id="colorGradientWeek" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={COLORS[3]} stopOpacity={0.8}/>
                            <stop offset="95%" stopColor={COLORS[3]} stopOpacity={0.3}/>
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </AuthRequired>
  );
}