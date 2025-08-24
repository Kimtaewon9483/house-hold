'use client';

import { createContext, useContext, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/lib/stores/authStore';
import { authService } from '@/lib/services/authService';

const AuthContext = createContext<{}>({});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const {
    setSupabaseUser,
    setUser,
    setGroupMemberships,
    setLoading,
    setInitialized,
    signOut: storeSignOut,
  } = useAuthStore();

  useEffect(() => {
    const supabase = createClient();
    
    // 초기 세션 확인
    const initializeAuth = async () => {
      try {
        setLoading(true);
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setSupabaseUser(session.user);
          
          // DB에서 사용자 정보 조회
          const userInfo = await authService.getUserInfo(session.user.email!);
          if (userInfo) {
            setUser(userInfo);
            setGroupMemberships(userInfo.user_group_members || []);
          }
        }
      } catch (error) {
        console.error('Auth 초기화 실패:', error);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    initializeAuth();

    // Auth 상태 변화 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (event === 'SIGNED_IN' && session?.user) {
          setSupabaseUser(session.user);
          
          // 서버 API를 통한 사용자 초기화
          try {
            console.log('서버 API로 사용자 초기화 시작...', session.user.email);
            
            const response = await fetch('/api/auth/initialize', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
            });

            const result = await response.json();
            console.log('서버 API 응답:', result);

            if (response.ok && result.user) {
              // 사용자 정보 설정
              setUser(result.user);
              setGroupMemberships([]);
              console.log('AuthProvider: 서버 API 사용자 설정 완료');
            } else {
              console.error('서버 API 사용자 초기화 실패:', result);
            }
          } catch (error) {
            console.error('서버 API 호출 실패:', error);
            
            // 서버 API 실패 시 기존 클라이언트 로직으로 폴백
            try {
              console.log('클라이언트 로직으로 폴백...');
              const userInfo = await authService.ensureUserExists(session.user);
              if (userInfo) {
                setUser(userInfo);
                setGroupMemberships(userInfo.user_group_members || []);
                console.log('AuthProvider: 클라이언트 폴백 성공');
              }
            } catch (fallbackError) {
              console.error('클라이언트 폴백도 실패:', fallbackError);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          storeSignOut();
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          setSupabaseUser(session.user);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [setSupabaseUser, setUser, setGroupMemberships, setLoading, setInitialized, storeSignOut]);

  return (
    <AuthContext.Provider value={{}}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);