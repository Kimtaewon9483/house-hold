'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { authService } from '@/lib/services/authService';
import { useAuthStore } from '@/lib/stores/authStore';

interface LogoutButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showIcon?: boolean;
  children?: React.ReactNode;
}

export function LogoutButton({ 
  variant = 'outline', 
  size = 'default',
  className,
  showIcon = true,
  children
}: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { signOut: storeSignOut } = useAuthStore();

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      
      // Supabase에서 로그아웃
      await authService.signOut();
      
      // Store 상태 초기화
      storeSignOut();
      
      // 로그인 페이지로 리다이렉트
      router.push('/auth/login');
      
    } catch (error) {
      console.error('로그아웃 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleLogout}
      disabled={isLoading}
    >
      {showIcon && <LogOut size="16" className={children ? "mr-2" : ""} />}
      {children || (isLoading ? "로그아웃 중..." : "로그아웃")}
    </Button>
  );
}