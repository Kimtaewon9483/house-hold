-- ==========================================
-- 가계부 앱 기본 시드 데이터
-- ==========================================

-- ==========================================
-- 1. 시스템 카테고리 데이터 삽입
-- ==========================================

-- 대분류: 식비
INSERT INTO categories (category_name, category_code, description, icon_name, color_code, is_system, is_active, sort_order) VALUES
('식비', 'FOOD', '식료품 및 외식 관련 지출', '🍽️', '#FF6B6B', true, true, 1);

-- 식비 하위 카테고리
INSERT INTO categories (category_name, category_code, parent_category_id, description, icon_name, color_code, is_system, is_active, sort_order) VALUES
('식재료', 'FOOD_GROCERY', (SELECT category_id FROM categories WHERE category_code = 'FOOD'), '마트, 시장에서 구입한 식료품', '🛒', '#FF8E8E', true, true, 1),
('외식', 'FOOD_DINING', (SELECT category_id FROM categories WHERE category_code = 'FOOD'), '식당, 카페에서의 외식비', '🍝', '#FF9999', true, true, 2),
('음료/간식', 'FOOD_SNACK', (SELECT category_id FROM categories WHERE category_code = 'FOOD'), '음료, 간식, 디저트', '🍰', '#FFA4A4', true, true, 3);

-- 대분류: 생활비
INSERT INTO categories (category_name, category_code, description, icon_name, color_code, is_system, is_active, sort_order) VALUES
('생활비', 'LIVING', '일상생활 필수 지출', '🏠', '#4ECDC4', true, true, 2);

-- 생활비 하위 카테고리
INSERT INTO categories (category_name, category_code, parent_category_id, description, icon_name, color_code, is_system, is_active, sort_order) VALUES
('의류', 'LIVING_CLOTHING', (SELECT category_id FROM categories WHERE category_code = 'LIVING'), '의류, 신발, 액세서리', '👔', '#6EDDD6', true, true, 1),
('생필품', 'LIVING_NECESSITY', (SELECT category_id FROM categories WHERE category_code = 'LIVING'), '세제, 화장지 등 생활필수품', '🧴', '#7EEDE7', true, true, 2),
('의료비', 'LIVING_MEDICAL', (SELECT category_id FROM categories WHERE category_code = 'LIVING'), '병원비, 약값, 건강검진', '⚕️', '#8EFDF8', true, true, 3),
('교통비', 'LIVING_TRANSPORT', (SELECT category_id FROM categories WHERE category_code = 'LIVING'), '대중교통, 택시, 주유비', '🚌', '#9EFFFF', true, true, 4),
('기타', 'LIVING_ETC', (SELECT category_id FROM categories WHERE category_code = 'LIVING'), '기타 생활비', '📦', '#AEFFFF', true, true, 5);

-- 대분류: 고정비
INSERT INTO categories (category_name, category_code, description, icon_name, color_code, is_system, is_active, sort_order) VALUES
('고정비', 'FIXED', '매월 고정적으로 나가는 지출', '🏛️', '#45B7D1', true, true, 3);

-- 고정비 하위 카테고리
INSERT INTO categories (category_name, category_code, parent_category_id, description, icon_name, color_code, is_system, is_active, sort_order) VALUES
('주거비', 'FIXED_HOUSING', (SELECT category_id FROM categories WHERE category_code = 'FIXED'), '월세, 관리비, 공과금', '🏡', '#5BC3D7', true, true, 1),
('통신비', 'FIXED_TELECOM', (SELECT category_id FROM categories WHERE category_code = 'FIXED'), '휴대폰, 인터넷, IPTV', '📱', '#6BCFDD', true, true, 2),
('보험료', 'FIXED_INSURANCE', (SELECT category_id FROM categories WHERE category_code = 'FIXED'), '생명보험, 건강보험, 자동차보험', '🛡️', '#7BDBE3', true, true, 3),
('구독료', 'FIXED_SUBSCRIPTION', (SELECT category_id FROM categories WHERE category_code = 'FIXED'), 'Netflix, Spotify 등 구독 서비스', '📺', '#8BE7E9', true, true, 4),
('대출상환', 'FIXED_LOAN', (SELECT category_id FROM categories WHERE category_code = 'FIXED'), '주택대출, 신용대출 상환', '💳', '#9BF3EF', true, true, 5);

-- 대분류: 여가/엔터테인먼트
INSERT INTO categories (category_name, category_code, description, icon_name, color_code, is_system, is_active, sort_order) VALUES
('여가/엔터테인먼트', 'ENTERTAINMENT', '취미, 여가활동 관련 지출', '🎭', '#96CEB4', true, true, 4);

-- 여가 하위 카테고리
INSERT INTO categories (category_name, category_code, parent_category_id, description, icon_name, color_code, is_system, is_active, sort_order) VALUES
('영화/공연', 'ENT_MOVIE', (SELECT category_id FROM categories WHERE category_code = 'ENTERTAINMENT'), '영화, 연극, 콘서트', '🎬', '#A6D4C4', true, true, 1),
('여행', 'ENT_TRAVEL', (SELECT category_id FROM categories WHERE category_code = 'ENTERTAINMENT'), '국내외 여행 경비', '✈️', '#B6DAD4', true, true, 2),
('취미활동', 'ENT_HOBBY', (SELECT category_id FROM categories WHERE category_code = 'ENTERTAINMENT'), '운동, 독서, 취미용품', '🎨', '#C6E0E4', true, true, 3),
('게임/앱', 'ENT_GAME', (SELECT category_id FROM categories WHERE category_code = 'ENTERTAINMENT'), '게임, 앱 결제', '🎮', '#D6E6F4', true, true, 4);

-- 대분류: 교육
INSERT INTO categories (category_name, category_code, description, icon_name, color_code, is_system, is_active, sort_order) VALUES
('교육', 'EDUCATION', '교육 및 자기계발 관련 지출', '📚', '#FECA57', true, true, 5);

-- 교육 하위 카테고리
INSERT INTO categories (category_name, category_code, parent_category_id, description, icon_name, color_code, is_system, is_active, sort_order) VALUES
('도서', 'EDU_BOOK', (SELECT category_id FROM categories WHERE category_code = 'EDUCATION'), '책, 전자책, 오디오북', '📖', '#FDD467', true, true, 1),
('강의/수강료', 'EDU_COURSE', (SELECT category_id FROM categories WHERE category_code = 'EDUCATION'), '온라인 강의, 학원비', '🎓', '#FDDE77', true, true, 2),
('자기계발', 'EDU_SELF', (SELECT category_id FROM categories WHERE category_code = 'EDUCATION'), '세미나, 워크숍, 자격증', '💡', '#FEE887', true, true, 3),
('자격증', 'EDU_CERT', (SELECT category_id FROM categories WHERE category_code = 'EDUCATION'), '자격증 응시료, 교재', '📜', '#FEF297', true, true, 4);

-- 대분류: 투자/저축
INSERT INTO categories (category_name, category_code, description, icon_name, color_code, is_system, is_active, sort_order) VALUES
('투자/저축', 'INVESTMENT', '투자 및 저축 관련', '💰', '#A55EEA', true, true, 6);

-- 투자 하위 카테고리
INSERT INTO categories (category_name, category_code, parent_category_id, description, icon_name, color_code, is_system, is_active, sort_order) VALUES
('적금', 'INV_SAVINGS', (SELECT category_id FROM categories WHERE category_code = 'INVESTMENT'), '은행 적금, 예금', '🏦', '#B56EF0', true, true, 1),
('주식', 'INV_STOCK', (SELECT category_id FROM categories WHERE category_code = 'INVESTMENT'), '주식 투자', '📈', '#C57EF6', true, true, 2),
('펀드', 'INV_FUND', (SELECT category_id FROM categories WHERE category_code = 'INVESTMENT'), '펀드, ETF 투자', '📊', '#D58EFC', true, true, 3),
('기타 투자', 'INV_OTHER', (SELECT category_id FROM categories WHERE category_code = 'INVESTMENT'), '부동산, 코인 등 기타 투자', '🔮', '#E59EFF', true, true, 4);

-- 대분류: 경조사
INSERT INTO categories (category_name, category_code, description, icon_name, color_code, is_system, is_active, sort_order) VALUES
('경조사', 'OCCASIONS', '경조사 관련 지출', '🎁', '#FF9FF3', true, true, 7);

-- 경조사 하위 카테고리
INSERT INTO categories (category_name, category_code, parent_category_id, description, icon_name, color_code, is_system, is_active, sort_order) VALUES
('축의금', 'OCC_CONGRATULATION', (SELECT category_id FROM categories WHERE category_code = 'OCCASIONS'), '결혼식, 돌잔치 축의금', '💝', '#FFA9F5', true, true, 1),
('부의금', 'OCC_CONDOLENCE', (SELECT category_id FROM categories WHERE category_code = 'OCCASIONS'), '장례식 부의금', '🕊️', '#FFB3F7', true, true, 2),
('선물', 'OCC_GIFT', (SELECT category_id FROM categories WHERE category_code = 'OCCASIONS'), '생일선물, 기념일 선물', '🎀', '#FFBDF9', true, true, 3),
('기타', 'OCC_OTHER', (SELECT category_id FROM categories WHERE category_code = 'OCCASIONS'), '기타 경조사 지출', '🌸', '#FFC7FB', true, true, 4);

-- 대분류: 수입
INSERT INTO categories (category_name, category_code, description, icon_name, color_code, is_system, is_active, sort_order) VALUES
('수입', 'INCOME', '각종 수입 관련', '💵', '#28A745', true, true, 8);

-- 수입 하위 카테고리
INSERT INTO categories (category_name, category_code, parent_category_id, description, icon_name, color_code, is_system, is_active, sort_order) VALUES
('급여', 'INC_SALARY', (SELECT category_id FROM categories WHERE category_code = 'INCOME'), '월급, 연봉', '💼', '#38B755', true, true, 1),
('부업', 'INC_SIDEJOB', (SELECT category_id FROM categories WHERE category_code = 'INCOME'), '알바, 프리랜싱', '💻', '#48C765', true, true, 2),
('투자수익', 'INC_INVESTMENT', (SELECT category_id FROM categories WHERE category_code = 'INCOME'), '주식, 펀드 수익', '📈', '#58D775', true, true, 3),
('용돈', 'INC_ALLOWANCE', (SELECT category_id FROM categories WHERE category_code = 'INCOME'), '용돈, 선물받은 돈', '🎉', '#68E785', true, true, 4),
('기타', 'INC_OTHER', (SELECT category_id FROM categories WHERE category_code = 'INCOME'), '기타 수입', '💫', '#78F795', true, true, 5);

-- ==========================================
-- 2. 시스템 결제방법 데이터 삽입
-- ==========================================

-- 대분류: 현금
INSERT INTO payment_methods (method_name, method_code, description, icon_name, is_system, is_active, sort_order) VALUES
('현금', 'CASH', '현금 결제', '💵', true, true, 1);

-- 대분류: 카드
INSERT INTO payment_methods (method_name, method_code, description, icon_name, is_system, is_active, sort_order) VALUES
('카드', 'CARD', '카드 결제 통합', '💳', true, true, 2);

-- 카드 하위 방법
INSERT INTO payment_methods (method_name, method_code, parent_method_id, description, icon_name, is_system, is_active, sort_order) VALUES
('신용카드', 'CARD_CREDIT', (SELECT method_id FROM payment_methods WHERE method_code = 'CARD'), '신용카드 결제', '💳', true, true, 1),
('체크카드', 'CARD_DEBIT', (SELECT method_id FROM payment_methods WHERE method_code = 'CARD'), '체크카드(직불카드) 결제', '💳', true, true, 2),
('선불카드', 'CARD_PREPAID', (SELECT method_id FROM payment_methods WHERE method_code = 'CARD'), '선불카드 결제', '💳', true, true, 3);

-- 대분류: 계좌이체
INSERT INTO payment_methods (method_name, method_code, description, icon_name, is_system, is_active, sort_order) VALUES
('계좌이체', 'TRANSFER', '은행 계좌이체', '🏦', true, true, 3);

-- 계좌이체 하위 방법
INSERT INTO payment_methods (method_name, method_code, parent_method_id, description, icon_name, is_system, is_active, sort_order) VALUES
('온라인 이체', 'TRANSFER_ONLINE', (SELECT method_id FROM payment_methods WHERE method_code = 'TRANSFER'), '인터넷뱅킹, 모바일뱅킹', '💻', true, true, 1),
('ATM 이체', 'TRANSFER_ATM', (SELECT method_id FROM payment_methods WHERE method_code = 'TRANSFER'), 'ATM을 통한 계좌이체', '🏧', true, true, 2);

-- 대분류: 페이
INSERT INTO payment_methods (method_name, method_code, description, icon_name, is_system, is_active, sort_order) VALUES
('페이', 'PAY', '간편결제 서비스', '📱', true, true, 4);

-- 페이 하위 방법
INSERT INTO payment_methods (method_name, method_code, parent_method_id, description, icon_name, is_system, is_active, sort_order) VALUES
('카카오페이', 'PAY_KAKAO', (SELECT method_id FROM payment_methods WHERE method_code = 'PAY'), '카카오페이 결제', '💛', true, true, 1),
('네이버페이', 'PAY_NAVER', (SELECT method_id FROM payment_methods WHERE method_code = 'PAY'), '네이버페이 결제', '💚', true, true, 2),
('삼성페이', 'PAY_SAMSUNG', (SELECT method_id FROM payment_methods WHERE method_code = 'PAY'), '삼성페이 결제', '💙', true, true, 3),
('애플페이', 'PAY_APPLE', (SELECT method_id FROM payment_methods WHERE method_code = 'PAY'), '애플페이 결제', '🍎', true, true, 4),
('페이코', 'PAY_PAYCO', (SELECT method_id FROM payment_methods WHERE method_code = 'PAY'), '페이코 결제', '🔵', true, true, 5),
('토스페이', 'PAY_TOSS', (SELECT method_id FROM payment_methods WHERE method_code = 'PAY'), '토스페이 결제', '💙', true, true, 6);

-- 대분류: 기타
INSERT INTO payment_methods (method_name, method_code, description, icon_name, is_system, is_active, sort_order) VALUES
('기타', 'OTHER', '기타 결제 방법', '🔄', true, true, 5);

-- 기타 하위 방법
INSERT INTO payment_methods (method_name, method_code, parent_method_id, description, icon_name, is_system, is_active, sort_order) VALUES
('상품권', 'OTHER_VOUCHER', (SELECT method_id FROM payment_methods WHERE method_code = 'OTHER'), '상품권, 기프트카드', '🎫', true, true, 1),
('포인트', 'OTHER_POINT', (SELECT method_id FROM payment_methods WHERE method_code = 'OTHER'), '적립 포인트 사용', '⭐', true, true, 2),
('쿠폰', 'OTHER_COUPON', (SELECT method_id FROM payment_methods WHERE method_code = 'OTHER'), '할인 쿠폰', '🎟️', true, true, 3),
('기타', 'OTHER_ETC', (SELECT method_id FROM payment_methods WHERE method_code = 'OTHER'), '기타 결제 수단', '❓', true, true, 4);

-- ==========================================
-- 3. 기본 태그 데이터 (시스템 공통)
-- ==========================================

-- 시스템 공통 태그들을 위한 임시 사용자 및 그룹 (실제로는 사용자 생성 시 개별 복사)
-- 이 데이터는 참조용이며, 실제로는 각 사용자의 초기화 시점에 복사됨

-- ==========================================
-- 시드 데이터 삽입 완료
-- ==========================================

-- 데이터 삽입 확인 쿼리
SELECT 'Categories created:' as info, COUNT(*) as count FROM categories WHERE is_system = true;
SELECT 'Payment methods created:' as info, COUNT(*) as count FROM payment_methods WHERE is_system = true;

-- 카테고리 계층 구조 확인
SELECT 
    p.category_name as parent_category,
    c.category_name as child_category,
    c.category_code,
    c.sort_order
FROM categories c
LEFT JOIN categories p ON c.parent_category_id = p.category_id
WHERE c.is_system = true
ORDER BY COALESCE(p.sort_order, c.sort_order), c.sort_order;

-- 결제방법 계층 구조 확인
SELECT 
    p.method_name as parent_method,
    pm.method_name as child_method,
    pm.method_code,
    pm.sort_order
FROM payment_methods pm
LEFT JOIN payment_methods p ON pm.parent_method_id = p.method_id
WHERE pm.is_system = true
ORDER BY COALESCE(p.sort_order, pm.sort_order), pm.sort_order;