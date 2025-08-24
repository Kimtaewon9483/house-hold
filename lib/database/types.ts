// ==========================================
// 데이터베이스 타입 정의
// ==========================================

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: UserInsert;
        Update: UserUpdate;
      };
      user_groups: {
        Row: UserGroup;
        Insert: UserGroupInsert;
        Update: UserGroupUpdate;
      };
      user_group_members: {
        Row: UserGroupMember;
        Insert: UserGroupMemberInsert;
        Update: UserGroupMemberUpdate;
      };
      categories: {
        Row: Category;
        Insert: CategoryInsert;
        Update: CategoryUpdate;
      };
      payment_methods: {
        Row: PaymentMethod;
        Insert: PaymentMethodInsert;
        Update: PaymentMethodUpdate;
      };
      transactions: {
        Row: Transaction;
        Insert: TransactionInsert;
        Update: TransactionUpdate;
      };
      tags: {
        Row: Tag;
        Insert: TagInsert;
        Update: TagUpdate;
      };
      transaction_tags: {
        Row: TransactionTag;
        Insert: TransactionTagInsert;
        Update: TransactionTagUpdate;
      };
      budgets: {
        Row: Budget;
        Insert: BudgetInsert;
        Update: BudgetUpdate;
      };
      transaction_templates: {
        Row: TransactionTemplate;
        Insert: TransactionTemplateInsert;
        Update: TransactionTemplateUpdate;
      };
      favorite_locations: {
        Row: FavoriteLocation;
        Insert: FavoriteLocationInsert;
        Update: FavoriteLocationUpdate;
      };
      attachments: {
        Row: Attachment;
        Insert: AttachmentInsert;
        Update: AttachmentUpdate;
      };
      transaction_history: {
        Row: TransactionHistory;
        Insert: TransactionHistoryInsert;
        Update: TransactionHistoryUpdate;
      };
    };
    Views: {
      monthly_expense_summary: {
        Row: MonthlyExpenseSummary;
      };
      category_expense_summary: {
        Row: CategoryExpenseSummary;
      };
    };
  };
}

// ==========================================
// 기본 타입 정의
// ==========================================

export interface User {
  user_id: number;
  email: string;
  username: string;
  display_name: string;
  phone?: string;
  timezone: string;
  language: string;
  currency: string;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
  is_active: boolean;
}

export interface UserInsert {
  email: string;
  username: string;
  display_name: string;
  phone?: string;
  timezone?: string;
  language?: string;
  currency?: string;
}

export interface UserUpdate {
  username?: string;
  display_name?: string;
  phone?: string;
  timezone?: string;
  language?: string;
  currency?: string;
  last_login_at?: string;
  is_active?: boolean;
}

// ==========================================
// 그룹 관련 타입
// ==========================================

export type GroupType = 'personal' | 'family' | 'shared';
export type UserRole = 'admin' | 'member' | 'readonly';

export interface UserGroup {
  group_id: number;
  group_name: string;
  description?: string;
  group_type: GroupType;
  created_by: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface UserGroupInsert {
  group_name: string;
  description?: string;
  group_type?: GroupType;
  created_by: number;
}

export interface UserGroupUpdate {
  group_name?: string;
  description?: string;
  group_type?: GroupType;
  is_active?: boolean;
}

export interface UserGroupMember {
  membership_id: number;
  user_id: number;
  group_id: number;
  role: UserRole;
  joined_at: string;
  is_active: boolean;
}

export interface UserGroupMemberInsert {
  user_id: number;
  group_id: number;
  role?: UserRole;
}

export interface UserGroupMemberUpdate {
  role?: UserRole;
  is_active?: boolean;
}

// ==========================================
// 카테고리 관련 타입
// ==========================================

export interface Category {
  category_id: number;
  category_name: string;
  category_code?: string;
  parent_category_id?: number;
  description?: string;
  icon_name?: string;
  color_code?: string;
  is_system: boolean;
  is_active: boolean;
  sort_order: number;
  created_by?: number;
  group_id?: number;
  created_at: string;
  updated_at: string;
}

export interface CategoryInsert {
  category_name: string;
  category_code?: string;
  parent_category_id?: number;
  description?: string;
  icon_name?: string;
  color_code?: string;
  is_system?: boolean;
  sort_order?: number;
  created_by?: number;
  group_id?: number;
}

export interface CategoryUpdate {
  category_name?: string;
  category_code?: string;
  parent_category_id?: number;
  description?: string;
  icon_name?: string;
  color_code?: string;
  is_active?: boolean;
  sort_order?: number;
}

// 카테고리 트리 구조를 위한 확장 타입
export interface CategoryWithChildren extends Category {
  children?: CategoryWithChildren[];
}

// ==========================================
// 결제방법 관련 타입
// ==========================================

export interface PaymentMethod {
  method_id: number;
  method_name: string;
  method_code?: string;
  parent_method_id?: number;
  description?: string;
  icon_name?: string;
  is_system: boolean;
  is_active: boolean;
  sort_order: number;
  created_by?: number;
  group_id?: number;
  created_at: string;
  updated_at: string;
}

export interface PaymentMethodInsert {
  method_name: string;
  method_code?: string;
  parent_method_id?: number;
  description?: string;
  icon_name?: string;
  is_system?: boolean;
  sort_order?: number;
  created_by?: number;
  group_id?: number;
}

export interface PaymentMethodUpdate {
  method_name?: string;
  method_code?: string;
  parent_method_id?: number;
  description?: string;
  icon_name?: string;
  is_active?: boolean;
  sort_order?: number;
}

// 결제방법 트리 구조를 위한 확장 타입
export interface PaymentMethodWithChildren extends PaymentMethod {
  children?: PaymentMethodWithChildren[];
}

// ==========================================
// 거래 관련 타입
// ==========================================

export type TransactionType = 'income' | 'expense';
export type NecessityLevel = 'essential' | 'optional' | 'luxury';
export type RecurringCycle = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface Transaction {
  transaction_id: number;
  transaction_name: string;
  amount: number;
  quantity: number;
  transaction_date: string;
  transaction_type: TransactionType;
  category_id: number;
  payment_method_id: number;
  location?: string;
  memo?: string;
  necessity_level?: NecessityLevel;
  is_planned: boolean;
  is_recurring: boolean;
  recurring_cycle?: RecurringCycle;
  user_id: number;
  group_id: number;
  created_at: string;
  updated_at: string;
  created_by: number;
}

export interface TransactionInsert {
  transaction_name: string;
  amount: number;
  quantity?: number;
  transaction_date: string;
  transaction_type: TransactionType;
  category_id: number;
  payment_method_id: number;
  location?: string;
  memo?: string;
  necessity_level?: NecessityLevel;
  is_planned?: boolean;
  is_recurring?: boolean;
  recurring_cycle?: RecurringCycle;
  user_id: number;
  group_id: number;
  created_by: number;
}

export interface TransactionUpdate {
  transaction_name?: string;
  amount?: number;
  quantity?: number;
  transaction_date?: string;
  transaction_type?: TransactionType;
  category_id?: number;
  payment_method_id?: number;
  location?: string;
  memo?: string;
  necessity_level?: NecessityLevel;
  is_planned?: boolean;
  is_recurring?: boolean;
  recurring_cycle?: RecurringCycle;
}

// 조인된 거래 데이터를 위한 확장 타입
export interface TransactionWithDetails extends Transaction {
  categories?: Pick<Category, 'category_name' | 'color_code' | 'icon_name'>;
  payment_methods?: Pick<PaymentMethod, 'method_name' | 'icon_name'>;
  tags?: Tag[];
  attachments?: Attachment[];
}

// ==========================================
// 태그 관련 타입
// ==========================================

export interface Tag {
  tag_id: number;
  tag_name: string;
  color_code?: string;
  user_id: number;
  group_id: number;
  created_at: string;
}

export interface TagInsert {
  tag_name: string;
  color_code?: string;
  user_id: number;
  group_id: number;
}

export interface TagUpdate {
  tag_name?: string;
  color_code?: string;
}

export interface TransactionTag {
  transaction_id: number;
  tag_id: number;
  created_at: string;
}

export interface TransactionTagInsert {
  transaction_id: number;
  tag_id: number;
}

export interface TransactionTagUpdate {
  // 연결 테이블이므로 UPDATE 없음
}

// ==========================================
// 예산 관련 타입
// ==========================================

export type BudgetPeriod = 'monthly' | 'yearly' | 'custom';

export interface Budget {
  budget_id: number;
  budget_name: string;
  budget_amount: number;
  budget_period: BudgetPeriod;
  start_date: string;
  end_date: string;
  category_id?: number;
  alert_threshold: number;
  is_active: boolean;
  user_id: number;
  group_id: number;
  created_at: string;
  updated_at: string;
}

export interface BudgetInsert {
  budget_name: string;
  budget_amount: number;
  budget_period: BudgetPeriod;
  start_date: string;
  end_date: string;
  category_id?: number;
  alert_threshold?: number;
  user_id: number;
  group_id: number;
}

export interface BudgetUpdate {
  budget_name?: string;
  budget_amount?: number;
  budget_period?: BudgetPeriod;
  start_date?: string;
  end_date?: string;
  category_id?: number;
  alert_threshold?: number;
  is_active?: boolean;
}

// 예산 진행률을 포함한 확장 타입
export interface BudgetWithProgress extends Budget {
  spent_amount: number;
  remaining_amount: number;
  progress_percentage: number;
  is_over_threshold: boolean;
  categories?: Pick<Category, 'category_name' | 'color_code'>;
}

// ==========================================
// 템플릿 및 즐겨찾기 관련 타입
// ==========================================

export interface TransactionTemplate {
  template_id: number;
  template_name: string;
  transaction_name: string;
  amount?: number;
  category_id: number;
  payment_method_id: number;
  transaction_type: TransactionType;
  location?: string;
  memo?: string;
  is_active: boolean;
  user_id: number;
  group_id: number;
  created_at: string;
  updated_at: string;
}

export interface TransactionTemplateInsert {
  template_name: string;
  transaction_name: string;
  amount?: number;
  category_id: number;
  payment_method_id: number;
  transaction_type: TransactionType;
  location?: string;
  memo?: string;
  user_id: number;
  group_id: number;
}

export interface TransactionTemplateUpdate {
  template_name?: string;
  transaction_name?: string;
  amount?: number;
  category_id?: number;
  payment_method_id?: number;
  transaction_type?: TransactionType;
  location?: string;
  memo?: string;
  is_active?: boolean;
}

export interface FavoriteLocation {
  location_id: number;
  location_name: string;
  address?: string;
  category_id?: number;
  usage_count: number;
  last_used_at?: string;
  user_id: number;
  group_id: number;
  created_at: string;
}

export interface FavoriteLocationInsert {
  location_name: string;
  address?: string;
  category_id?: number;
  user_id: number;
  group_id: number;
}

export interface FavoriteLocationUpdate {
  location_name?: string;
  address?: string;
  category_id?: number;
  usage_count?: number;
  last_used_at?: string;
}

// ==========================================
// 첨부파일 및 이력 관련 타입
// ==========================================

export interface Attachment {
  attachment_id: number;
  transaction_id: number;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  mime_type?: string;
  user_id: number;
  uploaded_at: string;
}

export interface AttachmentInsert {
  transaction_id: number;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  mime_type?: string;
  user_id: number;
}

export interface AttachmentUpdate {
  file_name?: string;
  file_path?: string;
}

export type HistoryActionType = 'create' | 'update' | 'delete';

export interface TransactionHistory {
  history_id: number;
  transaction_id: number;
  action_type: HistoryActionType;
  changed_data: any; // JSON 데이터
  changed_by: number;
  changed_at: string;
  ip_address?: string;
  user_agent?: string;
}

export interface TransactionHistoryInsert {
  transaction_id: number;
  action_type: HistoryActionType;
  changed_data: any;
  changed_by: number;
  ip_address?: string;
  user_agent?: string;
}

export interface TransactionHistoryUpdate {
  // 이력 데이터는 수정되지 않음
}

// ==========================================
// 뷰 타입 정의
// ==========================================

export interface MonthlyExpenseSummary {
  user_id: number;
  display_name: string;
  group_id: number;
  group_name: string;
  month_year: string;
  total_expense: number;
  total_income: number;
  expense_count: number;
  income_count: number;
}

export interface CategoryExpenseSummary {
  category_id: number;
  category_name: string;
  group_id: number;
  month_year: string;
  total_amount: number;
  transaction_count: number;
  avg_amount: number;
}

// ==========================================
// API 응답을 위한 유틸리티 타입
// ==========================================

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  count?: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface FilterParams {
  start_date?: string;
  end_date?: string;
  category_id?: number;
  payment_method_id?: number;
  transaction_type?: TransactionType;
  search?: string;
  tags?: number[];
}

export interface TransactionFilters extends FilterParams, PaginationParams {}

// ==========================================
// 통계 및 분석을 위한 타입
// ==========================================

export interface ExpenseByCategory {
  category_id: number;
  category_name: string;
  total_amount: number;
  transaction_count: number;
  percentage: number;
  color_code?: string;
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expense: number;
  net_amount: number;
  transaction_count: number;
}

export interface DashboardStats {
  current_month_expense: number;
  current_month_income: number;
  previous_month_expense: number;
  previous_month_income: number;
  total_transactions: number;
  active_budgets: number;
  budget_utilization: number;
  top_categories: ExpenseByCategory[];
  monthly_trend: MonthlyTrend[];
}