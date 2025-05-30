import supabase from '@/lib/supabase';
import { GeneratedMenu } from './database';

// 栄養プラン関連の操作
export const NutritionPlan = {
  // 60日間の栄養プランを生成
  generate: async (userId, profileData, planOptions) => {
    try {
      // 今日の日付
      const today = new Date();
      
      // 60日間のメニュー配列
      const menus = [];
      
      // サンプルメニューを60日分生成（実際にはAIからの応答を使用）
      for (let i = 0; i < 60; i++) {
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + i);
        
        // 日付をYYYY-MM-DD形式に変換
        const formattedDate = targetDate.toISOString().split('T')[0];
        
        // サンプルメニュー（実際にはAIから生成される詳細なメニュー）
        const menuData = {
          title: `${i+1}日目のメニュー - ${planOptions.lifestyle} プラン`,
          target_date: formattedDate,
          total_calories: 1800 - Math.floor(Math.random() * 200), // ダイエット効果でわずかに減少
          meals: [
            {
              meal_type: 'breakfast',
              dishes: [
                {
                  name: `${i+1}日目の朝食`,
                  calories: 400 - Math.floor(Math.random() * 50),
                  ingredients: [
                    { name: '全粒粉パン', quantity: '2枚' },
                    { name: 'アボカド', quantity: '1/2個' },
                    { name: '卵', quantity: '1個' },
                    { name: 'ほうれん草', quantity: '30g' }
                  ],
                  recipe: '1. パンをトーストする\n2. 卵を茹でる\n3. アボカドをスライスする\n4. ほうれん草を軽く炒める\n5. パンの上に全ての具材をのせる'
                }
              ]
            },
            {
              meal_type: 'lunch',
              dishes: [
                {
                  name: `${i+1}日目の昼食`,
                  calories: 550 - Math.floor(Math.random() * 50),
                  ingredients: [
                    { name: '鶏むね肉', quantity: '100g' },
                    { name: '玄米', quantity: '150g' },
                    { name: 'ブロッコリー', quantity: '80g' },
                    { name: 'オリーブオイル', quantity: '小さじ1' }
                  ],
                  recipe: '1. 鶏むね肉を一口大に切り、塩コショウで下味をつける\n2. フライパンでオリーブオイルを熱し、鶏肉を焼く\n3. ブロッコリーを電子レンジで3分加熱する\n4. 玄米を炊く\n5. 全ての材料を盛り付ける'
                }
              ]
            },
            {
              meal_type: 'dinner',
              dishes: [
                {
                  name: `${i+1}日目の夕食`,
                  calories: 650 - Math.floor(Math.random() * 50),
                  ingredients: [
                    { name: '鮭', quantity: '1切れ' },
                    { name: 'キヌア', quantity: '50g' },
                    { name: 'アスパラガス', quantity: '6本' },
                    { name: 'レモン', quantity: '1/4個' },
                    { name: '塩', quantity: '少々' }
                  ],
                  recipe: '1. キヌアを洗い、水で20分煮る\n2. 鮭に塩をふり、オーブンで焼く\n3. アスパラガスを茹でる\n4. 全ての材料を盛り付け、レモンを絞る'
                }
              ]
            },
            {
              meal_type: 'snack',
              dishes: [
                {
                  name: `${i+1}日目のスナック`,
                  calories: 200 - Math.floor(Math.random() * 30),
                  ingredients: [
                    { name: 'ギリシャヨーグルト', quantity: '100g' },
                    { name: 'ベリーミックス', quantity: '50g' },
                    { name: 'チアシード', quantity: '小さじ1' }
                  ],
                  recipe: 'ヨーグルトにベリーとチアシードをトッピングする'
                }
              ]
            }
          ],
          created_by: userId
        };
        
        // メニューを配列に追加
        menus.push(menuData);
      }
      
      // 全てのメニューをデータベースに一度に保存（実際の実装では個別に処理する場合もある）
      return menus;
      
    } catch (error) {
      console.error('60日間プラン生成エラー:', error.message);
      throw error;
    }
  },
  
  // 特定のユーザーの栄養プラン取得（直近の60日間）
  getUserPlan: async (userId) => {
    try {
      // 今日の日付
      const today = new Date();
      
      // 60日後の日付
      const endDate = new Date();
      endDate.setDate(today.getDate() + 59);
      
      // 日付をYYYY-MM-DD形式に変換
      const formattedToday = today.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0];
      
      // この期間のメニューをデータベースから取得
      const { data, error } = await supabase
        .from('generated_menus')
        .select('*')
        .eq('user_id', userId)
        .gte('target_date', formattedToday)
        .lte('target_date', formattedEndDate)
        .order('target_date', { ascending: true });
      
      if (error) throw error;
      
      // メニューがある場合は栄養プランとして返す
      if (data && data.length > 0) {
        return {
          userId,
          startDate: formattedToday,
          endDate: formattedEndDate,
          menus: data
        };
      }
      
      return null; // プランがない場合はnullを返す
    } catch (error) {
      console.error('栄養プラン取得エラー:', error.message);
      return null;
    }
  }
};