-- ==========================================
-- 추가 시드 데이터 - 한국 특화 카테고리 및 최신 페이 서비스
-- ==========================================

-- ==========================================
-- 1. 추가 한국 특화 카테고리
-- ==========================================

-- 배달음식 카테고리 (외식의 하위 카테고리)
INSERT INTO categories (category_name, category_code, parent_category_id, description, icon_name, color_code, is_system, is_active, sort_order) VALUES
('배달음식', 'FOOD_DELIVERY', (SELECT category_id FROM categories WHERE category_code = 'FOOD_DINING' AND is_system = true), '배달주문 음식', '🛵', '#FFB3B3', true, true, 4);

-- 온라인쇼핑 카테고리 (생활비의 하위 카테고리)
INSERT INTO categories (category_name, category_code, parent_category_id, description, icon_name, color_code, is_system, is_active, sort_order) VALUES
('온라인쇼핑', 'LIVING_ONLINE', (SELECT category_id FROM categories WHERE category_code = 'LIVING' AND is_system = true), '온라인 쇼핑몰 구매', '💻', '#BEFFFF', true, true, 6);

-- 뷰티/미용 카테고리 (생활비의 하위 카테고리)
INSERT INTO categories (category_name, category_code, parent_category_id, description, icon_name, color_code, is_system, is_active, sort_order) VALUES
('뷰티/미용', 'LIVING_BEAUTY', (SELECT category_id FROM categories WHERE category_code = 'LIVING' AND is_system = true), '화장품, 미용실, 네일샵', '💄', '#CEFFFF', true, true, 7);

-- 반려동물 카테고리 (생활비의 하위 카테고리)
INSERT INTO categories (category_name, category_code, parent_category_id, description, icon_name, color_code, is_system, is_active, sort_order) VALUES
('반려동물', 'LIVING_PET', (SELECT category_id FROM categories WHERE category_code = 'LIVING' AND is_system = true), '반려동물 용품, 병원비, 사료', '🐕', '#DEFFFF', true, true, 8);

-- 온라인 강의 (교육의 하위 카테고리)
INSERT INTO categories (category_name, category_code, parent_category_id, description, icon_name, color_code, is_system, is_active, sort_order) VALUES
('온라인 강의', 'EDU_ONLINE', (SELECT category_id FROM categories WHERE category_code = 'EDUCATION' AND is_system = true), '인프런, 패스트캠퍼스 등 온라인 강의', '💻', '#FEF5A7', true, true, 5);

-- 헬스/피트니스 (여가/엔터테인먼트의 하위 카테고리)
INSERT INTO categories (category_name, category_code, parent_category_id, description, icon_name, color_code, is_system, is_active, sort_order) VALUES
('헬스/피트니스', 'ENT_FITNESS', (SELECT category_id FROM categories WHERE category_code = 'ENTERTAINMENT' AND is_system = true), '헬스장, 필라테스, 요가', '💪', '#D6F6E4', true, true, 5);

-- 카페 (음료/간식의 형제 카테고리로 식비 하위)
INSERT INTO categories (category_name, category_code, parent_category_id, description, icon_name, color_code, is_system, is_active, sort_order) VALUES
('카페', 'FOOD_CAFE', (SELECT category_id FROM categories WHERE category_code = 'FOOD' AND is_system = true), '카페, 커피숍', '☕', '#FFB4B4', true, true, 4);

-- ==========================================
-- 2. 추가 최신 페이 서비스
-- ==========================================

-- 제로페이 추가 (페이의 하위 방법)
INSERT INTO payment_methods (method_name, method_code, parent_method_id, description, icon_name, is_system, is_active, sort_order) VALUES
('제로페이', 'PAY_ZEROPAY', (SELECT method_id FROM payment_methods WHERE method_code = 'PAY' AND is_system = true), '제로페이 결제', '0️⃣', true, true, 7);

-- 신한페이 추가 (페이의 하위 방법)  
INSERT INTO payment_methods (method_name, method_code, parent_method_id, description, icon_name, is_system, is_active, sort_order) VALUES
('신한페이', 'PAY_SHINHAN', (SELECT method_id FROM payment_methods WHERE method_code = 'PAY' AND is_system = true), '신한페이 결제', '🏦', true, true, 8);

-- 하나페이 추가 (페이의 하위 방법)
INSERT INTO payment_methods (method_name, method_code, parent_method_id, description, icon_name, is_system, is_active, sort_order) VALUES
('하나페이', 'PAY_HANA', (SELECT method_id FROM payment_methods WHERE method_code = 'PAY' AND is_system = true), '하나페이 결제', '🟢', true, true, 9);

-- 우리페이 추가 (페이의 하위 방법)
INSERT INTO payment_methods (method_name, method_code, parent_method_id, description, icon_name, is_system, is_active, sort_order) VALUES
('우리페이', 'PAY_WOORI', (SELECT method_id FROM payment_methods WHERE method_code = 'PAY' AND is_system = true), '우리페이 결제', '🔵', true, true, 10);

-- L페이 추가 (페이의 하위 방법)
INSERT INTO payment_methods (method_name, method_code, parent_method_id, description, icon_name, is_system, is_active, sort_order) VALUES
('L페이', 'PAY_LOTTE', (SELECT method_id FROM payment_methods WHERE method_code = 'PAY' AND is_system = true), 'L페이 결제', '❤️', true, true, 11);

-- 11페이 추가 (페이의 하위 방법)
INSERT INTO payment_methods (method_name, method_code, parent_method_id, description, icon_name, is_system, is_active, sort_order) VALUES
('11페이', 'PAY_11STREET', (SELECT method_id FROM payment_methods WHERE method_code = 'PAY' AND is_system = true), '11페이 결제', '1️⃣', true, true, 12);

-- ==========================================
-- 3. 추가 기타 결제방법
-- ==========================================

-- 가상화폐 추가 (기타의 하위 방법)
INSERT INTO payment_methods (method_name, method_code, parent_method_id, description, icon_name, is_system, is_active, sort_order) VALUES
('가상화폐', 'OTHER_CRYPTO', (SELECT method_id FROM payment_methods WHERE method_code = 'OTHER' AND is_system = true), '비트코인, 이더리움 등', '₿', true, true, 5);

-- 간편송금 추가 (계좌이체의 하위 방법)
INSERT INTO payment_methods (method_name, method_code, parent_method_id, description, icon_name, is_system, is_active, sort_order) VALUES
('간편송금', 'TRANSFER_EASY', (SELECT method_id FROM payment_methods WHERE method_code = 'TRANSFER' AND is_system = true), '토스, 카카오뱅크 간편송금', '💸', true, true, 3);

-- ==========================================
-- 데이터 삽입 확인 쿼리
-- ==========================================

-- 추가된 카테고리 확인
SELECT 'Added Categories:' as info, COUNT(*) as count 
FROM categories 
WHERE is_system = true 
AND category_code IN ('FOOD_DELIVERY', 'LIVING_ONLINE', 'LIVING_BEAUTY', 'LIVING_PET', 'EDU_ONLINE', 'ENT_FITNESS', 'FOOD_CAFE');

-- 추가된 결제방법 확인
SELECT 'Added Payment Methods:' as info, COUNT(*) as count 
FROM payment_methods 
WHERE is_system = true 
AND method_code IN ('PAY_ZEROPAY', 'PAY_SHINHAN', 'PAY_HANA', 'PAY_WOORI', 'PAY_LOTTE', 'PAY_11STREET', 'OTHER_CRYPTO', 'TRANSFER_EASY');

-- 전체 시스템 데이터 현황
SELECT 'Total System Categories:' as info, COUNT(*) as count FROM categories WHERE is_system = true;
SELECT 'Total System Payment Methods:' as info, COUNT(*) as count FROM payment_methods WHERE is_system = true;