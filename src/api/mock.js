// APIのモックデータと関数
export const User = {
  me: async () => ({ email: 'user@example.com', full_name: 'テストユーザー' }),
  login: async () => console.log('ログイン処理をモック'),
  logout: async () => console.log('ログアウト処理をモック')
};

export const UserProfile = {
  filter: async () => ([{
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
    disliked_foods: []
  }]),
  create: async (data) => ({ id: '2', ...data }),
  update: async (id, data) => ({ id, ...data })
};

export const GeneratedMenu = {
  filter: async () => ([]),
  create: async (data) => ({ id: '1', ...data }),
  update: async (id, data) => ({ id, ...data }),
  schema: () => ({ properties: {} })
};

export const InvokeLLM = async () => ({
  title: 'モックメニュー',
  total_calories: 1800,
  total_protein: 90,
  total_carbs: 200,
  total_fat: 60,
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
    }
  ]
});

export const createStripeCheckout = async () => ({
  data: {
    success: true,
    checkout_url: 'https://example.com/checkout'
  }
});