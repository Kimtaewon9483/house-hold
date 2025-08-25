'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthSelectors } from '@/lib/stores/authStore';
import { InfoIcon, User, Users, Wallet, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SystemDataTest } from '@/components/test/SystemDataTest';
import { DataDisplayTest } from '@/components/test/DataDisplayTest';

export default function ProtectedPage() {
  const router = useRouter();
  const { 
    isAuthenticated, 
    isLoading, 
    isInitialized,
    user, 
    supabaseUser,
    currentGroup,
    currentRole,
    availableGroups 
  } = useAuthSelectors();

  useEffect(() => {
    if (isInitialized && !isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, isInitialized, router]);

  if (!isInitialized || isLoading) {
    return (
      <div className="flex-1 w-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // 리다이렉트 중
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-6 p-6">
      {/* 환영 메시지 */}
      <div className="w-full">
        <div className="bg-accent text-sm p-4 rounded-lg text-foreground flex gap-3 items-center">
          <InfoIcon size="16" strokeWidth={2} />
          환영합니다! 가계부 관리를 시작해보세요.
        </div>
      </div>

      {/* 빠른 액션 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet size="20" />
            빠른 액션
          </CardTitle>
          <CardDescription>
            자주 사용하는 기능들에 빠르게 접근할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/transactions/add">
              <Button className="w-full h-24 flex flex-col gap-2">
                <Plus size="24" />
                <span>새 거래 추가</span>
              </Button>
            </Link>
            <Button variant="outline" className="w-full h-24 flex flex-col gap-2" disabled>
              <Wallet size="24" />
              <span>거래 목록</span>
              <span className="text-xs text-muted-foreground">(준비중)</span>
            </Button>
            <Button variant="outline" className="w-full h-24 flex flex-col gap-2" disabled>
              <InfoIcon size="24" />
              <span>통계 보기</span>
              <span className="text-xs text-muted-foreground">(준비중)</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 사용자 정보 카드 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User size="20" />
            사용자 정보
          </CardTitle>
          <CardDescription>
            현재 로그인된 계정의 정보입니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">표시명</label>
              <p className="text-lg font-semibold">{user?.display_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">이메일</label>
              <p className="text-sm">{user?.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">사용자명</label>
              <p className="text-sm">{user?.username}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">가입일</label>
              <p className="text-sm">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString('ko-KR') : '-'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 현재 그룹 정보 */}
      {currentGroup && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet size="20" />
              현재 가계부
            </CardTitle>
            <CardDescription>
              현재 활성화된 가계부 그룹입니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{currentGroup.group_name}</h3>
                <p className="text-sm text-muted-foreground">{currentGroup.description}</p>
              </div>
              <Badge variant={currentRole === 'admin' ? 'default' : 'secondary'}>
                {currentRole === 'admin' ? '관리자' : currentRole === 'member' ? '멤버' : '읽기 전용'}
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="font-medium text-muted-foreground">그룹 유형</label>
                <p>{currentGroup.group_type === 'personal' ? '개인' : currentGroup.group_type === 'family' ? '가족' : '공유'}</p>
              </div>
              <div>
                <label className="font-medium text-muted-foreground">생성일</label>
                <p>{new Date(currentGroup.created_at).toLocaleDateString('ko-KR')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 가능한 그룹들 */}
      {availableGroups.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users size="20" />
              소속 그룹
            </CardTitle>
            <CardDescription>
              참여 중인 모든 가계부 그룹입니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {availableGroups.map((group) => (
                <div key={group.group_id} className="flex items-center justify-between p-2 rounded border">
                  <div>
                    <h4 className="font-medium">{group.group_name}</h4>
                    <p className="text-sm text-muted-foreground">{group.description}</p>
                  </div>
                  {group.group_id === currentGroup?.group_id && (
                    <Badge variant="outline">현재</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 데이터 복사 버튼 (기존 사용자용) */}
      <Card>
        <CardHeader>
          <CardTitle>데이터 복사</CardTitle>
          <CardDescription>
            기존 사용자를 위한 시스템 데이터 복사
          </CardDescription>
        </CardHeader>
        <CardContent>
          <button
            onClick={async () => {
              try {
                const response = await fetch('/api/auth/copy-data', { method: 'POST' });
                const result = await response.json();
                console.log('데이터 복사 결과:', result);
                alert('데이터 복사가 완료되었습니다! 페이지를 새로고침해주세요.');
                window.location.reload();
              } catch (error) {
                console.error('데이터 복사 실패:', error);
                alert('데이터 복사에 실패했습니다.');
              }
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            시스템 데이터 복사하기
          </button>
        </CardContent>
      </Card>

      {/* 시스템 데이터 테스트 */}
      <SystemDataTest />
      
      {/* 데이터 표시 테스트 */}
      <DataDisplayTest />

      {/* 개발자 정보 (디버깅용) */}
      {process.env.NODE_ENV === 'development' && (
        <Card>
          <CardHeader>
            <CardTitle>디버그 정보</CardTitle>
            <CardDescription>개발 환경에서만 표시됩니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <details className="text-xs">
                <summary className="cursor-pointer font-medium">Supabase User</summary>
                <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                  {JSON.stringify(supabaseUser, null, 2)}
                </pre>
              </details>
              <details className="text-xs">
                <summary className="cursor-pointer font-medium">Database User</summary>
                <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </details>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
