import { create } from 'zustand';
import { User as SupabaseUser } from '@supabase/supabase-js';
import type { User, UserGroup, UserGroupMember } from '@/lib/database/types';

interface AuthState {
  // Supabase Auth 사용자
  supabaseUser: SupabaseUser | null;
  // 우리 데이터베이스의 사용자 정보
  user: User | null;
  // 현재 활성 그룹
  currentGroup: UserGroup | null;
  // 사용자 그룹 멤버십 정보
  groupMemberships: (UserGroupMember & { user_groups: UserGroup })[] | null;
  // 로딩 상태
  isLoading: boolean;
  isInitialized: boolean;
  
  // Actions
  setSupabaseUser: (user: SupabaseUser | null) => void;
  setUser: (user: User | null) => void;
  setCurrentGroup: (group: UserGroup | null) => void;
  setGroupMemberships: (memberships: (UserGroupMember & { user_groups: UserGroup })[] | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  supabaseUser: null,
  user: null,
  currentGroup: null,
  groupMemberships: null,
  isLoading: true,
  isInitialized: false,

  // Actions
  setSupabaseUser: (supabaseUser) => {
    set({ supabaseUser });
  },

  setUser: (user) => {
    set({ user });
  },

  setCurrentGroup: (currentGroup) => {
    set({ currentGroup });
  },

  setGroupMemberships: (groupMemberships) => {
    set({ 
      groupMemberships,
      // 첫 번째 그룹을 기본 그룹으로 설정 (개인 그룹이 보통 첫 번째)
      currentGroup: groupMemberships?.[0]?.user_groups || null
    });
  },

  setLoading: (isLoading) => {
    set({ isLoading });
  },

  setInitialized: (isInitialized) => {
    set({ isInitialized });
  },

  signOut: () => {
    set({
      supabaseUser: null,
      user: null,
      currentGroup: null,
      groupMemberships: null,
      isLoading: false,
      isInitialized: true,
    });
  },
}));

// Computed getters (selectors)
export const useAuthSelectors = () => {
  const state = useAuthStore();
  
  return {
    ...state,
    
    // 완전히 인증된 사용자인지 확인 (Supabase Auth + DB 사용자 정보 모두 있음)
    isAuthenticated: !!(state.supabaseUser && state.user),
    
    // 현재 그룹에서의 역할
    currentRole: state.groupMemberships?.find(
      m => m.group_id === state.currentGroup?.group_id
    )?.role || null,
    
    // 현재 그룹의 관리자인지
    isCurrentGroupAdmin: state.groupMemberships?.find(
      m => m.group_id === state.currentGroup?.group_id
    )?.role === 'admin',
    
    // 사용 가능한 모든 그룹
    availableGroups: state.groupMemberships?.map(m => m.user_groups) || [],
  };
};