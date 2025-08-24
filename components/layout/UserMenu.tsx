"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, User, LogOut, Settings } from "lucide-react";
import { useAuthSelectors } from "@/lib/stores/authStore";
import { LogoutButton } from "@/components/LogoutButton";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface UserMenuProps {
  user: SupabaseUser | null;
}

export function UserMenu({ user: serverUser }: UserMenuProps) {
  const pathname = usePathname();
  const { isAuthenticated, user: dbUser, isInitialized } = useAuthSelectors();
  
  // 클라이언트 상태가 초기화되지 않았으면 서버 상태를 사용
  const shouldShowUserMenu = isInitialized ? isAuthenticated : !!serverUser;
  const displayName = dbUser?.display_name || serverUser?.email?.split('@')[0] || 'User';

  if (shouldShowUserMenu) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="p-2 hover:bg-gray-100"
            aria-label="사용자 메뉴"
          >
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline text-sm font-medium">{displayName}</span>
              <Menu className="h-4 w-4" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem asChild>
            <Link href="/protected" className="flex items-center cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>프로필</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>설정</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild className="p-0">
            <LogoutButton 
              variant="ghost" 
              size="sm" 
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // 로그인 후 현재 페이지로 돌아가기 위한 returnUrl 생성
  const loginHref = `/auth/login?next=${encodeURIComponent(pathname)}`;
  const signUpHref = `/auth/sign-up?next=${encodeURIComponent(pathname)}`;

  return (
    <div className="flex items-center space-x-2">
      <Button variant="ghost" size="sm" asChild className="">
        <Link href={loginHref}>로그인</Link>
      </Button>
      <Button
        size="sm"
        asChild
        className="bg-blue-600 hover:bg-blue-700 hidden sm:inline-flex"
      >
        <Link href={signUpHref}>회원가입</Link>
      </Button>
    </div>
  );
}

