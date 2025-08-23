import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { UserMenu } from "./UserMenu";

export default async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/images/logo.svg"
              alt="House Hold Logo"
              width={120}
              height={40}
              className="h-8 w-auto"
              priority
            />
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
            >
              홈
            </Link>
            <Link
              href="/graph"
              className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
            >
              통계
            </Link>
            <Link
              href="/notes"
              className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
            >
              노트
            </Link>
          </nav>

          {/* Right side - Auth buttons or User menu */}
          <UserMenu user={user} />
        </div>
      </div>
    </header>
  );
}

