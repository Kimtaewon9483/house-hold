'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuthSelectors } from '@/lib/stores/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

export function SystemDataTest() {
  const { isAuthenticated, user, currentGroup } = useAuthSelectors();
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  
  const runTests = async () => {
    setIsLoading(true);
    setTestResults([]);
    const results: TestResult[] = [];
    
    try {
      const supabase = createClient();
      
      // 1. 시스템 카테고리 확인
      const { data: systemCategories, error: systemCatError } = await supabase
        .from('categories')
        .select('*')
        .eq('is_system', true);
        
      if (systemCatError) {
        results.push({
          name: '시스템 카테고리 조회',
          status: 'error',
          message: `에러: ${systemCatError.message}`
        });
      } else {
        results.push({
          name: '시스템 카테고리 조회',
          status: 'success',
          message: `${systemCategories?.length}개 발견`,
          details: systemCategories
        });
      }
      
      // 2. 시스템 결제방법 확인
      const { data: systemPayments, error: systemPayError } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('is_system', true);
        
      if (systemPayError) {
        results.push({
          name: '시스템 결제방법 조회',
          status: 'error',
          message: `에러: ${systemPayError.message}`
        });
      } else {
        results.push({
          name: '시스템 결제방법 조회',
          status: 'success',
          message: `${systemPayments?.length}개 발견`,
          details: systemPayments
        });
      }
      
      // 3. 사용자 인증 상태 확인
      if (!isAuthenticated || !user || !currentGroup) {
        results.push({
          name: '사용자 인증 상태',
          status: 'warning',
          message: '로그인이 필요합니다'
        });
      } else {
        // 4. 사용자 개인 카테고리 확인
        const { data: userCategories, error: userCatError } = await supabase
          .from('categories')
          .select('*')
          .eq('is_system', false)
          .eq('group_id', currentGroup.group_id);
          
        if (userCatError) {
          results.push({
            name: '개인 카테고리 조회',
            status: 'error',
            message: `에러: ${userCatError.message}`
          });
        } else {
          results.push({
            name: '개인 카테고리 조회',
            status: userCategories?.length > 0 ? 'success' : 'warning',
            message: `${userCategories?.length}개 발견`,
            details: userCategories
          });
        }
        
        // 5. 사용자 개인 결제방법 확인
        const { data: userPayments, error: userPayError } = await supabase
          .from('payment_methods')
          .select('*')
          .eq('is_system', false)
          .eq('group_id', currentGroup.group_id);
          
        if (userPayError) {
          results.push({
            name: '개인 결제방법 조회',
            status: 'error',
            message: `에러: ${userPayError.message}`
          });
        } else {
          results.push({
            name: '개인 결제방법 조회',
            status: userPayments?.length > 0 ? 'success' : 'warning',
            message: `${userPayments?.length}개 발견`,
            details: userPayments
          });
        }
        
        // 6. 카테고리 계층 구조 확인
        const parentCategories = userCategories?.filter(cat => !cat.parent_category_id) || [];
        const childCategories = userCategories?.filter(cat => cat.parent_category_id) || [];
        
        results.push({
          name: '카테고리 계층 구조',
          status: parentCategories.length > 0 && childCategories.length > 0 ? 'success' : 'warning',
          message: `대분류 ${parentCategories.length}개, 소분류 ${childCategories.length}개`
        });
        
        // 7. 결제방법 계층 구조 확인
        const parentPayments = userPayments?.filter(pm => !pm.parent_method_id) || [];
        const childPayments = userPayments?.filter(pm => pm.parent_method_id) || [];
        
        results.push({
          name: '결제방법 계층 구조',
          status: parentPayments.length > 0 && childPayments.length > 0 ? 'success' : 'warning',
          message: `대분류 ${parentPayments.length}개, 소분류 ${childPayments.length}개`
        });
        
        // 8. 기본 예산 확인
        const { data: budgets, error: budgetError } = await supabase
          .from('budgets')
          .select('*')
          .eq('user_id', user.user_id)
          .eq('group_id', currentGroup.group_id);
          
        if (budgetError) {
          results.push({
            name: '기본 예산 확인',
            status: 'error',
            message: `에러: ${budgetError.message}`
          });
        } else {
          results.push({
            name: '기본 예산 확인',
            status: budgets?.length > 0 ? 'success' : 'warning',
            message: `${budgets?.length}개 예산 발견`,
            details: budgets
          });
        }
      }
      
    } catch (error) {
      results.push({
        name: '테스트 실행',
        status: 'error',
        message: `전체 테스트 실패: ${error}`
      });
    }
    
    setTestResults(results);
    setIsLoading(false);
  };
  
  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return null;
    }
  };
  
  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>시스템 데이터 테스트</CardTitle>
        <CardDescription>
          데이터베이스 상태 및 사용자 초기화 상태를 확인합니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runTests} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              테스트 실행 중...
            </>
          ) : (
            '테스트 실행'
          )}
        </Button>
        
        {testResults.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold">테스트 결과:</h3>
            {testResults.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(result.status)}
                  <div>
                    <p className="font-medium">{result.name}</p>
                    <p className="text-sm text-gray-600">{result.message}</p>
                  </div>
                </div>
                <Badge className={getStatusColor(result.status)}>
                  {result.status.toUpperCase()}
                </Badge>
              </div>
            ))}
            
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-4">
                <summary className="cursor-pointer font-medium text-sm">
                  상세 데이터 보기 (개발 환경)
                </summary>
                <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-96">
                  {JSON.stringify(testResults.filter(r => r.details).map(r => ({ name: r.name, details: r.details })), null, 2)}
                </pre>
              </details>
            )}
          </div>
        )}
        
        {!isAuthenticated && (
          <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-800">
              💡 완전한 테스트를 위해서는 로그인이 필요합니다. 
              <a href="/auth/login" className="underline font-medium">로그인하기</a>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}