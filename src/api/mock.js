import supabase from '@/lib/supabase';

// APIのモックデータと関数
export const User = {
  me: async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      
      if (!user) return null;
      
      return {
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
        id: user.id
      };
    } catch (error) {
      console.error('認証エラー:', error.message);
      return null;
    }
  },
  
  login: async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('ログインエラー:', error.message);
      throw error;
    }
  },
  
  logout: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('ログアウトエラー:', error.message);
      throw error;
    }
  }
};

export const UserProfile = {
  filter: async (query) => {
    try {
      // Supabase実装の場合は、次のようなコードを使用します
      // const { data, error } = await supabase
      //   .from('user_profiles')
      //   .select('*')
      //   .eq('created_by', query.created_by);
      
      // if (error) throw error;
      // return data;
      
      // モックデータを返します
      return [{
        id: '1',
        age: 30,
        gender: 'male',
        height: 170,
        weight: 65,
        activity_level: 'moderate',
        goal: 'maintain',
        allergies: [],
        dietary_restrictions: [],
        preferred_cuisine: ['和食', '中華'],
        disliked_foods: [],
        created_by: query.created_by
      }];
    } catch (error) {
      console.error('プロフィール取得エラー:', error.message);
      return [];
    }
  },
  
  create: async (data) => {
    try {
      // Supabase実装の場合は、次のようなコードを使用します
      // const { data: result, error } = await supabase
      //   .from('user_profiles')
      //   .insert([data])
      //   .select()
      //   .single();
      
      // if (error) throw error;
      // return result;
      
      // モックデータを返します
      return { id: '2', ...data };
    } catch (error) {
      console.error('プロフィール作成エラー:', error.message);
      throw error;
    }
  },
  
  update: async (id, data) => {
    try {
      // Supabase実装の場合は、次のようなコードを使用します
      // const { data: result, error } = await supabase
      //   .from('user_profiles')
      //   .update(data)
      //   .eq('id', id)
      //   .select()
      //   .single();
      
      // if (error) throw error;
      // return result;
      
      // モックデータを返します
      return { id, ...data };
    } catch (error) {
      console.error('プロフィール更新エラー:', error.message);
      throw error;
    }
  }
};

export const GeneratedMenu = {
  filter: async (query) => {
    try {
      // Supabase実装の場合は、次のようなコードを使用します
      // const { data, error } = await supabase
      //   .from('generated_menus')
      //   .select('*')
      //   .eq('created_by', query.created_by)
      //   .order('created_at', { ascending: false });
      
      // if (error) throw error;
      // return data;
      
      // モックデータを返します
      return [{
        id: '1',
        title: 'モックメニュー',
        total_calories: 1800,
        total_protein: 90,
        total_carbs: 200,
        total_fat: 60,
        target_date: new Date().toISOString().split('T')[0],
        created_by: query.created_by,
        is_favorite: false,
        meals: [
          {
            meal_type: 'breakfast',
            dishes: [
              {
                name: 'モック朝食',
                calories: 400,
                protein: 20,
                carbs: 50,
                fat: 15,
                ingredients: ['食材1', '食材2'],
                recipe: 'レシピ説明'
              }
            ]
          },
          {
            meal_type: 'lunch',
            dishes: [
              {
                name: 'モック昼食',
                calories: 600,
                protein: 30,
                carbs: 70,
                fat: 20,
                ingredients: ['食材3', '食材4'],
                recipe: 'レシピ説明'
              }
            ]
          },
          {
            meal_type: 'dinner',
            dishes: [
              {
                name: 'モック夕食',
                calories: 800,
                protein: 40,
                carbs: 80,
                fat: 25,
                ingredients: ['食材5', '食材6'],
                recipe: 'レシピ説明'
              }
            ]
          }
        ]
      }];
    } catch (error) {
      console.error('メニュー取得エラー:', error.message);
      return [];
    }
  },
  
  create: async (data) => {
    try {
      // Supabase実装の場合は、次のようなコードを使用します
      // const { data: result, error } = await supabase
      //   .from('generated_menus')
      //   .insert([data])
      //   .select()
      //   .single();
      
      // if (error) throw error;
      // return result;
      
      // モックデータを返します
      return { id: '1', ...data };
    } catch (error) {
      console.error('メニュー作成エラー:', error.message);
      throw error;
    }
  },
  
  update: async (id, data) => {
    try {
      // Supabase実装の場合は、次のようなコードを使用します
      // const { data: result, error } = await supabase
      //   .from('generated_menus')
      //   .update(data)
      //   .eq('id', id)
      //   .select()
      //   .single();
      
      // if (error) throw error;
      // return result;
      
      // モックデータを返します
      return { id, ...data };
    } catch (error) {
      console.error('メニュー更新エラー:', error.message);
      throw error;
    }
  },
  
  schema: () => ({ properties: {} })
};

export const InvokeLLM = async () => {
  // 実際のGemini API呼び出しを実装する場合は、こちらに記述します
  // 現在はモックデータを返します
  return {
    title: '栄養バランスの取れた和食メニュー',
    total_calories: 1800,
    total_protein: 90,
    total_carbs: 200,
    total_fat: 60,
    meals: [
      {
        meal_type: 'breakfast',
        dishes: [
          {
            name: '納豆ご飯と味噌汁',
            calories: 400,
            protein: 20,
            carbs: 50,
            fat: 15,
            ingredients: ['ご飯', '納豆', '卵', '海苔', '豆腐', 'わかめ', '味噌', 'ねぎ'],
            recipe: '1. ご飯を温める\n2. 納豆に卵を混ぜる\n3. ご飯に納豆をかける\n4. 味噌汁を作る'
          }
        ]
      },
      {
        meal_type: 'lunch',
        dishes: [
          {
            name: '鮭の塩焼きとひじきの煮物',
            calories: 600,
            protein: 30,
            carbs: 70,
            fat: 20,
            ingredients: ['鮭', '塩', 'ひじき', '人参', '油揚げ', '醤油', 'みりん', '砂糖'],
            recipe: '1. 鮭に塩をふり、グリルで焼く\n2. ひじきを戻し、人参と油揚げと調味料で煮る'
          }
        ]
      },
      {
        meal_type: 'dinner',
        dishes: [
          {
            name: '鶏の照り焼きと野菜炒め',
            calories: 800,
            protein: 40,
            carbs: 80,
            fat: 25,
            ingredients: ['鶏もも肉', '醤油', 'みりん', '砂糖', 'にんにく', 'キャベツ', 'もやし', 'ピーマン', '塩', 'こしょう'],
            recipe: '1. 鶏もも肉に下味をつけ、フライパンで焼く\n2. 照り焼きソースを絡める\n3. 野菜を炒め、塩こしょうで味付けする'
          }
        ]
      }
    ]
  };
};

export const createStripeCheckout = async () => {
  try {
    // Supabase関数呼び出しを実装する場合は、次のようなコードを使用します
    // const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
    //   body: { amount: 50000 }
    // });
    
    // if (error) throw error;
    // return data;
    
    // モックデータを返します
    return {
      data: {
        success: true,
        checkout_url: 'https://example.com/checkout'
      }
    };
  } catch (error) {
    console.error('Stripe決済エラー:', error.message);
    throw error;
  }
};