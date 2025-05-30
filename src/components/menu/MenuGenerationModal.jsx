import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Calendar, Target } from "lucide-react";
import { format } from "date-fns";
import MenuGenerationForm from "./MenuGenerationForm";
import LifestyleSelector from "./LifestyleSelector";

export default function MenuGenerationModal({ open, onOpenChange, onGenerate, isGenerating }) {
  const [activeTab, setActiveTab] = useState("daily");
  const [planFormData, setPlanFormData] = useState({
    start_date: format(new Date(), "yyyy-MM-dd"),
    lifestyle: "standard", // 本格をデフォルトに
    weight_loss_goal: "4" // 月4%をデフォルトに
  });

  const handlePlanGenerate = () => {
    onGenerate({
      ...planFormData,
      plan_type: "60days"
    });

    // 非同期処理のため、生成プロセスが開始したらモーダルを閉じる
    if (!isGenerating) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-center mb-2">
            メニュー生成設定
          </DialogTitle>
        </DialogHeader>
        
        <Tabs
          defaultValue={activeTab}
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="daily">1日メニュー</TabsTrigger>
            <TabsTrigger value="plan">60日プラン</TabsTrigger>
          </TabsList>
          
          <TabsContent value="daily">
            <MenuGenerationForm 
              onGenerate={(formData) => {
                onGenerate(formData);
                // 生成中でなければモーダルを閉じる
                if (!isGenerating) {
                  onOpenChange(false);
                }
              }} 
              isGenerating={isGenerating}
              inModal={true}
            />
          </TabsContent>
          
          <TabsContent value="plan">
            <Card>
              <CardContent className="pt-6 pb-4 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="start_date" className="font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    開始日
                  </Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={planFormData.start_date}
                    onChange={(e) => setPlanFormData(prev => ({ ...prev, start_date: e.target.value }))}
                    className="border-gray-200 focus:border-green-500"
                  />
                </div>
                
                <LifestyleSelector 
                  value={planFormData.lifestyle} 
                  onChange={(value) => setPlanFormData(prev => ({ ...prev, lifestyle: value }))}
                />
                
                <div className="space-y-2">
                  <Label htmlFor="weight_loss_goal" className="font-medium flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    減量目標（月間）
                  </Label>
                  <Select 
                    value={planFormData.weight_loss_goal} 
                    onValueChange={(value) => setPlanFormData(prev => ({ ...prev, weight_loss_goal: value }))}
                  >
                    <SelectTrigger className="border-gray-200 focus:border-green-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2%（控えめ）</SelectItem>
                      <SelectItem value="4">4%（標準）</SelectItem>
                      <SelectItem value="6">6%（積極的）</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    ※ 健康的な減量ペースは体重の4～8%/月程度です。
                  </p>
                </div>
                
                <Button
                  onClick={handlePlanGenerate}
                  disabled={isGenerating}
                  className="w-full text-white font-medium py-4 rounded-xl shadow-lg transition-all duration-300 disabled:opacity-50 text-base"
                  style={{ 
                    background: 'linear-gradient(to right, #183041, #2D4A5C)',
                  }}
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="w-5 h-5 mr-2 animate-pulse" />
                      AIがプランを生成中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      60日間プランを生成
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}