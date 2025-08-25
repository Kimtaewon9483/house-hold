import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { 
  UserInsert, 
  UserGroupInsert, 
  UserGroupMemberInsert 
} from '@/lib/database/types';

// 사용자 초기 데이터 설정 함수
async function initializeUserData(supabase: any, userId: number, groupId: number) {
  try {
    // 1. 시스템 카테고리를 개인용으로 복사
    const { data: systemCategories } = await supabase
      .from('categories')
      .select('*')
      .eq('is_system', true)
      .eq('is_active', true);

    if (systemCategories && systemCategories.length > 0) {
      // 부모 카테고리들을 먼저 생성
      const parentCategories = systemCategories.filter((cat: any) => !cat.parent_category_id);
      const childCategories = systemCategories.filter((cat: any) => cat.parent_category_id);

      // 부모 카테고리 생성
      const { data: insertedParents } = await supabase
        .from('categories')
        .insert(
          parentCategories.map((cat: any) => ({
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
          }))
        )
        .select();

      // 자식 카테고리 생성 (부모 카테고리 매핑)
      if (insertedParents && childCategories.length > 0) {
        const childCategoriesWithParent = childCategories.map((childCat: any) => {
          const systemParent = systemCategories.find((p: any) => p.category_id === childCat.parent_category_id);
          const userParent = insertedParents.find((p: any) => p.category_code === systemParent?.category_code);
          
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

        await supabase
          .from('categories')
          .insert(childCategoriesWithParent);
      }
    }

    // 2. 시스템 결제방법을 개인용으로 복사
    const { data: systemPaymentMethods } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('is_system', true)
      .eq('is_active', true);

    if (systemPaymentMethods && systemPaymentMethods.length > 0) {
      // 부모 결제방법들을 먼저 생성
      const parentMethods = systemPaymentMethods.filter((pm: any) => !pm.parent_method_id);
      const childMethods = systemPaymentMethods.filter((pm: any) => pm.parent_method_id);

      // 부모 결제방법 생성
      const { data: insertedParentMethods } = await supabase
        .from('payment_methods')
        .insert(
          parentMethods.map((pm: any) => ({
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
          }))
        )
        .select();

      // 자식 결제방법 생성
      if (insertedParentMethods && childMethods.length > 0) {
        const childMethodsWithParent = childMethods.map((childMethod: any) => {
          const systemParent = systemPaymentMethods.find((p: any) => p.method_id === childMethod.parent_method_id);
          const userParent = insertedParentMethods.find((p: any) => p.method_code === systemParent?.method_code);
          
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

        await supabase
          .from('payment_methods')
          .insert(childMethodsWithParent);
      }
    }

    // 3. 기본 예산 설정 (현재 월 기준)
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    await supabase.from('budgets').insert({
      budget_name: '이번 달 예산',
      budget_amount: 1000000, // 기본 100만원
      budget_period: 'monthly',
      start_date: firstDayOfMonth.toISOString().split('T')[0],
      end_date: lastDayOfMonth.toISOString().split('T')[0],
      alert_threshold: 80,
      user_id: userId,
      group_id: groupId,
    });

  } catch (error) {
    console.error('초기 데이터 설정 실패:', error);
    // 초기 데이터 설정 실패는 회원가입을 막지 않음
  }
}

export async function POST() {
  try {
    const supabase = await createClient();
    
    // 현재 로그인된 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('서버: 사용자 초기화 시작', user.email);

    // DB에서 사용자 확인
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', user.email!)
      .single();

    if (existingUser) {
      console.log('서버: 사용자 이미 존재');
      return NextResponse.json({ user: existingUser, message: 'User already exists' });
    }

    // 사용자 생성
    const displayName = user.user_metadata?.full_name || 
                       user.user_metadata?.name || 
                       user.email?.split('@')[0] || 
                       'User';

    const userInsert: UserInsert = {
      email: user.email!,
      username: user.email!.split('@')[0],
      display_name: displayName,
      phone: user.user_metadata?.phone || null,
      timezone: 'Asia/Seoul',
      language: 'ko',
      currency: 'KRW',
    };

    console.log('서버: 사용자 생성 시작');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert(userInsert)
      .select()
      .single();

    if (userError) {
      console.error('서버: 사용자 생성 실패', userError);
      throw userError;
    }

    // 기본 그룹 생성
    const groupInsert: UserGroupInsert = {
      group_name: `${displayName}의 가계부`,
      description: '개인 가계부',
      group_type: 'personal',
      created_by: userData.user_id,
    };

    const { data: groupData, error: groupError } = await supabase
      .from('user_groups')
      .insert(groupInsert)
      .select()
      .single();

    if (groupError) throw groupError;

    // 그룹 멤버십 생성
    const membershipInsert: UserGroupMemberInsert = {
      user_id: userData.user_id,
      group_id: groupData.group_id,
      role: 'admin',
    };

    const { error: membershipError } = await supabase
      .from('user_group_members')
      .insert(membershipInsert);

    if (membershipError) throw membershipError;

    // 4. 시스템 데이터 복사 (카테고리, 결제방법, 기본 예산)
    console.log('서버: 시스템 데이터 복사 시작');
    await initializeUserData(supabase, userData.user_id, groupData.group_id);
    console.log('서버: 시스템 데이터 복사 완료');

    console.log('서버: 사용자 초기화 완료');
    return NextResponse.json({ 
      user: userData, 
      group: groupData, 
      message: 'User initialized successfully' 
    });

  } catch (error) {
    console.error('서버: 사용자 초기화 실패', error);
    return NextResponse.json({ 
      error: 'Failed to initialize user', 
      details: error 
    }, { status: 500 });
  }
}