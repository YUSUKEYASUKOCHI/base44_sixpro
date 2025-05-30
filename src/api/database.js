import supabase from '@/lib/supabase';

// ユーザープロファイル関連の操作
export const UserProfile = {
  // ユーザープロファイルを取得
  getByUser: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('プロファイル取得エラー:', error.message);
      return null;
    }
  },
  
  // フィルタリングによるプロファイル取得
  filter: async (query = {}) => {
    try {
      let queryBuilder = supabase.from('user_profiles').select('*');
      
      // フィルター条件を追加
      Object.entries(query).forEach(([key, value]) => {
        queryBuilder = queryBuilder.eq(key, value);
      });
      
      const { data, error } = await queryBuilder;
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('プロファイル検索エラー:', error.message);
      return [];
    }
  },
  
  // プロファイル作成
  create: async (profileData) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .insert([profileData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('プロファイル作成エラー:', error.message);
      throw error;
    }
  },
  
  // プロファイル更新
  update: async (id, profileData) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(profileData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('プロファイル更新エラー:', error.message);
      throw error;
    }
  },
  
  // プロファイル削除
  delete: async (id) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('プロファイル削除エラー:', error.message);
      throw error;
    }
  }
};

// 生成されたメニュー関連の操作
export const GeneratedMenu = {
  // メニュー取得
  getById: async (id) => {
    try {
      const { data, error } = await supabase
        .from('generated_menus')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('メニュー取得エラー:', error.message);
      return null;
    }
  },
  
  // フィルタリングによるメニュー取得
  filter: async (query = {}, orderBy = null) => {
    try {
      let queryBuilder = supabase.from('generated_menus').select('*');
      
      // フィルター条件を追加
      Object.entries(query).forEach(([key, value]) => {
        queryBuilder = queryBuilder.eq(key, value);
      });
      
      // 並び順を設定
      if (orderBy) {
        const [column, direction] = orderBy.startsWith('-') 
          ? [orderBy.substring(1), 'desc'] 
          : [orderBy, 'asc'];
        queryBuilder = queryBuilder.order(column, { ascending: direction === 'asc' });
      }
      
      const { data, error } = await queryBuilder;
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('メニュー検索エラー:', error.message);
      return [];
    }
  },
  
  // メニュー作成
  create: async (menuData) => {
    try {
      const { data, error } = await supabase
        .from('generated_menus')
        .insert([menuData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('メニュー作成エラー:', error.message);
      throw error;
    }
  },
  
  // メニュー更新
  update: async (id, menuData) => {
    try {
      const { data, error } = await supabase
        .from('generated_menus')
        .update(menuData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('メニュー更新エラー:', error.message);
      throw error;
    }
  },
  
  // メニュー削除
  delete: async (id) => {
    try {
      const { error } = await supabase
        .from('generated_menus')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('メニュー削除エラー:', error.message);
      throw error;
    }
  },
  
  // スキーマ情報（必要に応じて）
  schema: () => ({ properties: {} })
};