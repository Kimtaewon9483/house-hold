import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const supabase = await createClient();
    
    // 현재 로그인된 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('데이터 복사 시작:', user.email);

    // 사용자 정보 조회
    const { data: userData } = await supabase
      .from('users')
      .select(`
        user_id,
        user_group_members (
          group_id,
          user_groups (*)
        )
      `)
      .eq('email', user.email!)
      .single();

    if (!userData || !userData.user_group_members?.[0]) {
      return NextResponse.json({ error: 'User or group not found' }, { status: 404 });
    }

    const userId = userData.user_id;
    const groupId = userData.user_group_members[0].group_id;

    // 기존 개인 데이터 확인
    const { data: existingCategories } = await supabase
      .from('categories')
      .select('category_id')
      .eq('group_id', groupId)
      .eq('is_system', false);

    const { data: existingPaymentMethods } = await supabase
      .from('payment_methods')
      .select('method_id')
      .eq('group_id', groupId)
      .eq('is_system', false);

    const { data: existingBudgets } = await supabase
      .from('budgets')
      .select('budget_id')
      .eq('group_id', groupId);

    console.log('기존 데이터 확인:', {
      categories: existingCategories?.length || 0,
      paymentMethods: existingPaymentMethods?.length || 0,
      budgets: existingBudgets?.length || 0
    });

    // 시스템 데이터 복사 실행
    await initializeUserData(supabase, userId, groupId);
    
    console.log('데이터 복사 완료');
    return NextResponse.json({ 
      message: 'Data copied successfully',
      userId: userId,
      groupId: groupId
    });

  } catch (error) {
    console.error('데이터 복사 실패:', error);
    return NextResponse.json({ 
      error: 'Failed to copy data', 
      details: error 
    }, { status: 500 });
  }
}

// 동일한 초기화 함수 (기존 API와 공유)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

      // 자식 카테고리 생성
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
      const parentMethods = systemPaymentMethods.filter((pm: any) => !pm.parent_method_id);
      const childMethods = systemPaymentMethods.filter((pm: any) => pm.parent_method_id);

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

    // 3. 기본 예산 설정
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    await supabase.from('budgets').insert({
      budget_name: '이번 달 예산',
      budget_amount: 1000000,
      budget_period: 'monthly',
      start_date: firstDayOfMonth.toISOString().split('T')[0],
      end_date: lastDayOfMonth.toISOString().split('T')[0],
      alert_threshold: 80,
      user_id: userId,
      group_id: groupId,
    });

  } catch (error) {
    console.error('초기 데이터 설정 실패:', error);
    throw error;
  }
}