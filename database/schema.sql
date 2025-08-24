-- ==========================================
-- 가계부 앱 데이터베이스 스키마
-- ==========================================

-- 확장 기능 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- 1. 사용자 관련 테이블
-- ==========================================

-- 사용자 테이블
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    timezone VARCHAR(50) DEFAULT 'Asia/Seoul',
    language VARCHAR(10) DEFAULT 'ko',
    currency VARCHAR(3) DEFAULT 'KRW',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    
    -- 인덱스
    CONSTRAINT users_email_check CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT users_username_check CHECK (LENGTH(username) >= 3),
    CONSTRAINT users_display_name_check CHECK (LENGTH(display_name) >= 1)
);

-- 사용자 그룹 테이블 (개인/가족 단위)
CREATE TABLE user_groups (
    group_id SERIAL PRIMARY KEY,
    group_name VARCHAR(100) NOT NULL,
    description TEXT,
    group_type VARCHAR(20) DEFAULT 'personal', -- personal, family, shared
    created_by INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    
    -- 제약조건
    CONSTRAINT group_name_not_empty CHECK (LENGTH(TRIM(group_name)) > 0),
    CONSTRAINT valid_group_type CHECK (group_type IN ('personal', 'family', 'shared'))
);

-- 사용자-그룹 멤버십 테이블
CREATE TABLE user_group_members (
    membership_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    group_id INTEGER NOT NULL REFERENCES user_groups(group_id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member', -- admin, member, readonly
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    
    -- 유니크 제약조건 (한 사용자는 한 그룹에 하나의 멤버십만)
    UNIQUE(user_id, group_id),
    
    -- 제약조건
    CONSTRAINT valid_role CHECK (role IN ('admin', 'member', 'readonly'))
);

-- ==========================================
-- 2. 카테고리 시스템
-- ==========================================

-- 카테고리 테이블 (대분류/소분류 통합)
CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL,
    category_code VARCHAR(50), -- 시스템 카테고리용 코드
    parent_category_id INTEGER REFERENCES categories(category_id) ON DELETE CASCADE,
    description TEXT,
    icon_name VARCHAR(50),
    color_code VARCHAR(7), -- hex color code
    is_system BOOLEAN DEFAULT false, -- 시스템 기본 카테고리 여부
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_by INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    group_id INTEGER REFERENCES user_groups(group_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 제약조건
    CONSTRAINT category_name_not_empty CHECK (LENGTH(TRIM(category_name)) > 0),
    CONSTRAINT color_code_format CHECK (color_code ~ '^#[0-9A-Fa-f]{6}$' OR color_code IS NULL)
);

-- ==========================================
-- 3. 결제 방법 시스템
-- ==========================================

-- 결제 방법 테이블
CREATE TABLE payment_methods (
    method_id SERIAL PRIMARY KEY,
    method_name VARCHAR(100) NOT NULL,
    method_code VARCHAR(50), -- 시스템 결제방법용 코드
    parent_method_id INTEGER REFERENCES payment_methods(method_id) ON DELETE CASCADE,
    description TEXT,
    icon_name VARCHAR(50),
    is_system BOOLEAN DEFAULT false, -- 시스템 기본 결제방법 여부
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_by INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    group_id INTEGER REFERENCES user_groups(group_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 제약조건
    CONSTRAINT method_name_not_empty CHECK (LENGTH(TRIM(method_name)) > 0)
);

-- ==========================================
-- 4. 거래 관련 테이블
-- ==========================================

-- 거래 테이블 (메인)
CREATE TABLE transactions (
    transaction_id SERIAL PRIMARY KEY,
    transaction_name VARCHAR(200) NOT NULL, -- 거래명/상품명
    amount DECIMAL(15,2) NOT NULL, -- 거래 금액
    quantity INTEGER DEFAULT 1, -- 수량
    transaction_date DATE NOT NULL, -- 거래 일자
    transaction_type VARCHAR(10) NOT NULL, -- income, expense
    category_id INTEGER NOT NULL REFERENCES categories(category_id) ON DELETE RESTRICT,
    payment_method_id INTEGER NOT NULL REFERENCES payment_methods(method_id) ON DELETE RESTRICT,
    
    -- 선택 항목들
    location VARCHAR(200), -- 구매 장소
    memo TEXT, -- 메모/설명
    necessity_level VARCHAR(10), -- essential, optional, luxury
    is_planned BOOLEAN DEFAULT false, -- 계획된 지출 여부
    is_recurring BOOLEAN DEFAULT false, -- 정기 지출 여부
    recurring_cycle VARCHAR(20), -- daily, weekly, monthly, yearly
    
    -- 시스템 정보
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    group_id INTEGER NOT NULL REFERENCES user_groups(group_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- 제약조건
    CONSTRAINT transaction_name_not_empty CHECK (LENGTH(TRIM(transaction_name)) > 0),
    CONSTRAINT amount_positive CHECK (amount > 0),
    CONSTRAINT quantity_positive CHECK (quantity > 0),
    CONSTRAINT valid_transaction_type CHECK (transaction_type IN ('income', 'expense')),
    CONSTRAINT valid_necessity_level CHECK (necessity_level IN ('essential', 'optional', 'luxury') OR necessity_level IS NULL),
    CONSTRAINT valid_recurring_cycle CHECK (recurring_cycle IN ('daily', 'weekly', 'monthly', 'yearly') OR recurring_cycle IS NULL)
);

-- 거래 태그 테이블
CREATE TABLE tags (
    tag_id SERIAL PRIMARY KEY,
    tag_name VARCHAR(50) NOT NULL,
    color_code VARCHAR(7),
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    group_id INTEGER NOT NULL REFERENCES user_groups(group_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 유니크 제약조건
    UNIQUE(tag_name, group_id),
    
    -- 제약조건
    CONSTRAINT tag_name_not_empty CHECK (LENGTH(TRIM(tag_name)) > 0),
    CONSTRAINT tag_color_format CHECK (color_code ~ '^#[0-9A-Fa-f]{6}$' OR color_code IS NULL)
);

-- 거래-태그 연결 테이블
CREATE TABLE transaction_tags (
    transaction_id INTEGER NOT NULL REFERENCES transactions(transaction_id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES tags(tag_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 복합 기본키
    PRIMARY KEY (transaction_id, tag_id)
);

-- ==========================================
-- 5. 예산 관리
-- ==========================================

-- 예산 테이블
CREATE TABLE budgets (
    budget_id SERIAL PRIMARY KEY,
    budget_name VARCHAR(100) NOT NULL,
    budget_amount DECIMAL(15,2) NOT NULL,
    budget_period VARCHAR(20) NOT NULL, -- monthly, yearly, custom
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    category_id INTEGER REFERENCES categories(category_id) ON DELETE CASCADE, -- NULL이면 전체 예산
    alert_threshold INTEGER DEFAULT 80, -- 알림 임계치 (%)
    is_active BOOLEAN DEFAULT true,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    group_id INTEGER NOT NULL REFERENCES user_groups(group_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 제약조건
    CONSTRAINT budget_name_not_empty CHECK (LENGTH(TRIM(budget_name)) > 0),
    CONSTRAINT budget_amount_positive CHECK (budget_amount > 0),
    CONSTRAINT valid_budget_period CHECK (budget_period IN ('monthly', 'yearly', 'custom')),
    CONSTRAINT valid_date_range CHECK (end_date >= start_date),
    CONSTRAINT valid_alert_threshold CHECK (alert_threshold >= 0 AND alert_threshold <= 100)
);

-- ==========================================
-- 6. 즐겨찾기 및 템플릿
-- ==========================================

-- 즐겨찾기 거래 템플릿
CREATE TABLE transaction_templates (
    template_id SERIAL PRIMARY KEY,
    template_name VARCHAR(100) NOT NULL,
    transaction_name VARCHAR(200) NOT NULL,
    amount DECIMAL(15,2),
    category_id INTEGER NOT NULL REFERENCES categories(category_id) ON DELETE CASCADE,
    payment_method_id INTEGER NOT NULL REFERENCES payment_methods(method_id) ON DELETE CASCADE,
    transaction_type VARCHAR(10) NOT NULL,
    location VARCHAR(200),
    memo TEXT,
    is_active BOOLEAN DEFAULT true,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    group_id INTEGER NOT NULL REFERENCES user_groups(group_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 제약조건
    CONSTRAINT template_name_not_empty CHECK (LENGTH(TRIM(template_name)) > 0),
    CONSTRAINT template_transaction_name_not_empty CHECK (LENGTH(TRIM(transaction_name)) > 0),
    CONSTRAINT template_valid_type CHECK (transaction_type IN ('income', 'expense'))
);

-- 즐겨찾기 장소
CREATE TABLE favorite_locations (
    location_id SERIAL PRIMARY KEY,
    location_name VARCHAR(200) NOT NULL,
    address TEXT,
    category_id INTEGER REFERENCES categories(category_id) ON DELETE SET NULL,
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP WITH TIME ZONE,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    group_id INTEGER NOT NULL REFERENCES user_groups(group_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 제약조건
    CONSTRAINT location_name_not_empty CHECK (LENGTH(TRIM(location_name)) > 0),
    CONSTRAINT usage_count_non_negative CHECK (usage_count >= 0)
);

-- ==========================================
-- 7. 첨부파일 및 영수증
-- ==========================================

-- 첨부파일 테이블
CREATE TABLE attachments (
    attachment_id SERIAL PRIMARY KEY,
    transaction_id INTEGER NOT NULL REFERENCES transactions(transaction_id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    mime_type VARCHAR(100),
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 제약조건
    CONSTRAINT file_name_not_empty CHECK (LENGTH(TRIM(file_name)) > 0),
    CONSTRAINT file_size_positive CHECK (file_size > 0)
);

-- ==========================================
-- 8. 이력 관리
-- ==========================================

-- 거래 변경 이력
CREATE TABLE transaction_history (
    history_id SERIAL PRIMARY KEY,
    transaction_id INTEGER NOT NULL REFERENCES transactions(transaction_id) ON DELETE CASCADE,
    action_type VARCHAR(20) NOT NULL, -- create, update, delete
    changed_data JSONB, -- 변경된 데이터
    changed_by INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    
    -- 제약조건
    CONSTRAINT valid_action_type CHECK (action_type IN ('create', 'update', 'delete'))
);

-- ==========================================
-- 9. 인덱스 생성
-- ==========================================

-- 사용자 관련 인덱스
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_active ON users(is_active);

-- 그룹 관련 인덱스
CREATE INDEX idx_user_groups_created_by ON user_groups(created_by);
CREATE INDEX idx_user_group_members_user_id ON user_group_members(user_id);
CREATE INDEX idx_user_group_members_group_id ON user_group_members(group_id);

-- 카테고리 관련 인덱스
CREATE INDEX idx_categories_parent ON categories(parent_category_id);
CREATE INDEX idx_categories_group ON categories(group_id);
CREATE INDEX idx_categories_system ON categories(is_system);

-- 결제방법 관련 인덱스
CREATE INDEX idx_payment_methods_parent ON payment_methods(parent_method_id);
CREATE INDEX idx_payment_methods_group ON payment_methods(group_id);
CREATE INDEX idx_payment_methods_system ON payment_methods(is_system);

-- 거래 관련 인덱스 (성능 최적화)
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_group_id ON transactions(group_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_type ON transactions(transaction_type);
CREATE INDEX idx_transactions_category ON transactions(category_id);
CREATE INDEX idx_transactions_payment_method ON transactions(payment_method_id);
CREATE INDEX idx_transactions_date_type ON transactions(transaction_date, transaction_type);
CREATE INDEX idx_transactions_user_date ON transactions(user_id, transaction_date);
CREATE INDEX idx_transactions_group_date ON transactions(group_id, transaction_date);

-- 태그 관련 인덱스
CREATE INDEX idx_tags_group ON tags(group_id);
CREATE INDEX idx_transaction_tags_transaction ON transaction_tags(transaction_id);
CREATE INDEX idx_transaction_tags_tag ON transaction_tags(tag_id);

-- 예산 관련 인덱스
CREATE INDEX idx_budgets_user_id ON budgets(user_id);
CREATE INDEX idx_budgets_group_id ON budgets(group_id);
CREATE INDEX idx_budgets_date_range ON budgets(start_date, end_date);
CREATE INDEX idx_budgets_category ON budgets(category_id);

-- 템플릿 관련 인덱스
CREATE INDEX idx_transaction_templates_user ON transaction_templates(user_id);
CREATE INDEX idx_transaction_templates_group ON transaction_templates(group_id);
CREATE INDEX idx_favorite_locations_user ON favorite_locations(user_id);

-- 첨부파일 관련 인덱스
CREATE INDEX idx_attachments_transaction ON attachments(transaction_id);
CREATE INDEX idx_attachments_user ON attachments(user_id);

-- 이력 관련 인덱스
CREATE INDEX idx_transaction_history_transaction ON transaction_history(transaction_id);
CREATE INDEX idx_transaction_history_changed_at ON transaction_history(changed_at);

-- ==========================================
-- 10. 트리거 함수
-- ==========================================

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_at 트리거 적용
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_groups_updated_at BEFORE UPDATE ON user_groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON payment_methods FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transaction_templates_updated_at BEFORE UPDATE ON transaction_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 거래 이력 자동 생성 트리거 함수
CREATE OR REPLACE FUNCTION log_transaction_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO transaction_history (transaction_id, action_type, changed_data, changed_by)
        VALUES (OLD.transaction_id, 'delete', row_to_json(OLD), OLD.created_by);
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO transaction_history (transaction_id, action_type, changed_data, changed_by)
        VALUES (NEW.transaction_id, 'update', row_to_json(NEW), NEW.created_by);
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO transaction_history (transaction_id, action_type, changed_data, changed_by)
        VALUES (NEW.transaction_id, 'create', row_to_json(NEW), NEW.created_by);
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 거래 이력 트리거 적용
CREATE TRIGGER transaction_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON transactions
    FOR EACH ROW EXECUTE FUNCTION log_transaction_changes();

-- ==========================================
-- 11. 뷰 생성 (자주 사용하는 쿼리 최적화)
-- ==========================================

-- 사용자별 월별 지출 요약 뷰
CREATE VIEW monthly_expense_summary AS
SELECT 
    u.user_id,
    u.display_name,
    ug.group_id,
    ug.group_name,
    DATE_TRUNC('month', t.transaction_date) AS month_year,
    SUM(CASE WHEN t.transaction_type = 'expense' THEN t.amount * t.quantity ELSE 0 END) AS total_expense,
    SUM(CASE WHEN t.transaction_type = 'income' THEN t.amount * t.quantity ELSE 0 END) AS total_income,
    COUNT(CASE WHEN t.transaction_type = 'expense' THEN 1 END) AS expense_count,
    COUNT(CASE WHEN t.transaction_type = 'income' THEN 1 END) AS income_count
FROM users u
JOIN user_group_members ugm ON u.user_id = ugm.user_id
JOIN user_groups ug ON ugm.group_id = ug.group_id
LEFT JOIN transactions t ON u.user_id = t.user_id
WHERE u.is_active = true AND ugm.is_active = true AND ug.is_active = true
GROUP BY u.user_id, u.display_name, ug.group_id, ug.group_name, DATE_TRUNC('month', t.transaction_date);

-- 카테고리별 지출 요약 뷰
CREATE VIEW category_expense_summary AS
SELECT 
    c.category_id,
    c.category_name,
    c.group_id,
    DATE_TRUNC('month', t.transaction_date) AS month_year,
    SUM(t.amount * t.quantity) AS total_amount,
    COUNT(*) AS transaction_count,
    AVG(t.amount * t.quantity) AS avg_amount
FROM categories c
LEFT JOIN transactions t ON c.category_id = t.category_id AND t.transaction_type = 'expense'
WHERE c.is_active = true
GROUP BY c.category_id, c.category_name, c.group_id, DATE_TRUNC('month', t.transaction_date);

-- ==========================================
-- 스키마 생성 완료
-- ==========================================