import { createClient } from "@/lib/supabase/client";
import { createClient as createServerClient } from "@/lib/supabase/server";
import type {
  User,
  UserInsert,
  UserGroup,
  UserGroupInsert,
  UserGroupMemberInsert,
  Category,
  PaymentMethod,
} from "@/lib/database/types";
import { User as SupabaseUser } from "@supabase/supabase-js";

export class AuthService {
  private supabase = createClient();

  /**
   * 이메일/비밀번호로 회원가입
   */
  async signUpWithEmail(email: string, password: string, displayName: string) {
    try {
      // 1. Supabase Auth로 사용자 생성
      const { data: authData, error: authError } =
        await this.supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: displayName,
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Failed to create user");

      // 2. 이메일 확인이 필요한 경우 (이메일 확인 설정이 켜져 있다면)
      if (!authData.session) {
        return {
          user: authData.user,
          needsEmailConfirmation: true,
          message: "Please check your email to confirm your account.",
        };
      }

      // 3. 즉시 로그인된 경우 사용자 데이터 초기화
      await this.initializeUser(authData.user, displayName);

      return {
        user: authData.user,
        needsEmailConfirmation: false,
        message: "Account created successfully!",
      };
    } catch (error) {
      console.error("회원가입 실패:", error);
      throw error;
    }
  }

  /**
   * 이메일/비밀번호로 로그인
   */
  async signInWithEmail(email: string, password: string) {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (!data.user) throw new Error("Login failed");

      // 사용자 DB 정보 확인 및 초기화
      await this.ensureUserExists(data.user);

      return data;
    } catch (error) {
      console.error("로그인 실패:", error);
      throw error;
    }
  }

  /**
   * Google 소셜 로그인
   */
  async signInWithGoogle(redirectTo: string = "/protected") {
    try {
      const callbackUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`;

      const { error } = await this.supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callbackUrl,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error("Google 로그인 실패:", error);
      throw error;
    }
  }

  /**
   * 로그아웃
   */
  async signOut() {
    try {
      const { error } = await this.supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error("로그아웃 실패:", error);
      throw error;
    }
  }

  /**
   * 현재 사용자 세션 확인
   */
  async getSession() {
    try {
      const {
        data: { session },
        error,
      } = await this.supabase.auth.getSession();
      if (error) throw error;
      return session;
    } catch (error) {
      console.error("세션 확인 실패:", error);
      return null;
    }
  }

  /**
   * 사용자 정보 조회 (DB에서)
   */
  async getUserInfo(email: string) {
    try {
      console.log("getUserInfo 시작:", email);
      
      // 먼저 간단한 테스트 쿼리
      console.log("테스트 쿼리 실행 시작");
      try {
        const testQuery = await this.supabase.from('users').select('count').limit(1);
        console.log("테스트 쿼리 결과:", testQuery);
      } catch (testError) {
        console.error("테스트 쿼리 에러:", testError);
      }
      
      // 사용자 조회
      console.log("사용자 쿼리 실행 직전");
      
      const query = this.supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single();
        
      console.log("쿼리 객체 생성됨");
      
      const { data, error } = await query;
      
      console.log("사용자 쿼리 완료 - 데이터:", data, "에러:", error);

      if (error && error.code !== "PGRST116") {
        console.error("사용자 조회 에러:", error);
        throw error;
      }

      if (!data) {
        console.log("사용자 없음");
        return null;
      }

      // 사용자가 있다면 그룹 멤버십도 조회
      const { data: memberships, error: membershipError } = await this.supabase
        .from("user_group_members")
        .select(`
          *,
          user_groups (*)
        `)
        .eq("user_id", data.user_id);

      console.log("멤버십 조회 결과:", memberships);

      if (membershipError) {
        console.error("멤버십 조회 에러:", membershipError);
        // 멤버십 조회 실패해도 사용자 정보는 반환
      }

      return {
        ...data,
        user_group_members: memberships || []
      };
    } catch (error) {
      console.error("사용자 정보 조회 실패:", error);
      console.error("에러 타입:", typeof error);
      console.error("에러 상세:", JSON.stringify(error, null, 2));
      return null;
    }
  }

  /**
   * 사용자가 DB에 존재하는지 확인하고 없다면 생성
   */
  async ensureUserExists(supabaseUser: SupabaseUser) {
    try {
      console.log("ensureUserExists 시작:", supabaseUser.email);
      let userInfo = await this.getUserInfo(supabaseUser.email!);
      console.log("DB에서 사용자 조회 결과:", userInfo);

      if (!userInfo) {
        console.log("사용자가 DB에 없음, 초기화 시작");
        // 사용자가 DB에 없다면 생성
        const displayName =
          supabaseUser.user_metadata?.full_name ||
          supabaseUser.user_metadata?.name ||
          supabaseUser.email?.split("@")[0] ||
          "User";

        console.log("Display name 설정:", displayName);
        await this.initializeUser(supabaseUser, displayName);
        console.log("사용자 초기화 완료, 재조회 시작");
        userInfo = await this.getUserInfo(supabaseUser.email!);
        console.log("초기화 후 사용자 재조회 결과:", userInfo);
      }

      return userInfo;
    } catch (error) {
      console.error("사용자 존재 확인 실패:", error);
      console.error("Error details:", error);
      throw error;
    }
  }

  /**
   * 신규 사용자 초기화 (DB 생성 + 기본 데이터 설정)
   */
  async initializeUser(supabaseUser: SupabaseUser, displayName: string) {
    try {
      console.log("initializeUser 시작:", supabaseUser.email, displayName);

      // 1. users 테이블에 사용자 정보 저장
      const userInsert: UserInsert = {
        email: supabaseUser.email!,
        username: supabaseUser.email!.split("@")[0],
        display_name: displayName,
        phone: supabaseUser.user_metadata?.phone || null,
        timezone: "Asia/Seoul",
        language: "ko",
        currency: "KRW",
      };

      console.log("사용자 데이터 삽입 시작:", userInsert);
      const { data: userData, error: userError } = await this.supabase
        .from("users")
        .insert(userInsert)
        .select()
        .single();

      if (userError) {
        console.error("사용자 생성 에러:", userError);
        throw userError;
      }
      console.log("사용자 생성 성공:", userData);

      // 2. 기본 사용자 그룹 생성 (개인 그룹)
      const groupInsert: UserGroupInsert = {
        group_name: `${displayName}의 가계부`,
        description: "개인 가계부",
        group_type: "personal",
        created_by: userData.user_id,
      };

      const { data: groupData, error: groupError } = await this.supabase
        .from("user_groups")
        .insert(groupInsert)
        .select()
        .single();

      if (groupError) throw groupError;

      // 3. 그룹 멤버십 추가
      const membershipInsert: UserGroupMemberInsert = {
        user_id: userData.user_id,
        group_id: groupData.group_id,
        role: "admin",
      };

      const { error: membershipError } = await this.supabase
        .from("user_group_members")
        .insert(membershipInsert);

      if (membershipError) throw membershipError;

      // 4. 초기 데이터 설정 (시스템 카테고리/결제방법 복사)
      await this.initializeUserData(userData.user_id, groupData.group_id);

      return { user: userData, group: groupData };
    } catch (error) {
      console.error("사용자 초기화 실패:", error);
      throw error;
    }
  }

  /**
   * 사용자 초기 데이터 설정 (시스템 데이터 복사)
   */
  private async initializeUserData(userId: number, groupId: number) {
    try {
      // 1. 시스템 카테고리를 개인용으로 복사
      const { data: systemCategories } = await this.supabase
        .from("categories")
        .select("*")
        .eq("is_system", true)
        .eq("is_active", true);

      if (systemCategories && systemCategories.length > 0) {
        const userCategories = systemCategories.map((cat) => ({
          category_name: cat.category_name,
          category_code: cat.category_code,
          parent_category_id: null, // 나중에 연결
          description: cat.description,
          icon_name: cat.icon_name,
          color_code: cat.color_code,
          is_system: false,
          is_active: true,
          sort_order: cat.sort_order,
          created_by: userId,
          group_id: groupId,
        }));

        // 먼저 부모 카테고리들을 생성
        const parentCategories = systemCategories.filter(
          (cat) => !cat.parent_category_id,
        );
        const childCategories = systemCategories.filter(
          (cat) => cat.parent_category_id,
        );

        // 부모 카테고리 생성
        const { data: insertedParents, error: parentError } =
          await this.supabase
            .from("categories")
            .insert(
              parentCategories.map((cat) => ({
                category_name: cat.category_name,
                category_code: cat.category_code,
                parent_category_id: null,
                description: cat.description,
                icon_name: cat.icon_name,
                color_code: cat.color_code,
                is_system: false,
                is_active: true,
                sort_order: cat.sort_order,
                created_by: userId,
                group_id: groupId,
              })),
            )
            .select();

        if (parentError) throw parentError;

        // 자식 카테고리 생성 (부모 카테고리 매핑)
        if (insertedParents && childCategories.length > 0) {
          const childCategoriesWithParent = childCategories.map((childCat) => {
            const systemParent = systemCategories.find(
              (p) => p.category_id === childCat.parent_category_id,
            );
            const userParent = insertedParents.find(
              (p) => p.category_code === systemParent?.category_code,
            );

            return {
              category_name: childCat.category_name,
              category_code: childCat.category_code,
              parent_category_id: userParent?.category_id || null,
              description: childCat.description,
              icon_name: childCat.icon_name,
              color_code: childCat.color_code,
              is_system: false,
              is_active: true,
              sort_order: childCat.sort_order,
              created_by: userId,
              group_id: groupId,
            };
          });

          await this.supabase
            .from("categories")
            .insert(childCategoriesWithParent);
        }
      }

      // 2. 시스템 결제방법을 개인용으로 복사
      const { data: systemPaymentMethods } = await this.supabase
        .from("payment_methods")
        .select("*")
        .eq("is_system", true)
        .eq("is_active", true);

      if (systemPaymentMethods && systemPaymentMethods.length > 0) {
        // 부모 결제방법들을 먼저 생성
        const parentMethods = systemPaymentMethods.filter(
          (pm) => !pm.parent_method_id,
        );
        const childMethods = systemPaymentMethods.filter(
          (pm) => pm.parent_method_id,
        );

        // 부모 결제방법 생성
        const { data: insertedParentMethods, error: parentMethodError } =
          await this.supabase
            .from("payment_methods")
            .insert(
              parentMethods.map((pm) => ({
                method_name: pm.method_name,
                method_code: pm.method_code,
                parent_method_id: null,
                description: pm.description,
                icon_name: pm.icon_name,
                is_system: false,
                is_active: true,
                sort_order: pm.sort_order,
                created_by: userId,
                group_id: groupId,
              })),
            )
            .select();

        if (parentMethodError) throw parentMethodError;

        // 자식 결제방법 생성
        if (insertedParentMethods && childMethods.length > 0) {
          const childMethodsWithParent = childMethods.map((childMethod) => {
            const systemParent = systemPaymentMethods.find(
              (p) => p.method_id === childMethod.parent_method_id,
            );
            const userParent = insertedParentMethods.find(
              (p) => p.method_code === systemParent?.method_code,
            );

            return {
              method_name: childMethod.method_name,
              method_code: childMethod.method_code,
              parent_method_id: userParent?.method_id || null,
              description: childMethod.description,
              icon_name: childMethod.icon_name,
              is_system: false,
              is_active: true,
              sort_order: childMethod.sort_order,
              created_by: userId,
              group_id: groupId,
            };
          });

          await this.supabase
            .from("payment_methods")
            .insert(childMethodsWithParent);
        }
      }

      // 3. 기본 예산 설정 (현재 월 기준)
      const currentDate = new Date();
      const firstDayOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1,
      );
      const lastDayOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0,
      );

      await this.supabase.from("budgets").insert({
        budget_name: "이번 달 예산",
        budget_amount: 1000000, // 기본 100만원
        budget_period: "monthly",
        start_date: firstDayOfMonth.toISOString().split("T")[0],
        end_date: lastDayOfMonth.toISOString().split("T")[0],
        alert_threshold: 80,
        user_id: userId,
        group_id: groupId,
      });
    } catch (error) {
      console.error("초기 데이터 설정 실패:", error);
      // 초기 데이터 설정 실패는 회원가입을 막지 않음
    }
  }
}

// 싱글톤 인스턴스
export const authService = new AuthService();

