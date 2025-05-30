import React from 'react';
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ChefHat, Clock, Zap } from 'lucide-react';

export default function LifestyleSelector({ value, onChange }) {
  const lifestyles = [
    {
      id: 'easy',
      title: '手軽',
      icon: Clock,
      description: '簡単で時間のかからない料理が中心',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'standard',
      title: '本格',
      icon: ChefHat,
      description: '本格的で栄養価の高い家庭料理',
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'efficient',
      title: '効率',
      icon: Zap,
      description: '時短テクニックと一括調理を活用',
      color: 'from-orange-500 to-orange-600'
    }
  ];

  return (
    <div className="space-y-3">
      <Label className="font-medium">ライフスタイルに合わせたプランを選択</Label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {lifestyles.map((lifestyle) => {
          const Icon = lifestyle.icon;
          const isSelected = value === lifestyle.id;
          
          return (
            <Card
              key={lifestyle.id}
              className={`
                cursor-pointer p-3 md:p-4 transition-all duration-300 relative overflow-hidden hover:shadow-md
                ${isSelected ? 'ring-2 ring-primary shadow-lg' : 'border border-gray-200'}
              `}
              onClick={() => onChange(lifestyle.id)}
            >
              {isSelected && (
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${lifestyle.color}`} />
              )}
              <div className="flex gap-3 items-start">
                <div className={`
                  p-2 rounded-lg flex items-center justify-center
                  ${isSelected ? `bg-gradient-to-r ${lifestyle.color} text-white` : 'bg-gray-100 text-gray-600'}
                `}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{lifestyle.title}</div>
                  <div className="text-xs text-gray-500 mt-1">{lifestyle.description}</div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}