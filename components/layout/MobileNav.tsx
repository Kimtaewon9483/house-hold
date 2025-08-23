"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, User, BarChart3, FileText, Plus } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface MobileNavProps {
  user: SupabaseUser | null;
}

export function MobileNav({ user }: MobileNavProps) {
  const pathname = usePathname();

  // 로그인 후 현재 페이지로 돌아가기 위한 returnUrl 생성
  const loginHref = user 
    ? "/protected" 
    : `/auth/login?next=${encodeURIComponent(pathname)}`;

  const navItems = [
    { href: "/", icon: Home, label: "홈" },
    { href: "/graph", icon: BarChart3, label: "통계" },
    { href: "/add", icon: Plus, label: "추가", isPrimary: true },
    { href: "/notes", icon: FileText, label: "노트" },
    { 
      href: loginHref, 
      icon: User, 
      label: user ? "프로필" : "로그인" 
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 pb-safe">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map(({ href, icon: Icon, label, isPrimary }) => {
          const isActive = pathname === href;
          
          if (isPrimary) {
            return (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center justify-center w-12 h-12 bg-blue-600 rounded-full text-white shadow-lg hover:bg-blue-700 transition-colors"
              >
                <Icon className="h-6 w-6" />
              </Link>
            );
          }

          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors min-w-[60px] ${
                isActive
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? "text-blue-600" : ""}`} />
              <span className={`text-xs mt-1 ${isActive ? "text-blue-600 font-medium" : ""}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}