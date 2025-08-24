import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/protected";

  if (code) {
    const supabase = await createClient();
    
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) throw error;
      
      // 소셜 로그인 사용자의 경우 사용자 초기화 확인은 AuthProvider에서 처리됨
      console.log('OAuth callback successful for:', data.user?.email);
      
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";
      
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    } catch (error) {
      console.error('OAuth callback error:', error);
      return NextResponse.redirect(`${origin}/auth/login?error=oauth_failed`);
    }
  }

  // code가 없는 경우
  return NextResponse.redirect(`${origin}/auth/login?error=no_code`);
}