"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, Minus } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/stores/authStore";
import { Category, PaymentMethod } from "@/lib/database/types";
import { AddCategoryModal } from "@/components/add-category-modal";

interface TransactionFormProps {
  onSubmit?: (data: TransactionFormData) => void;
  onCancel?: () => void;
  initialData?: Partial<TransactionFormData>;
}

export interface TransactionItem {
  transaction_name: string;
  amount: number;
  quantity: number;
}

export interface TransactionFormData {
  transaction_date: Date;
  transaction_type: 'income' | 'expense';
  category_id: number;
  payment_method_id: number;
  location?: string;
  memo?: string;
  necessity_level?: 'essential' | 'optional' | 'luxury';
  is_planned: boolean;
  is_recurring: boolean;
  recurring_cycle?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  items: TransactionItem[];
}

export function TransactionForm({ onSubmit, onCancel, initialData }: TransactionFormProps) {
  const { user, currentGroup } = useAuthStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);

  // フォームデータ
  const [formData, setFormData] = useState<TransactionFormData>({
    transaction_date: new Date(),
    transaction_type: "expense",
    category_id: 0,
    payment_method_id: 0,
    location: "",
    memo: "",
    necessity_level: undefined,
    is_planned: false,
    is_recurring: false,
    recurring_cycle: undefined,
    items: [{ transaction_name: "", amount: 0, quantity: 1 }],
    ...initialData
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // カテゴリとお支払い方法を読み込み
  useEffect(() => {
    if (currentGroup) {
      loadCategories();
      loadPaymentMethods();
    }
  }, [currentGroup]);

  const loadCategories = async () => {
    // TODO: Supabaseからカテゴリを取得
    // 仮のデータ
    setCategories([
      { category_id: 1, category_name: "食費", category_code: "FOOD", parent_category_id: null, description: "", icon_name: "🍽️", color_code: "#FF6B6B", is_system: true, is_active: true, sort_order: 1, created_by: null, group_id: null, created_at: "", updated_at: "" },
      { category_id: 2, category_name: "生活費", category_code: "LIVING", parent_category_id: null, description: "", icon_name: "🏠", color_code: "#4ECDC4", is_system: true, is_active: true, sort_order: 2, created_by: null, group_id: null, created_at: "", updated_at: "" },
    ]);
  };

  const loadPaymentMethods = async () => {
    // TODO: Supabaseからお支払い方法を取得
    // 仮のデータ
    setPaymentMethods([
      { method_id: 1, method_name: "現金", method_code: "CASH", parent_method_id: null, description: "", icon_name: "💵", is_system: true, is_active: true, sort_order: 1, created_by: null, group_id: null, created_at: "", updated_at: "" },
      { method_id: 2, method_name: "クレジットカード", method_code: "CARD_CREDIT", parent_method_id: null, description: "", icon_name: "💳", is_system: true, is_active: true, sort_order: 2, created_by: null, group_id: null, created_at: "", updated_at: "" },
    ]);
  };

  const handleCategoryAdded = (newCategory: Category) => {
    setCategories(prev => [...prev, newCategory]);
    // 新しく追加したカテゴリを選択
    updateFormData('category_id', newCategory.category_id);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // 取引項目のバリデーション
    formData.items.forEach((item, index) => {
      if (!item.transaction_name.trim()) {
        newErrors[`item_${index}_transaction_name`] = "取引名は必須です";
      }
      if (item.amount <= 0) {
        newErrors[`item_${index}_amount`] = "金額は0より大きい値を入力してください";
      }
      if (item.quantity <= 0) {
        newErrors[`item_${index}_quantity`] = "数量は0より大きい値を入力してください";
      }
    });

    if (formData.category_id === 0) {
      newErrors.category_id = "カテゴリを選択してください";
    }

    if (formData.payment_method_id === 0) {
      newErrors.payment_method_id = "お支払い方法を選択してください";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      if (onSubmit) {
        await onSubmit(formData);
      }
    } catch (error) {
      console.error("Transaction submission failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof TransactionFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // エラーをクリア
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const updateItemData = (index: number, field: keyof TransactionItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
    
    // エラーをクリア
    const errorKey = `item_${index}_${field}`;
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: "" }));
    }
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { transaction_name: "", amount: 0, quantity: 1 }]
    }));
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
      
      // 削除した項目のエラーをクリア
      setErrors(prev => {
        const newErrors = { ...prev };
        Object.keys(newErrors).forEach(key => {
          if (key.startsWith(`item_${index}_`)) {
            delete newErrors[key];
          }
        });
        return newErrors;
      });
    }
  };

  const getTotalAmount = () => {
    return formData.items.reduce((total, item) => total + (item.amount * item.quantity), 0);
  };

  if (!user || !currentGroup) {
    return <div>ログインが必要です</div>;
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>新しい取引を追加</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 収入/支出タイプ */}
          <div className="space-y-2">
            <Label>取引タイプ</Label>
            <RadioGroup
              value={formData.transaction_type}
              onValueChange={(value: 'income' | 'expense') => updateFormData('transaction_type', value)}
              className="flex space-x-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="expense" id="expense" />
                <Label htmlFor="expense" className="text-red-600">支出</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="income" id="income" />
                <Label htmlFor="income" className="text-green-600">収入</Label>
              </div>
            </RadioGroup>
          </div>

          {/* 取引項目リスト */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-medium">取引項目</Label>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  合計金額: {getTotalAmount().toLocaleString()}円
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                  className="h-8 px-3 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  項目追加
                </Button>
              </div>
            </div>
            
            <div className="space-y-3">
              {formData.items.map((item, index) => (
                <Card key={index} className="p-4">
                  <div className="space-y-4">
                    {/* ヘッダー: 項目番号と削除ボタン */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">項目 {index + 1}</span>
                      {formData.items.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeItem(index)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    
                    {/* 取引名 (フル幅) */}
                    <div className="space-y-2">
                      <Label htmlFor={`item_${index}_transaction_name`}>
                        取引名 <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id={`item_${index}_transaction_name`}
                        placeholder="例: コンビニで昼食"
                        value={item.transaction_name}
                        onChange={(e) => updateItemData(index, 'transaction_name', e.target.value)}
                        className={errors[`item_${index}_transaction_name`] ? "border-red-500" : ""}
                      />
                      {errors[`item_${index}_transaction_name`] && (
                        <p className="text-sm text-red-500">{errors[`item_${index}_transaction_name`]}</p>
                      )}
                    </div>

                    {/* 金額と数量を横並び */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* 金額 */}
                      <div className="space-y-2">
                        <Label htmlFor={`item_${index}_amount`}>
                          金額 <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <Input
                            id={`item_${index}_amount`}
                            type="number"
                            placeholder="0"
                            min="0"
                            step="0.01"
                            value={item.amount || ""}
                            onChange={(e) => updateItemData(index, 'amount', parseFloat(e.target.value) || 0)}
                            className={cn("pr-8 text-right", errors[`item_${index}_amount`] ? "border-red-500" : "")}
                          />
                          <span className="absolute right-2 top-2.5 text-xs text-gray-500">円</span>
                        </div>
                        {errors[`item_${index}_amount`] && (
                          <p className="text-xs text-red-500">{errors[`item_${index}_amount`]}</p>
                        )}
                      </div>

                      {/* 数量 */}
                      <div className="space-y-2">
                        <Label htmlFor={`item_${index}_quantity`}>数量</Label>
                        <div className="flex items-center space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => updateItemData(index, 'quantity', Math.max(1, item.quantity - 1))}
                            className="h-9 w-9 p-0"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <Input
                            id={`item_${index}_quantity`}
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItemData(index, 'quantity', parseInt(e.target.value) || 1)}
                            className="text-center flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => updateItemData(index, 'quantity', item.quantity + 1)}
                            className="h-9 w-9 p-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        {errors[`item_${index}_quantity`] && (
                          <p className="text-xs text-red-500">{errors[`item_${index}_quantity`]}</p>
                        )}
                      </div>
                    </div>
                    
                    {/* 小計表示 */}
                    <div className="pt-2 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">小計</span>
                        <span className="text-lg font-medium">
                          {(item.amount * item.quantity).toLocaleString()}円
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* 取引日 */}
          <div className="space-y-2">
            <Label>取引日</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.transaction_date ? format(formData.transaction_date, "yyyy年MM月dd日", { locale: ja }) : "日付を選択"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.transaction_date}
                  onSelect={(date) => updateFormData('transaction_date', date || new Date())}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* カテゴリ */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>カテゴリ <span className="text-red-500">*</span></Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAddCategoryModal(true)}
                className="h-8 px-3 text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                追加
              </Button>
            </div>
            <Select
              value={formData.category_id.toString()}
              onValueChange={(value) => updateFormData('category_id', parseInt(value))}
            >
              <SelectTrigger className={errors.category_id ? "border-red-500" : ""}>
                <SelectValue placeholder="カテゴリを選択" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.category_id} value={category.category_id.toString()}>
                    <span className="flex items-center">
                      <span className="mr-2">{category.icon_name}</span>
                      {category.category_name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category_id && (
              <p className="text-sm text-red-500">{errors.category_id}</p>
            )}
          </div>

          {/* お支払い方法 */}
          <div className="space-y-2">
            <Label>お支払い方法 <span className="text-red-500">*</span></Label>
            <Select
              value={formData.payment_method_id.toString()}
              onValueChange={(value) => updateFormData('payment_method_id', parseInt(value))}
            >
              <SelectTrigger className={errors.payment_method_id ? "border-red-500" : ""}>
                <SelectValue placeholder="お支払い方法を選択" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method.method_id} value={method.method_id.toString()}>
                    <span className="flex items-center">
                      <span className="mr-2">{method.icon_name}</span>
                      {method.method_name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.payment_method_id && (
              <p className="text-sm text-red-500">{errors.payment_method_id}</p>
            )}
          </div>

          {/* 場所 */}
          <div className="space-y-2">
            <Label htmlFor="location">場所</Label>
            <Input
              id="location"
              placeholder="例: セブンイレブン新宿店"
              value={formData.location}
              onChange={(e) => updateFormData('location', e.target.value)}
            />
          </div>

          {/* 必要性レベル (支出の場合のみ) */}
          {formData.transaction_type === 'expense' && (
            <div className="space-y-2">
              <Label>必要性</Label>
              <Select
                value={formData.necessity_level || "none"}
                onValueChange={(value) => updateFormData('necessity_level', value === "none" ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="必要性を選択（任意）" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">選択しない</SelectItem>
                  <SelectItem value="essential">必需品</SelectItem>
                  <SelectItem value="optional">あったら良い</SelectItem>
                  <SelectItem value="luxury">贅沢品</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* チェックボックス */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_planned"
                checked={formData.is_planned}
                onCheckedChange={(checked) => updateFormData('is_planned', checked)}
              />
              <Label htmlFor="is_planned">計画済み支出</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_recurring"
                checked={formData.is_recurring}
                onCheckedChange={(checked) => {
                  updateFormData('is_recurring', checked);
                  if (!checked) {
                    updateFormData('recurring_cycle', undefined);
                  }
                }}
              />
              <Label htmlFor="is_recurring">定期支出</Label>
            </div>

            {formData.is_recurring && (
              <div className="ml-6 space-y-2">
                <Label>繰り返しサイクル</Label>
                <Select
                  value={formData.recurring_cycle || ""}
                  onValueChange={(value) => updateFormData('recurring_cycle', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="サイクルを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">毎日</SelectItem>
                    <SelectItem value="weekly">毎週</SelectItem>
                    <SelectItem value="monthly">毎月</SelectItem>
                    <SelectItem value="yearly">毎年</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* メモ */}
          <div className="space-y-2">
            <Label htmlFor="memo">メモ</Label>
            <Textarea
              id="memo"
              placeholder="追加の詳細情報があれば入力してください"
              rows={3}
              value={formData.memo}
              onChange={(e) => updateFormData('memo', e.target.value)}
            />
          </div>

          {/* ボタン */}
          <div className="flex space-x-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "保存中..." : "保存"}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                キャンセル
              </Button>
            )}
          </div>
        </form>
      </CardContent>
      
      {/* カテゴリ追加モーダル */}
      <AddCategoryModal
        open={showAddCategoryModal}
        onOpenChange={setShowAddCategoryModal}
        onCategoryAdded={handleCategoryAdded}
        parentCategories={categories.filter(c => c.parent_category_id === null)}
      />
    </Card>
  );
}