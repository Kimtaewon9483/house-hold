'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuthSelectors } from '@/lib/stores/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Category, PaymentMethod } from '@/lib/database/types';

interface CategoryWithChildren extends Category {
  children?: Category[];
}

interface PaymentMethodWithChildren extends PaymentMethod {
  children?: PaymentMethod[];
}

export function DataDisplayTest() {
  const { isAuthenticated, user, currentGroup } = useAuthSelectors();
  const [categories, setCategories] = useState<CategoryWithChildren[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodWithChildren[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedPayment, setSelectedPayment] = useState<string>('');

  const loadData = async () => {
    if (!isAuthenticated || !currentGroup) return;
    
    setIsLoading(true);
    const supabase = createClient();
    
    try {
      // 카테고리 로드
      const { data: categoriesData, error: catError } = await supabase
        .from('categories')
        .select('*')
        .eq('group_id', currentGroup.group_id)
        .eq('is_active', true)
        .order('sort_order');
        
      if (catError) throw catError;
      
      // 결제방법 로드
      const { data: paymentsData, error: payError } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('group_id', currentGroup.group_id)
        .eq('is_active', true)
        .order('sort_order');
        
      if (payError) throw payError;
      
      // 카테고리 계층 구조 생성
      const buildCategoryHierarchy = (categories: Category[]): CategoryWithChildren[] => {
        const categoryMap = new Map<number, CategoryWithChildren>();
        const rootCategories: CategoryWithChildren[] = [];
        
        // 모든 카테고리를 맵에 저장
        categories.forEach(cat => {
          categoryMap.set(cat.category_id, { ...cat, children: [] });
        });
        
        // 부모-자식 관계 설정
        categories.forEach(cat => {
          const categoryItem = categoryMap.get(cat.category_id)!;
          if (cat.parent_category_id) {
            const parent = categoryMap.get(cat.parent_category_id);
            if (parent) {
              parent.children!.push(categoryItem);
            }
          } else {
            rootCategories.push(categoryItem);
          }
        });
        
        return rootCategories;
      };
      
      // 결제방법 계층 구조 생성
      const buildPaymentHierarchy = (payments: PaymentMethod[]): PaymentMethodWithChildren[] => {
        const paymentMap = new Map<number, PaymentMethodWithChildren>();
        const rootPayments: PaymentMethodWithChildren[] = [];
        
        // 모든 결제방법을 맵에 저장
        payments.forEach(pm => {
          paymentMap.set(pm.method_id, { ...pm, children: [] });
        });
        
        // 부모-자식 관계 설정
        payments.forEach(pm => {
          const paymentItem = paymentMap.get(pm.method_id)!;
          if (pm.parent_method_id) {
            const parent = paymentMap.get(pm.parent_method_id);
            if (parent) {
              parent.children!.push(paymentItem);
            }
          } else {
            rootPayments.push(paymentItem);
          }
        });
        
        return rootPayments;
      };
      
      setCategories(buildCategoryHierarchy(categoriesData || []));
      setPaymentMethods(buildPaymentHierarchy(paymentsData || []));
      
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    loadData();
  }, [isAuthenticated, currentGroup]);
  
  const CategoryCard = ({ category }: { category: CategoryWithChildren }) => (
    <div className="p-3 border rounded-lg space-y-2">
      <div className="flex items-center space-x-2">
        <span className="text-lg">{category.icon_name}</span>
        <span className="font-medium">{category.category_name}</span>
        {category.color_code && (
          <div 
            className="w-4 h-4 rounded-full border" 
            style={{ backgroundColor: category.color_code }}
          />
        )}
      </div>
      {category.description && (
        <p className="text-sm text-gray-600">{category.description}</p>
      )}
      {category.children && category.children.length > 0 && (
        <div className="ml-4 space-y-1">
          {category.children.map(child => (
            <div key={child.category_id} className="flex items-center space-x-2 text-sm">
              <span>{child.icon_name}</span>
              <span>{child.category_name}</span>
              {child.color_code && (
                <div 
                  className="w-3 h-3 rounded-full border" 
                  style={{ backgroundColor: child.color_code }}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
  
  const PaymentCard = ({ payment }: { payment: PaymentMethodWithChildren }) => (
    <div className="p-3 border rounded-lg space-y-2">
      <div className="flex items-center space-x-2">
        <span className="text-lg">{payment.icon_name}</span>
        <span className="font-medium">{payment.method_name}</span>
      </div>
      {payment.description && (
        <p className="text-sm text-gray-600">{payment.description}</p>
      )}
      {payment.children && payment.children.length > 0 && (
        <div className="ml-4 space-y-1">
          {payment.children.map(child => (
            <div key={child.method_id} className="flex items-center space-x-2 text-sm">
              <span>{child.icon_name}</span>
              <span>{child.method_name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
  
  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>데이터 표시 테스트</CardTitle>
          <CardDescription>로그인이 필요합니다.</CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>데이터 표시 테스트</CardTitle>
        <CardDescription>
          복사된 카테고리와 결제방법이 UI에 제대로 표시되는지 확인합니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">데이터 현황</h3>
            <Button onClick={loadData} disabled={isLoading}>
              {isLoading ? '로딩 중...' : '데이터 새로고침'}
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{categories.length}</div>
              <div className="text-sm text-blue-800">대분류 카테고리</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{paymentMethods.length}</div>
              <div className="text-sm text-green-800">대분류 결제방법</div>
            </div>
          </div>
          
          {/* 선택 테스트 */}
          <div className="space-y-3">
            <h4 className="font-medium">선택 UI 테스트</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">카테고리 선택</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="카테고리를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <div key={category.category_id}>
                        <SelectItem 
                          value={category.category_id.toString()}
                          className="font-medium"
                        >
                          {category.icon_name} {category.category_name}
                        </SelectItem>
                        {category.children?.map(child => (
                          <SelectItem 
                            key={child.category_id}
                            value={child.category_id.toString()}
                            className="ml-4"
                          >
                            {child.icon_name} {child.category_name}
                          </SelectItem>
                        ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">결제방법 선택</label>
                <Select value={selectedPayment} onValueChange={setSelectedPayment}>
                  <SelectTrigger>
                    <SelectValue placeholder="결제방법을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map(payment => (
                      <div key={payment.method_id}>
                        <SelectItem 
                          value={payment.method_id.toString()}
                          className="font-medium"
                        >
                          {payment.icon_name} {payment.method_name}
                        </SelectItem>
                        {payment.children?.map(child => (
                          <SelectItem 
                            key={child.method_id}
                            value={child.method_id.toString()}
                            className="ml-4"
                          >
                            {child.icon_name} {child.method_name}
                          </SelectItem>
                        ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {(selectedCategory || selectedPayment) && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  ✅ 선택 테스트 성공! 
                  {selectedCategory && ` 카테고리: ${categories.find(c => c.category_id.toString() === selectedCategory)?.category_name || '하위 카테고리'}`}
                  {selectedPayment && ` 결제방법: ${paymentMethods.find(p => p.method_id.toString() === selectedPayment)?.method_name || '하위 결제방법'}`}
                </p>
              </div>
            )}
          </div>
          
          {/* 데이터 표시 */}
          <Tabs defaultValue="categories" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="categories">카테고리</TabsTrigger>
              <TabsTrigger value="payments">결제방법</TabsTrigger>
            </TabsList>
            
            <TabsContent value="categories" className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {categories.map(category => (
                  <CategoryCard key={category.category_id} category={category} />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="payments" className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {paymentMethods.map(payment => (
                  <PaymentCard key={payment.method_id} payment={payment} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}