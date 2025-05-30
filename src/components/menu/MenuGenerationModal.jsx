import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sparkles } from "lucide-react";
import MenuGenerationForm from "./MenuGenerationForm";

export default function MenuGenerationModal({ open, onOpenChange, onGenerate, isGenerating }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-center mb-2">
            メニュー生成設定
          </DialogTitle>
        </DialogHeader>
        <MenuGenerationForm 
          onGenerate={(formData) => {
            onGenerate(formData);
            // 生成中でなければモーダルを閉じる
            // 注意: 非同期処理のため、実際には生成プロセスが開始したらすぐにモーダルは閉じられます
            if (!isGenerating) {
              onOpenChange(false);
            }
          }} 
          isGenerating={isGenerating}
          inModal={true}
        />
      </DialogContent>
    </Dialog>
  );
}