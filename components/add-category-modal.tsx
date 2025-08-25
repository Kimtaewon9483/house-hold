"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Category } from "@/lib/database/types";

interface AddCategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCategoryAdded: (category: Category) => void;
  parentCategories: Category[];
}

const categoryColors = [
  { name: "赤", value: "#FF6B6B" },
  { name: "青", value: "#4ECDC4" },
  { name: "緑", value: "#96CEB4" },
  { name: "黄", value: "#FECA57" },
  { name: "紫", value: "#A55EEA" },
  { name: "ピンク", value: "#FF9FF3" },
  { name: "オレンジ", value: "#FFA726" },
  { name: "グレー", value: "#90A4AE" },
];

const categoryIcons = [
  "🍽️", "🏠", "🚌", "🎭", "📚", "💰", "🎁", "💵",
  "🛒", "🍝", "🍰", "☕", "👔", "🧴", "⚕️", "💻",
  "🎬", "✈️", "🎨", "🎮", "📖", "🎓", "💡", "📜",
  "🏦", "📈", "📊", "🔮"
];

export function AddCategoryModal({ 
  open, 
  onOpenChange, 
  onCategoryAdded, 
  parentCategories 
}: AddCategoryModalProps) {
  const [formData, setFormData] = useState({
    category_name: "",
    description: "",
    parent_category_id: null as number | null,
    icon_name: "📦",
    color_code: "#4ECDC4"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.category_name.trim()) {
      setError("カテゴリ名は必須です");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // TODO: Supabaseにカテゴリを保存する処理を実装
      const newCategory: Category = {
        category_id: Date.now(), // 仮のID
        category_name: formData.category_name.trim(),
        category_code: null,
        parent_category_id: formData.parent_category_id,
        description: formData.description,
        icon_name: formData.icon_name,
        color_code: formData.color_code,
        is_system: false,
        is_active: true,
        sort_order: 0,
        created_by: null,
        group_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      onCategoryAdded(newCategory);
      
      // フォームリセット
      setFormData({
        category_name: "",
        description: "",
        parent_category_id: null,
        icon_name: "📦",
        color_code: "#4ECDC4"
      });
      
      onOpenChange(false);
      
    } catch (error) {
      setError(error instanceof Error ? error.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>新しいカテゴリを追加</DialogTitle>
          <DialogDescription>
            新しいカテゴリを作成してください。同じグループのメンバーも使用できます。
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* カテゴリ名 */}
          <div className="space-y-2">
            <Label htmlFor="category_name">カテゴリ名 <span className="text-red-500">*</span></Label>
            <Input
              id="category_name"
              placeholder="例: 習い事"
              value={formData.category_name}
              onChange={(e) => setFormData(prev => ({ ...prev, category_name: e.target.value }))}
            />
          </div>

          {/* 親カテゴリ */}
          <div className="space-y-2">
            <Label>親カテゴリ（任意）</Label>
            <Select
              value={formData.parent_category_id?.toString() || "none"}
              onValueChange={(value) => setFormData(prev => ({ 
                ...prev, 
                parent_category_id: value === "none" ? null : parseInt(value) 
              }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="親カテゴリを選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">なし（トップレベル）</SelectItem>
                {parentCategories.map((category) => (
                  <SelectItem key={category.category_id} value={category.category_id.toString()}>
                    <span className="flex items-center">
                      <span className="mr-2">{category.icon_name}</span>
                      {category.category_name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* アイコン選択 */}
          <div className="space-y-2">
            <Label>アイコン</Label>
            <div className="grid grid-cols-8 gap-2 p-2 border rounded-md max-h-32 overflow-y-auto">
              {categoryIcons.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, icon_name: icon }))}
                  className={`p-2 text-xl rounded hover:bg-gray-100 ${
                    formData.icon_name === icon ? "bg-blue-100 border-2 border-blue-500" : "border"
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
            <div className="text-center p-2 border rounded bg-gray-50">
              選択中: <span className="text-2xl">{formData.icon_name}</span>
            </div>
          </div>

          {/* 色選択 */}
          <div className="space-y-2">
            <Label>色</Label>
            <div className="flex flex-wrap gap-2">
              {categoryColors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, color_code: color.value }))}
                  className={`w-10 h-10 rounded-full border-2 ${
                    formData.color_code === color.value ? "border-gray-800" : "border-gray-300"
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* 説明 */}
          <div className="space-y-2">
            <Label htmlFor="description">説明（任意）</Label>
            <Textarea
              id="description"
              placeholder="このカテゴリの説明を入力してください"
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              キャンセル
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "追加中..." : "追加"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}