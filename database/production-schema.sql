-- ==========================================
-- 家計簿アプリ データベーススキーマ (プロダクション用)
-- Production Database Schema for House Hold Web
-- ==========================================

-- 拡張機能の有効化
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- 1. ユーザー関連テーブル
-- ==========================================

-- ユーザーテーブル
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    timezone VARCHAR(50) DEFAULT 'Asia/Tokyo',
    language VARCHAR(10) DEFAULT 'ja',
    currency VARCHAR(3) DEFAULT 'JPY',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    
    -- 制約条件
    CONSTRAINT users_email_check CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT users_username_check CHECK (LENGTH(username) >= 3),
    CONSTRAINT users_display_name_check CHECK (LENGTH(display_name) >= 1)
);

-- ユーザーグループテーブル (個人/家族単位)
CREATE TABLE user_groups (
    group_id SERIAL PRIMARY KEY,
    group_name VARCHAR(100) NOT NULL,
    description TEXT,
    group_type VARCHAR(20) DEFAULT 'personal', -- personal, family, shared
    created_by INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    
    -- 制約条件
    CONSTRAINT group_name_not_empty CHECK (LENGTH(TRIM(group_name)) > 0),
    CONSTRAINT valid_group_type CHECK (group_type IN ('personal', 'family', 'shared'))
);

-- ユーザー-グループ メンバーシップテーブル
CREATE TABLE user_group_members (
    membership_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    group_id INTEGER NOT NULL REFERENCES user_groups(group_id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member', -- admin, member, readonly
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    
    -- ユニーク制約 (1ユーザーは1グループに1つのメンバーシップのみ)
    UNIQUE(user_id, group_id),
    
    -- 制約条件
    CONSTRAINT valid_role CHECK (role IN ('admin', 'member', 'readonly'))
);

-- ==========================================
-- 2. カテゴリシステム
-- ==========================================

-- カテゴリテーブル (大分類/小分類統合)
CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL,
    category_code VARCHAR(50), -- システムカテゴリ用コード
    parent_category_id INTEGER REFERENCES categories(category_id) ON DELETE CASCADE,
    description TEXT,
    icon_name VARCHAR(50),
    color_code VARCHAR(7), -- hex color code
    is_system BOOLEAN DEFAULT false, -- システムデフォルトカテゴリかどうか
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_by INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    group_id INTEGER REFERENCES user_groups(group_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 制約条件
    CONSTRAINT category_name_not_empty CHECK (LENGTH(TRIM(category_name)) > 0),
    CONSTRAINT color_code_format CHECK (color_code ~ '^#[0-9A-Fa-f]{6}$' OR color_code IS NULL)
);

-- ==========================================
-- 3. 決済方法システム
-- ==========================================

-- 決済方法テーブル
CREATE TABLE payment_methods (
    method_id SERIAL PRIMARY KEY,
    method_name VARCHAR(100) NOT NULL,
    method_code VARCHAR(50), -- システム決済方法用コード
    parent_method_id INTEGER REFERENCES payment_methods(method_id) ON DELETE CASCADE,
    description TEXT,
    icon_name VARCHAR(50),
    is_system BOOLEAN DEFAULT false, -- システムデフォルト決済方法かどうか
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_by INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    group_id INTEGER REFERENCES user_groups(group_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 制約条件
    CONSTRAINT method_name_not_empty CHECK (LENGTH(TRIM(method_name)) > 0)
);

-- ==========================================
-- 4. 取引関連テーブル
-- ==========================================

-- 取引テーブル (メイン)
CREATE TABLE transactions (
    transaction_id SERIAL PRIMARY KEY,
    transaction_name VARCHAR(200) NOT NULL, -- 取引名/商品名
    amount DECIMAL(15,2) NOT NULL, -- 取引金額
    quantity INTEGER DEFAULT 1, -- 数量
    transaction_date DATE NOT NULL, -- 取引日
    transaction_type VARCHAR(10) NOT NULL, -- income, expense
    category_id INTEGER NOT NULL REFERENCES categories(category_id) ON DELETE RESTRICT,
    payment_method_id INTEGER NOT NULL REFERENCES payment_methods(method_id) ON DELETE RESTRICT,
    
    -- オプション項目
    location VARCHAR(200), -- 購入場所
    memo TEXT, -- メモ/説明
    necessity_level VARCHAR(10), -- essential, optional, luxury
    is_planned BOOLEAN DEFAULT false, -- 計画済み支出かどうか
    is_recurring BOOLEAN DEFAULT false, -- 定期支出かどうか
    recurring_cycle VARCHAR(20), -- daily, weekly, monthly, yearly
    
    -- システム情報
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    group_id INTEGER NOT NULL REFERENCES user_groups(group_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- 制約条件
    CONSTRAINT transaction_name_not_empty CHECK (LENGTH(TRIM(transaction_name)) > 0),
    CONSTRAINT amount_positive CHECK (amount > 0),
    CONSTRAINT quantity_positive CHECK (quantity > 0),
    CONSTRAINT valid_transaction_type CHECK (transaction_type IN ('income', 'expense')),
    CONSTRAINT valid_necessity_level CHECK (necessity_level IN ('essential', 'optional', 'luxury') OR necessity_level IS NULL),
    CONSTRAINT valid_recurring_cycle CHECK (recurring_cycle IN ('daily', 'weekly', 'monthly', 'yearly') OR recurring_cycle IS NULL)
);

-- 取引タグテーブル
CREATE TABLE tags (
    tag_id SERIAL PRIMARY KEY,
    tag_name VARCHAR(50) NOT NULL,
    color_code VARCHAR(7),
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    group_id INTEGER NOT NULL REFERENCES user_groups(group_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- ユニーク制約
    UNIQUE(tag_name, group_id),
    
    -- 制約条件
    CONSTRAINT tag_name_not_empty CHECK (LENGTH(TRIM(tag_name)) > 0),
    CONSTRAINT tag_color_format CHECK (color_code ~ '^#[0-9A-Fa-f]{6}$' OR color_code IS NULL)
);

-- 取引-タグ連結テーブル
CREATE TABLE transaction_tags (
    transaction_id INTEGER NOT NULL REFERENCES transactions(transaction_id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES tags(tag_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 複合主キー
    PRIMARY KEY (transaction_id, tag_id)
);

-- ==========================================
-- 5. 予算管理
-- ==========================================

-- 予算テーブル
CREATE TABLE budgets (
    budget_id SERIAL PRIMARY KEY,
    budget_name VARCHAR(100) NOT NULL,
    budget_amount DECIMAL(15,2) NOT NULL,
    budget_period VARCHAR(20) NOT NULL, -- monthly, yearly, custom
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    category_id INTEGER REFERENCES categories(category_id) ON DELETE CASCADE, -- NULLなら全体予算
    alert_threshold INTEGER DEFAULT 80, -- 警告閾値 (%)
    is_active BOOLEAN DEFAULT true,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    group_id INTEGER NOT NULL REFERENCES user_groups(group_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 制約条件
    CONSTRAINT budget_name_not_empty CHECK (LENGTH(TRIM(budget_name)) > 0),
    CONSTRAINT budget_amount_positive CHECK (budget_amount > 0),
    CONSTRAINT valid_budget_period CHECK (budget_period IN ('monthly', 'yearly', 'custom')),
    CONSTRAINT valid_date_range CHECK (end_date >= start_date),
    CONSTRAINT valid_alert_threshold CHECK (alert_threshold >= 0 AND alert_threshold <= 100)
);

-- ==========================================
-- 6. お気に入りおよびテンプレート
-- ==========================================

-- お気に入り取引テンプレート
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
    
    -- 制約条件
    CONSTRAINT template_name_not_empty CHECK (LENGTH(TRIM(template_name)) > 0),
    CONSTRAINT template_transaction_name_not_empty CHECK (LENGTH(TRIM(transaction_name)) > 0),
    CONSTRAINT template_valid_type CHECK (transaction_type IN ('income', 'expense'))
);

-- お気に入り場所
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
    
    -- 制約条件
    CONSTRAINT location_name_not_empty CHECK (LENGTH(TRIM(location_name)) > 0),
    CONSTRAINT usage_count_non_negative CHECK (usage_count >= 0)
);

-- ==========================================
-- 7. 添付ファイルおよびレシート
-- ==========================================

-- 添付ファイルテーブル
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
    
    -- 制約条件
    CONSTRAINT file_name_not_empty CHECK (LENGTH(TRIM(file_name)) > 0),
    CONSTRAINT file_size_positive CHECK (file_size > 0)
);

-- ==========================================
-- 8. 履歴管理
-- ==========================================

-- 取引変更履歴
CREATE TABLE transaction_history (
    history_id SERIAL PRIMARY KEY,
    transaction_id INTEGER NOT NULL REFERENCES transactions(transaction_id) ON DELETE CASCADE,
    action_type VARCHAR(20) NOT NULL, -- create, update, delete
    changed_data JSONB, -- 変更されたデータ
    changed_by INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    
    -- 制約条件
    CONSTRAINT valid_action_type CHECK (action_type IN ('create', 'update', 'delete'))
);

-- ==========================================
-- 9. インデックス作成
-- ==========================================

-- ユーザー関連インデックス
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_active ON users(is_active);

-- グループ関連インデックス
CREATE INDEX idx_user_groups_created_by ON user_groups(created_by);
CREATE INDEX idx_user_group_members_user_id ON user_group_members(user_id);
CREATE INDEX idx_user_group_members_group_id ON user_group_members(group_id);

-- カテゴリ関連インデックス
CREATE INDEX idx_categories_parent ON categories(parent_category_id);
CREATE INDEX idx_categories_group ON categories(group_id);
CREATE INDEX idx_categories_system ON categories(is_system);

-- 決済方法関連インデックス
CREATE INDEX idx_payment_methods_parent ON payment_methods(parent_method_id);
CREATE INDEX idx_payment_methods_group ON payment_methods(group_id);
CREATE INDEX idx_payment_methods_system ON payment_methods(is_system);

-- 取引関連インデックス (パフォーマンス最適化)
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_group_id ON transactions(group_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_type ON transactions(transaction_type);
CREATE INDEX idx_transactions_category ON transactions(category_id);
CREATE INDEX idx_transactions_payment_method ON transactions(payment_method_id);
CREATE INDEX idx_transactions_date_type ON transactions(transaction_date, transaction_type);
CREATE INDEX idx_transactions_user_date ON transactions(user_id, transaction_date);
CREATE INDEX idx_transactions_group_date ON transactions(group_id, transaction_date);

-- タグ関連インデックス
CREATE INDEX idx_tags_group ON tags(group_id);
CREATE INDEX idx_transaction_tags_transaction ON transaction_tags(transaction_id);
CREATE INDEX idx_transaction_tags_tag ON transaction_tags(tag_id);

-- 予算関連インデックス
CREATE INDEX idx_budgets_user_id ON budgets(user_id);
CREATE INDEX idx_budgets_group_id ON budgets(group_id);
CREATE INDEX idx_budgets_date_range ON budgets(start_date, end_date);
CREATE INDEX idx_budgets_category ON budgets(category_id);

-- テンプレート関連インデックス
CREATE INDEX idx_transaction_templates_user ON transaction_templates(user_id);
CREATE INDEX idx_transaction_templates_group ON transaction_templates(group_id);
CREATE INDEX idx_favorite_locations_user ON favorite_locations(user_id);

-- 添付ファイル関連インデックス
CREATE INDEX idx_attachments_transaction ON attachments(transaction_id);
CREATE INDEX idx_attachments_user ON attachments(user_id);

-- 履歴関連インデックス
CREATE INDEX idx_transaction_history_transaction ON transaction_history(transaction_id);
CREATE INDEX idx_transaction_history_changed_at ON transaction_history(changed_at);

-- ==========================================
-- 10. トリガー関数
-- ==========================================

-- updated_at自動更新関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_atトリガー適用
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_groups_updated_at BEFORE UPDATE ON user_groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON payment_methods FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transaction_templates_updated_at BEFORE UPDATE ON transaction_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 取引履歴自動生成トリガー関数
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

-- 取引履歴トリガー適用
CREATE TRIGGER transaction_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON transactions
    FOR EACH ROW EXECUTE FUNCTION log_transaction_changes();

-- ==========================================
-- 11. ビュー作成 (よく使用するクエリの最適化)
-- ==========================================

-- ユーザー別月別支出サマリビュー
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

-- カテゴリ別支出サマリビュー
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
-- プロダクションスキーマ作成完了
-- ==========================================