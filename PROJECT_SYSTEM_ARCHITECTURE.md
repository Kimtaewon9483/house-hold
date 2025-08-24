# 가계부 앱 사용자 등록 시스템 설계

## 1. 사용자 등록이 선행되어야 하는 이유

### 1.1 데이터베이스 의존성 분석

가계부 앱의 모든 핵심 테이블이 사용자 정보에 의존하고 있습니다.

```sql
-- 필수 의존성이 있는 테이블들
transactions → user_id, group_id (NOT NULL)
budgets → user_id, group_id (NOT NULL)
categories → created_by, group_id
payment_methods → created_by, group_id
tags → user_id, group_id
favorites → user_id, group_id
transaction_templates → user_id, group_id
attachments → user_id
transaction_history → user_id

```

### 1.2 기능적 의존성

- **데이터 격리**: 사용자별 데이터 분리 필수
- **가족 공유**: 그룹 기반 데이터 공유 기능
- **권한 관리**: admin, member, readonly 역할 구분
- **이력 추적**: 모든 변경사항의 사용자 추적

## 2. 개발 우선순위

### Phase 0: 기반 인프라 (필수 선행)

1. **Supabase 프로젝트 설정**
    - 데이터베이스 스키마 적용
    - Row Level Security (RLS) 정책 설정
    - 환경 변수 구성
2. **사용자 인증 시스템**
    - Supabase Auth 설정
    - 회원가입/로그인 플로우 (이메일/비밀번호)
    - 소셜 로그인 (Google, Apple)
    - 사용자 세션 관리
3. **기본 사용자 그룹 생성 로직**
    - 개인 그룹 자동 생성
    - 기본 멤버십 설정
4. **시스템 기본 데이터 설정**
    - 기본 카테고리 삽입
    - 기본 결제방법 삽입

### Phase 1: 최소 기능 (MVP)

1. **사용자 회원가입/로그인**
2. **기본 가계부 입력** (간단한 폼)
3. **거래 내역 조회** (리스트)
4. **기본 카테고리/결제방법 선택**

## 3. 사용자 등록 플로우 설계

### 3.1 회원가입 프로세스

```tsx
const signUp = async (email: string, password: string, displayName: string) => {
  try {
    // 1. Supabase Auth로 사용자 생성
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName }
      }
    });

    if (authError) throw authError;

    // 2. users 테이블에 추가 정보 저장
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        email,
        username: email.split('@')[0],
        display_name: displayName,
        timezone: 'Asia/Seoul'
      })
      .select()
      .single();

    if (userError) throw userError;

    // 3. 기본 사용자 그룹 생성 (개인 그룹)
    const { data: groupData, error: groupError } = await supabase
      .from('user_groups')
      .insert({
        group_name: `${displayName}의 가계부`,
        description: '개인 가계부',
        created_by: userData.user_id
      })
      .select()
      .single();

    if (groupError) throw groupError;

    // 4. 그룹 멤버십 추가
    const { error: membershipError } = await supabase
      .from('user_group_members')
      .insert({
        user_id: userData.user_id,
        group_id: groupData.group_id,
        role: 'admin'
      });

    if (membershipError) throw membershipError;

    // 5. 초기 데이터 설정
    await initializeUserData(userData.user_id, groupData.group_id);

    return { user: userData, group: groupData };
  } catch (error) {
    console.error('회원가입 실패:', error);
    throw error;
  }
};

```

### 3.2 초기 데이터 설정

```tsx
const initializeUserData = async (userId: number, groupId: number) => {
  try {
    // 1. 시스템 카테고리를 개인용으로 복사
    const { data: systemCategories } = await supabase
      .from('categories')
      .select('*')
      .eq('is_system', true)
      .eq('is_active', true);

    if (systemCategories && systemCategories.length > 0) {
      const userCategories = systemCategories.map(cat => ({
        category_name: cat.category_name,
        category_code: cat.category_code,
        description: cat.description,
        icon_name: cat.icon_name,
        color_code: cat.color_code,
        is_system: false,
        is_active: true,
        sort_order: cat.sort_order,
        created_by: userId,
        group_id: groupId
      }));

      await supabase
        .from('categories')
        .insert(userCategories);
    }

    // 2. 시스템 결제방법을 개인용으로 복사
    const { data: systemPaymentMethods } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('is_system', true)
      .eq('is_active', true);

    if (systemPaymentMethods && systemPaymentMethods.length > 0) {
      const userPaymentMethods = systemPaymentMethods.map(pm => ({
        method_name: pm.method_name,
        method_code: pm.method_code,
        parent_method_id: pm.parent_method_id,
        description: pm.description,
        icon_name: pm.icon_name,
        is_system: false,
        is_active: true,
        sort_order: pm.sort_order,
        created_by: userId,
        group_id: groupId
      }));

      await supabase
        .from('payment_methods')
        .insert(userPaymentMethods);
    }

    // 3. 기본 예산 설정 (선택사항)
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    await supabase
      .from('budgets')
      .insert({
        budget_name: '이번 달 예산',
        budget_amount: 1000000, // 기본 100만원
        budget_period: 'monthly',
        start_date: firstDayOfMonth.toISOString().split('T')[0],
        end_date: lastDayOfMonth.toISOString().split('T')[0],
        alert_threshold: 80,
        user_id: userId,
        group_id: groupId
      });

  } catch (error) {
    console.error('초기 데이터 설정 실패:', error);
    // 초기 데이터 설정 실패는 회원가입을 막지 않음
  }
};

```

### 3.3 소셜 로그인 프로세스

### 3.3.1 Google 로그인

```tsx
const signInWithGoogle = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Google 로그인 실패:', error);
    throw error;
  }
};

```

### 3.3.2 Apple 로그인

```tsx
const signInWithApple = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Apple 로그인 실패:', error);
    throw error;
  }
};

```

### 3.3.3 소셜 로그인 콜백 처리

```tsx
// pages/auth/callback.tsx 또는 app/auth/callback/route.ts
const handleAuthCallback = async () => {
  try {
    // URL에서 코드 파라미터 추출
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) throw error;

    const user = data.user;

    // 기존 사용자인지 확인
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', user.email)
      .single();

    if (!existingUser) {
      // 신규 소셜 로그인 사용자 처리
      await createSocialUser(user);
    } else {
      // 기존 사용자 로그인 시간 업데이트
      await supabase
        .from('users')
        .update({ last_login_at: new Date().toISOString() })
        .eq('email', user.email);
    }

    // 메인 페이지로 리다이렉트
    router.push('/dashboard');
  } catch (error) {
    console.error('소셜 로그인 콜백 처리 실패:', error);
    router.push('/auth/login?error=callback_failed');
  }
};

```

### 3.3.4 소셜 로그인 사용자 생성

```tsx
const createSocialUser = async (authUser: any) => {
  try {
    // 1. users 테이블에 사용자 정보 저장
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        email: authUser.email,
        username: authUser.email?.split('@')[0] || 'user',
        display_name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || '사용자',
        phone: authUser.user_metadata?.phone || null,
        timezone: 'Asia/Seoul'
      })
      .select()
      .single();

    if (userError) throw userError;

    // 2. 기본 사용자 그룹 생성
    const { data: groupData, error: groupError } = await supabase
      .from('user_groups')
      .insert({
        group_name: `${userData.display_name}의 가계부`,
        description: '개인 가계부',
        created_by: userData.user_id
      })
      .select()
      .single();

    if (groupError) throw groupError;

    // 3. 그룹 멤버십 추가
    const { error: membershipError } = await supabase
      .from('user_group_members')
      .insert({
        user_id: userData.user_id,
        group_id: groupData.group_id,
        role: 'admin'
      });

    if (membershipError) throw membershipError;

    // 4. 초기 데이터 설정
    await initializeUserData(userData.user_id, groupData.group_id);

    return { user: userData, group: groupData };
  } catch (error) {
    console.error('소셜 로그인 사용자 생성 실패:', error);
    throw error;
  }
};

```

### 3.4 이메일/비밀번호 로그인 프로세스

```tsx
const signIn = async (email: string, password: string) => {
  try {
    // 1. Supabase Auth 로그인
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) throw authError;

    // 2. 사용자 정보 및 그룹 정보 조회
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(`
        *,
        user_group_members (
          *,
          user_groups (*)
        )
      `)
      .eq('email', email)
      .single();

    if (userError) throw userError;

    // 3. 마지막 로그인 시간 업데이트
    await supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('user_id', userData.user_id);

    return { user: userData, session: authData.session };
  } catch (error) {
    console.error('로그인 실패:', error);
    throw error;
  }
};

```

## 4. 컴포넌트 구조

### 4.1 인증 관련 컴포넌트

```
src/
├── components/
│   ├── auth/
│   │   ├── SignUpForm.tsx
│   │   ├── SignInForm.tsx
│   │   ├── AuthLayout.tsx
│   │   └── ProtectedRoute.tsx
│   └── ...
├── hooks/
│   ├── useAuth.ts
│   ├── useUser.ts
│   └── ...
├── contexts/
│   ├── AuthContext.tsx
│   └── ...
└── services/
    ├── authService.ts
    └── ...

```

### 4.1 인증 관련 컴포넌트

```
src/
├── components/
│   ├── auth/
│   │   ├── SignUpForm.tsx
│   │   ├── SignInForm.tsx
│   │   ├── SocialLoginButtons.tsx
│   │   ├── AuthLayout.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── AuthCallback.tsx
│   └── ...
├── hooks/
│   ├── useAuth.ts
│   ├── useUser.ts
│   └── ...
├── contexts/
│   ├── AuthContext.tsx
│   └── ...
├── pages/
│   └── auth/
│       └── callback.tsx
└── services/
    ├── authService.ts
    └── ...

```

### 4.2 소셜 로그인 버튼 컴포넌트

```tsx
// components/auth/SocialLoginButtons.tsx
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export function SocialLoginButtons() {
  const { signInWithGoogle, signInWithApple, isLoading } = useAuth();

  return (
    <div className="space-y-3">
      <Button
        variant="outline"
        className="w-full"
        onClick={signInWithGoogle}
        disabled={isLoading}
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
          {/* Google 아이콘 SVG */}
        </svg>
        Google로 계속하기
      </Button>

      <Button
        variant="outline"
        className="w-full"
        onClick={signInWithApple}
        disabled={isLoading}
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
          {/* Apple 아이콘 SVG */}
        </svg>
        Apple로 계속하기
      </Button>
    </div>
  );
}

```

### 4.3 인증 상태 관리 (확장)

```tsx
// contexts/AuthContext.tsx
interface AuthContextType {
  user: User | null;
  currentGroup: UserGroup | null;
  isLoading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
}

// hooks/useAuth.ts
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// AuthProvider 구현 예시
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [currentGroup, setCurrentGroup] = useState<UserGroup | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 소셜 로그인 함수들
  const signInWithGoogle = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (error) throw error;
    } catch (error) {
      console.error('Google 로그인 실패:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signInWithApple = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (error) throw error;
    } catch (error) {
      console.error('Apple 로그인 실패:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ... 기타 인증 함수들

  return (
    <AuthContext.Provider value={{
      user,
      currentGroup,
      isLoading,
      signUp,
      signIn,
      signInWithGoogle,
      signInWithApple,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
}

```

## 5. Supabase 소셜 로그인 설정

### 5.1 Google OAuth 설정

### 5.1.1 Google Cloud Console 설정

1. **Google Cloud Console**에서 새 프로젝트 생성
2. **APIs & Services > Credentials**에서 OAuth 2.0 클라이언트 ID 생성
3. **승인된 리디렉션 URI** 추가:
    
    ```
    https://[your-project-ref].supabase.co/auth/v1/callback
    
    ```
    
4. **클라이언트 ID**와 **클라이언트 시크릿** 복사

### 5.1.2 Supabase 설정

1. Supabase Dashboard > Authentication > Providers
2. Google 활성화
3. 클라이언트 ID와 클라이언트 시크릿 입력
4. 추가 설정:
    
    ```json
    {  "access_type": "offline",  "prompt": "consent"}
    
    ```
    

### 5.2 Apple OAuth 설정

### 5.2.1 Apple Developer Console 설정

1. **Apple Developer Account**에서 App ID 생성
2. **Services ID** 생성 및 구성
3. **Sign in with Apple** 활성화
4. **Return URLs** 설정:
    
    ```
    https://[your-project-ref].supabase.co/auth/v1/callback
    
    ```
    
5. **키 파일(.p8)** 생성 및 다운로드

### 5.2.2 Supabase 설정

1. Supabase Dashboard > Authentication > Providers
2. Apple 활성화
3. 필요한 정보 입력:
    - Client ID (Services ID)
    - Team ID
    - Key ID
    - Private Key (.p8 파일 내용)

### 5.3 환경 변수 설정

```
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# 소셜 로그인 설정 (선택사항 - Supabase Dashboard에서 설정 가능)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
APPLE_CLIENT_ID=your_apple_client_id
APPLE_TEAM_ID=your_apple_team_id
APPLE_KEY_ID=your_apple_key_id
APPLE_PRIVATE_KEY=your_apple_private_key

```

## 6. Supabase 설정

### 5.1 Row Level Security (RLS) 정책

```sql
-- users 테이블 RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid()::text = email);

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid()::text = email);

-- transactions 테이블 RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions" ON transactions
    FOR SELECT USING (
        user_id IN (
            SELECT user_id FROM users WHERE email = auth.jwt() ->> 'email'
        )
    );

CREATE POLICY "Users can insert own transactions" ON transactions
    FOR INSERT WITH CHECK (
        user_id IN (
            SELECT user_id FROM users WHERE email = auth.jwt() ->> 'email'
        )
    );

```

### 5.2 데이터베이스 함수

```sql
-- 사용자 생성 시 자동으로 기본 그룹 생성
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- 기본 그룹 생성 로직
  -- (JavaScript에서 처리하는 것을 권장)
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

```

## 6. 개발 시작 체크리스트

### 6.1 환경 설정

- [ ]  Supabase 프로젝트 생성
- [ ]  데이터베이스 스키마 적용
- [ ]  환경 변수 설정 (.env.local)
- [ ]  Supabase 클라이언트 설정

### 6.2 인증 시스템 구현

- [ ]  회원가입 폼 컴포넌트
- [ ]  로그인 폼 컴포넌트
- [ ]  소셜 로그인 버튼 컴포넌트
- [ ]  Google OAuth 설정 (Google Cloud Console)
- [ ]  Apple OAuth 설정 (Apple Developer Console)
- [ ]  소셜 로그인 콜백 페이지
- [ ]  인증 상태 관리 (Context/Hook)
- [ ]  보호된 라우트 설정
- [ ]  로그아웃 기능

### 6.3 초기 데이터 설정

- [ ]  시스템 카테고리 삽입
- [ ]  시스템 결제방법 삽입
- [ ]  사용자 초기화 함수 구현
- [ ]  RLS 정책 적용

### 6.4 기본 UI

- [ ]  레이아웃 컴포넌트
- [ ]  네비게이션 메뉴
- [ ]  로딩 상태 표시
- [ ]  에러 처리

## 7. Next.js App Router에서의 소셜 로그인 구현

### 7.1 콜백 라우트 핸들러

```tsx
// app/auth/callback/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) throw error;

      const user = data.user;

      // 기존 사용자 확인 및 신규 사용자 처리
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', user.email)
        .single();

      if (!existingUser) {
        // 신규 소셜 로그인 사용자 생성
        await createSocialUser(user, supabase);
      }

      return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
    } catch (error) {
      console.error('Auth callback error:', error);
      return NextResponse.redirect(`${requestUrl.origin}/auth/login?error=callback_failed`);
    }
  }

  return NextResponse.redirect(`${requestUrl.origin}/auth/login`);
}

```

### 7.2 로그인 페이지 컴포넌트

```tsx
// app/auth/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SocialLoginButtons } from '@/components/auth/SocialLoginButtons';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signIn(email, password);
      router.push('/dashboard');
    } catch (error) {
      console.error('로그인 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center mb-6">로그인</h1>

      {/* 소셜 로그인 */}
      <SocialLoginButtons />

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">또는</span>
        </div>
      </div>

      {/* 이메일 로그인 */}
      <form onSubmit={handleEmailLogin} className="space-y-4">
        <Input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? '로그인 중...' : '로그인'}
        </Button>
      </form>
    </div>
  );
}

```

## 8. 다음 단계

인증 시스템이 완성되면:

1. **거래 입력 기능** 개발
2. **거래 목록 조회** 기능 개발
3. **카테고리 관리** 기능 개발
4. **예산 관리** 기능 개발

각 기능별로 별도 채팅을 생성하여 세부 구현을 진행하는 것을 권장합니다.