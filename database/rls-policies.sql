-- ==========================================
-- Row Level Security (RLS) 정책 설정
-- ==========================================

-- ==========================================
-- 1. RLS 활성화
-- ==========================================

-- 모든 테이블에서 RLS 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorite_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_history ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 2. 헬퍼 함수 생성
-- ==========================================

-- 현재 사용자의 user_id를 가져오는 함수
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT user_id 
        FROM users 
        WHERE email = auth.jwt() ->> 'email'
        AND is_active = true
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 현재 사용자가 속한 그룹 ID들을 가져오는 함수
CREATE OR REPLACE FUNCTION get_user_group_ids()
RETURNS INTEGER[] AS $$
BEGIN
    RETURN ARRAY(
        SELECT ugm.group_id
        FROM user_group_members ugm
        JOIN users u ON ugm.user_id = u.user_id
        WHERE u.email = auth.jwt() ->> 'email'
        AND u.is_active = true
        AND ugm.is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 현재 사용자가 특정 그룹의 관리자인지 확인하는 함수
CREATE OR REPLACE FUNCTION is_group_admin(group_id_param INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS(
        SELECT 1
        FROM user_group_members ugm
        JOIN users u ON ugm.user_id = u.user_id
        WHERE u.email = auth.jwt() ->> 'email'
        AND ugm.group_id = group_id_param
        AND ugm.role = 'admin'
        AND ugm.is_active = true
        AND u.is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 현재 사용자가 특정 그룹에 대한 읽기 권한이 있는지 확인
CREATE OR REPLACE FUNCTION has_group_read_access(group_id_param INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS(
        SELECT 1
        FROM user_group_members ugm
        JOIN users u ON ugm.user_id = u.user_id
        WHERE u.email = auth.jwt() ->> 'email'
        AND ugm.group_id = group_id_param
        AND ugm.is_active = true
        AND u.is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 현재 사용자가 특정 그룹에 대한 쓰기 권한이 있는지 확인
CREATE OR REPLACE FUNCTION has_group_write_access(group_id_param INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS(
        SELECT 1
        FROM user_group_members ugm
        JOIN users u ON ugm.user_id = u.user_id
        WHERE u.email = auth.jwt() ->> 'email'
        AND ugm.group_id = group_id_param
        AND ugm.role IN ('admin', 'member')
        AND ugm.is_active = true
        AND u.is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 3. Users 테이블 RLS 정책
-- ==========================================

-- 사용자는 자신의 정보만 조회 가능
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (
        email = auth.jwt() ->> 'email'
    );

-- 사용자는 자신의 정보만 수정 가능
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (
        email = auth.jwt() ->> 'email'
    );

-- 신규 사용자 생성은 Supabase Auth를 통해서만 가능 (서비스에서 처리)
CREATE POLICY "Enable insert for service role only" ON users
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- ==========================================
-- 4. User Groups 테이블 RLS 정책
-- ==========================================

-- 사용자는 자신이 속한 그룹만 조회 가능
CREATE POLICY "Users can view own groups" ON user_groups
    FOR SELECT USING (
        group_id = ANY(get_user_group_ids())
    );

-- 그룹 생성은 인증된 사용자만 가능
CREATE POLICY "Authenticated users can create groups" ON user_groups
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND
        created_by = get_current_user_id()
    );

-- 그룹 수정은 해당 그룹의 관리자만 가능
CREATE POLICY "Group admins can update groups" ON user_groups
    FOR UPDATE USING (
        is_group_admin(group_id)
    );

-- 그룹 삭제는 해당 그룹의 관리자만 가능
CREATE POLICY "Group admins can delete groups" ON user_groups
    FOR DELETE USING (
        is_group_admin(group_id)
    );

-- ==========================================
-- 5. User Group Members 테이블 RLS 정책
-- ==========================================

-- 사용자는 자신이 속한 그룹의 멤버십 정보만 조회 가능
CREATE POLICY "Users can view group memberships" ON user_group_members
    FOR SELECT USING (
        group_id = ANY(get_user_group_ids())
    );

-- 그룹 관리자는 멤버를 추가할 수 있음
CREATE POLICY "Group admins can add members" ON user_group_members
    FOR INSERT WITH CHECK (
        is_group_admin(group_id)
    );

-- 그룹 관리자는 멤버 정보를 수정할 수 있음
CREATE POLICY "Group admins can update memberships" ON user_group_members
    FOR UPDATE USING (
        is_group_admin(group_id)
    );

-- 그룹 관리자는 멤버를 제거할 수 있음 (자신 제외)
CREATE POLICY "Group admins can remove members" ON user_group_members
    FOR DELETE USING (
        is_group_admin(group_id) AND
        user_id != get_current_user_id()
    );

-- 사용자는 자신의 멤버십을 탈퇴할 수 있음
CREATE POLICY "Users can leave groups" ON user_group_members
    FOR DELETE USING (
        user_id = get_current_user_id()
    );

-- ==========================================
-- 6. Categories 테이블 RLS 정책
-- ==========================================

-- 시스템 카테고리는 모든 인증된 사용자가 조회 가능
CREATE POLICY "System categories are viewable by all" ON categories
    FOR SELECT USING (
        is_system = true
    );

-- 사용자는 자신이 속한 그룹의 카테고리만 조회 가능
CREATE POLICY "Users can view group categories" ON categories
    FOR SELECT USING (
        is_system = false AND
        has_group_read_access(group_id)
    );

-- 그룹 멤버는 카테고리를 생성할 수 있음
CREATE POLICY "Group members can create categories" ON categories
    FOR INSERT WITH CHECK (
        is_system = false AND
        has_group_write_access(group_id) AND
        created_by = get_current_user_id()
    );

-- 카테고리 생성자나 그룹 관리자는 수정 가능
CREATE POLICY "Category owners or group admins can update" ON categories
    FOR UPDATE USING (
        is_system = false AND
        (created_by = get_current_user_id() OR is_group_admin(group_id))
    );

-- 카테고리 생성자나 그룹 관리자는 삭제 가능
CREATE POLICY "Category owners or group admins can delete" ON categories
    FOR DELETE USING (
        is_system = false AND
        (created_by = get_current_user_id() OR is_group_admin(group_id))
    );

-- ==========================================
-- 7. Payment Methods 테이블 RLS 정책
-- ==========================================

-- 시스템 결제방법은 모든 인증된 사용자가 조회 가능
CREATE POLICY "System payment methods are viewable by all" ON payment_methods
    FOR SELECT USING (
        is_system = true
    );

-- 사용자는 자신이 속한 그룹의 결제방법만 조회 가능
CREATE POLICY "Users can view group payment methods" ON payment_methods
    FOR SELECT USING (
        is_system = false AND
        has_group_read_access(group_id)
    );

-- 그룹 멤버는 결제방법을 생성할 수 있음
CREATE POLICY "Group members can create payment methods" ON payment_methods
    FOR INSERT WITH CHECK (
        is_system = false AND
        has_group_write_access(group_id) AND
        created_by = get_current_user_id()
    );

-- 결제방법 생성자나 그룹 관리자는 수정 가능
CREATE POLICY "Payment method owners or group admins can update" ON payment_methods
    FOR UPDATE USING (
        is_system = false AND
        (created_by = get_current_user_id() OR is_group_admin(group_id))
    );

-- 결제방법 생성자나 그룹 관리자는 삭제 가능
CREATE POLICY "Payment method owners or group admins can delete" ON payment_methods
    FOR DELETE USING (
        is_system = false AND
        (created_by = get_current_user_id() OR is_group_admin(group_id))
    );

-- ==========================================
-- 8. Transactions 테이블 RLS 정책
-- ==========================================

-- 사용자는 자신이 속한 그룹의 거래 내역만 조회 가능
CREATE POLICY "Users can view group transactions" ON transactions
    FOR SELECT USING (
        has_group_read_access(group_id)
    );

-- 그룹 멤버는 거래를 생성할 수 있음
CREATE POLICY "Group members can create transactions" ON transactions
    FOR INSERT WITH CHECK (
        has_group_write_access(group_id) AND
        user_id = get_current_user_id()
    );

-- 거래 생성자나 그룹 관리자는 거래를 수정할 수 있음
CREATE POLICY "Transaction owners or group admins can update" ON transactions
    FOR UPDATE USING (
        user_id = get_current_user_id() OR is_group_admin(group_id)
    );

-- 거래 생성자나 그룹 관리자는 거래를 삭제할 수 있음
CREATE POLICY "Transaction owners or group admins can delete" ON transactions
    FOR DELETE USING (
        user_id = get_current_user_id() OR is_group_admin(group_id)
    );

-- ==========================================
-- 9. Tags 테이블 RLS 정책
-- ==========================================

-- 사용자는 자신이 속한 그룹의 태그만 조회 가능
CREATE POLICY "Users can view group tags" ON tags
    FOR SELECT USING (
        has_group_read_access(group_id)
    );

-- 그룹 멤버는 태그를 생성할 수 있음
CREATE POLICY "Group members can create tags" ON tags
    FOR INSERT WITH CHECK (
        has_group_write_access(group_id) AND
        user_id = get_current_user_id()
    );

-- 태그 생성자나 그룹 관리자는 수정 가능
CREATE POLICY "Tag owners or group admins can update" ON tags
    FOR UPDATE USING (
        user_id = get_current_user_id() OR is_group_admin(group_id)
    );

-- 태그 생성자나 그룹 관리자는 삭제 가능
CREATE POLICY "Tag owners or group admins can delete" ON tags
    FOR DELETE USING (
        user_id = get_current_user_id() OR is_group_admin(group_id)
    );

-- ==========================================
-- 10. Transaction Tags 테이블 RLS 정책
-- ==========================================

-- 거래 태그는 해당 거래의 조회 권한이 있는 사용자만 볼 수 있음
CREATE POLICY "Users can view transaction tags" ON transaction_tags
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM transactions t
            WHERE t.transaction_id = transaction_tags.transaction_id
            AND has_group_read_access(t.group_id)
        )
    );

-- 거래 생성자만 태그를 추가할 수 있음
CREATE POLICY "Transaction owners can add tags" ON transaction_tags
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM transactions t
            WHERE t.transaction_id = transaction_tags.transaction_id
            AND t.user_id = get_current_user_id()
        )
    );

-- 거래 생성자만 태그를 제거할 수 있음
CREATE POLICY "Transaction owners can remove tags" ON transaction_tags
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM transactions t
            WHERE t.transaction_id = transaction_tags.transaction_id
            AND t.user_id = get_current_user_id()
        )
    );

-- ==========================================
-- 11. Budgets 테이블 RLS 정책
-- ==========================================

-- 사용자는 자신이 속한 그룹의 예산만 조회 가능
CREATE POLICY "Users can view group budgets" ON budgets
    FOR SELECT USING (
        has_group_read_access(group_id)
    );

-- 그룹 멤버는 예산을 생성할 수 있음
CREATE POLICY "Group members can create budgets" ON budgets
    FOR INSERT WITH CHECK (
        has_group_write_access(group_id) AND
        user_id = get_current_user_id()
    );

-- 예산 생성자나 그룹 관리자는 수정 가능
CREATE POLICY "Budget owners or group admins can update" ON budgets
    FOR UPDATE USING (
        user_id = get_current_user_id() OR is_group_admin(group_id)
    );

-- 예산 생성자나 그룹 관리자는 삭제 가능
CREATE POLICY "Budget owners or group admins can delete" ON budgets
    FOR DELETE USING (
        user_id = get_current_user_id() OR is_group_admin(group_id)
    );

-- ==========================================
-- 12. Transaction Templates 테이블 RLS 정책
-- ==========================================

-- 사용자는 자신이 속한 그룹의 템플릿만 조회 가능
CREATE POLICY "Users can view group templates" ON transaction_templates
    FOR SELECT USING (
        has_group_read_access(group_id)
    );

-- 그룹 멤버는 템플릿을 생성할 수 있음
CREATE POLICY "Group members can create templates" ON transaction_templates
    FOR INSERT WITH CHECK (
        has_group_write_access(group_id) AND
        user_id = get_current_user_id()
    );

-- 템플릿 생성자나 그룹 관리자는 수정 가능
CREATE POLICY "Template owners or group admins can update" ON transaction_templates
    FOR UPDATE USING (
        user_id = get_current_user_id() OR is_group_admin(group_id)
    );

-- 템플릿 생성자나 그룹 관리자는 삭제 가능
CREATE POLICY "Template owners or group admins can delete" ON transaction_templates
    FOR DELETE USING (
        user_id = get_current_user_id() OR is_group_admin(group_id)
    );

-- ==========================================
-- 13. Favorite Locations 테이블 RLS 정책
-- ==========================================

-- 사용자는 자신이 속한 그룹의 즐겨찾기 장소만 조회 가능
CREATE POLICY "Users can view group favorite locations" ON favorite_locations
    FOR SELECT USING (
        has_group_read_access(group_id)
    );

-- 그룹 멤버는 즐겨찾기 장소를 생성할 수 있음
CREATE POLICY "Group members can create favorite locations" ON favorite_locations
    FOR INSERT WITH CHECK (
        has_group_write_access(group_id) AND
        user_id = get_current_user_id()
    );

-- 장소 생성자나 그룹 관리자는 수정 가능
CREATE POLICY "Location owners or group admins can update" ON favorite_locations
    FOR UPDATE USING (
        user_id = get_current_user_id() OR is_group_admin(group_id)
    );

-- 장소 생성자나 그룹 관리자는 삭제 가능
CREATE POLICY "Location owners or group admins can delete" ON favorite_locations
    FOR DELETE USING (
        user_id = get_current_user_id() OR is_group_admin(group_id)
    );

-- ==========================================
-- 14. Attachments 테이블 RLS 정책
-- ==========================================

-- 첨부파일은 해당 거래의 조회 권한이 있는 사용자만 볼 수 있음
CREATE POLICY "Users can view transaction attachments" ON attachments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM transactions t
            WHERE t.transaction_id = attachments.transaction_id
            AND has_group_read_access(t.group_id)
        )
    );

-- 거래 생성자만 첨부파일을 추가할 수 있음
CREATE POLICY "Transaction owners can add attachments" ON attachments
    FOR INSERT WITH CHECK (
        user_id = get_current_user_id() AND
        EXISTS (
            SELECT 1 FROM transactions t
            WHERE t.transaction_id = attachments.transaction_id
            AND t.user_id = get_current_user_id()
        )
    );

-- 첨부파일 업로드자나 거래 생성자만 삭제할 수 있음
CREATE POLICY "Attachment owners can delete attachments" ON attachments
    FOR DELETE USING (
        user_id = get_current_user_id() OR
        EXISTS (
            SELECT 1 FROM transactions t
            WHERE t.transaction_id = attachments.transaction_id
            AND t.user_id = get_current_user_id()
        )
    );

-- ==========================================
-- 15. Transaction History 테이블 RLS 정책
-- ==========================================

-- 거래 이력은 해당 거래의 조회 권한이 있는 사용자만 볼 수 있음
CREATE POLICY "Users can view transaction history" ON transaction_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM transactions t
            WHERE t.transaction_id = transaction_history.transaction_id
            AND has_group_read_access(t.group_id)
        )
    );

-- 거래 이력은 시스템에서 자동으로 생성되므로 직접 추가/수정/삭제 불가
-- (트리거를 통해서만 관리됨)

-- ==========================================
-- 16. 뷰에 대한 RLS 정책
-- ==========================================

-- 월별 지출 요약 뷰는 기본 테이블의 RLS를 따름
-- 카테고리별 지출 요약 뷰도 마찬가지

-- ==========================================
-- RLS 정책 설정 완료
-- ==========================================

-- 정책 확인 쿼리
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;