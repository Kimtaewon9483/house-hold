-- ==========================================
-- 家計簿アプリ システム共通データ (日本語)
-- Production Seed Data (Japanese) for House Hold Web
-- ==========================================

-- ==========================================
-- 1. システムカテゴリデータ挿入
-- ==========================================

-- 大分類: 食費
INSERT INTO categories (category_name, category_code, description, icon_name, color_code, is_system, is_active, sort_order) VALUES
('食費', 'FOOD', '食料品および外食関連の支出', '🍽️', '#FF6B6B', true, true, 1);

-- 食費 下位カテゴリ
INSERT INTO categories (category_name, category_code, parent_category_id, description, icon_name, color_code, is_system, is_active, sort_order) VALUES
('食材', 'FOOD_GROCERY', (SELECT category_id FROM categories WHERE category_code = 'FOOD'), 'スーパー、市場で購入した食料品', '🛒', '#FF8E8E', true, true, 1),
('外食', 'FOOD_DINING', (SELECT category_id FROM categories WHERE category_code = 'FOOD'), 'レストラン、カフェでの外食費', '🍝', '#FF9999', true, true, 2),
('飲み物・おやつ', 'FOOD_SNACK', (SELECT category_id FROM categories WHERE category_code = 'FOOD'), '飲み物、おやつ、デザート', '🍰', '#FFA4A4', true, true, 3),
('デリバリー', 'FOOD_DELIVERY', (SELECT category_id FROM categories WHERE category_code = 'FOOD'), 'デリバリー注文料理', '🛵', '#FFB3B3', true, true, 4),
('カフェ', 'FOOD_CAFE', (SELECT category_id FROM categories WHERE category_code = 'FOOD'), 'カフェ、コーヒーショップ', '☕', '#FFB4B4', true, true, 5);

-- 大分類: 生活費
INSERT INTO categories (category_name, category_code, description, icon_name, color_code, is_system, is_active, sort_order) VALUES
('生活費', 'LIVING', '日常生活必須支出', '🏠', '#4ECDC4', true, true, 2);

-- 生活費 下位カテゴリ
INSERT INTO categories (category_name, category_code, parent_category_id, description, icon_name, color_code, is_system, is_active, sort_order) VALUES
('衣類', 'LIVING_CLOTHING', (SELECT category_id FROM categories WHERE category_code = 'LIVING'), '衣類、靴、アクセサリー', '👔', '#6EDDD6', true, true, 1),
('生活必需品', 'LIVING_NECESSITY', (SELECT category_id FROM categories WHERE category_code = 'LIVING'), '洗剤、ティッシュなど生活必需品', '🧴', '#7EEDE7', true, true, 2),
('医療費', 'LIVING_MEDICAL', (SELECT category_id FROM categories WHERE category_code = 'LIVING'), '病院代、薬代、健康診断', '⚕️', '#8EFDF8', true, true, 3),
('交通費', 'LIVING_TRANSPORT', (SELECT category_id FROM categories WHERE category_code = 'LIVING'), '公共交通、タクシー、ガソリン代', '🚌', '#9EFFFF', true, true, 4),
('オンラインショッピング', 'LIVING_ONLINE', (SELECT category_id FROM categories WHERE category_code = 'LIVING'), 'オンラインショッピングモール購入', '💻', '#BEFFFF', true, true, 5),
('美容', 'LIVING_BEAUTY', (SELECT category_id FROM categories WHERE category_code = 'LIVING'), '化粧品、美容院、ネイルサロン', '💄', '#CEFFFF', true, true, 6),
('ペット', 'LIVING_PET', (SELECT category_id FROM categories WHERE category_code = 'LIVING'), 'ペット用品、病院代、餌', '🐕', '#DEFFFF', true, true, 7),
('その他', 'LIVING_ETC', (SELECT category_id FROM categories WHERE category_code = 'LIVING'), 'その他生活費', '📦', '#AEFFFF', true, true, 8);

-- 大分類: 固定費
INSERT INTO categories (category_name, category_code, description, icon_name, color_code, is_system, is_active, sort_order) VALUES
('固定費', 'FIXED', '毎月固定的にかかる支出', '🏛️', '#45B7D1', true, true, 3);

-- 固定費 下位カテゴリ
INSERT INTO categories (category_name, category_code, parent_category_id, description, icon_name, color_code, is_system, is_active, sort_order) VALUES
('住居費', 'FIXED_HOUSING', (SELECT category_id FROM categories WHERE category_code = 'FIXED'), '家賃、管理費、光熱費', '🏡', '#5BC3D7', true, true, 1),
('通信費', 'FIXED_TELECOM', (SELECT category_id FROM categories WHERE category_code = 'FIXED'), '携帯電話、インターネット、IPTV', '📱', '#6BCFDD', true, true, 2),
('保険料', 'FIXED_INSURANCE', (SELECT category_id FROM categories WHERE category_code = 'FIXED'), '生命保険、健康保険、自動車保険', '🛡️', '#7BDBE3', true, true, 3),
('サブスクリプション', 'FIXED_SUBSCRIPTION', (SELECT category_id FROM categories WHERE category_code = 'FIXED'), 'Netflix、Spotify等サブスクリプションサービス', '📺', '#8BE7E9', true, true, 4),
('ローン返済', 'FIXED_LOAN', (SELECT category_id FROM categories WHERE category_code = 'FIXED'), '住宅ローン、信用ローン返済', '💳', '#9BF3EF', true, true, 5);

-- 大分類: レジャー・エンターテインメント
INSERT INTO categories (category_name, category_code, description, icon_name, color_code, is_system, is_active, sort_order) VALUES
('レジャー・エンターテインメント', 'ENTERTAINMENT', '趣味、レジャー活動関連支出', '🎭', '#96CEB4', true, true, 4);

-- レジャー 下位カテゴリ
INSERT INTO categories (category_name, category_code, parent_category_id, description, icon_name, color_code, is_system, is_active, sort_order) VALUES
('映画・公演', 'ENT_MOVIE', (SELECT category_id FROM categories WHERE category_code = 'ENTERTAINMENT'), '映画、演劇、コンサート', '🎬', '#A6D4C4', true, true, 1),
('旅行', 'ENT_TRAVEL', (SELECT category_id FROM categories WHERE category_code = 'ENTERTAINMENT'), '国内外旅行費用', '✈️', '#B6DAD4', true, true, 2),
('趣味', 'ENT_HOBBY', (SELECT category_id FROM categories WHERE category_code = 'ENTERTAINMENT'), '運動、読書、趣味用品', '🎨', '#C6E0E4', true, true, 3),
('ゲーム・アプリ', 'ENT_GAME', (SELECT category_id FROM categories WHERE category_code = 'ENTERTAINMENT'), 'ゲーム、アプリ決済', '🎮', '#D6E6F4', true, true, 4),
('フィットネス', 'ENT_FITNESS', (SELECT category_id FROM categories WHERE category_code = 'ENTERTAINMENT'), 'ジム、ピラティス、ヨガ', '💪', '#D6F6E4', true, true, 5);

-- 大分類: 教育
INSERT INTO categories (category_name, category_code, description, icon_name, color_code, is_system, is_active, sort_order) VALUES
('教育', 'EDUCATION', '教育および自己啓発関連支出', '📚', '#FECA57', true, true, 5);

-- 教育 下位カテゴリ
INSERT INTO categories (category_name, category_code, parent_category_id, description, icon_name, color_code, is_system, is_active, sort_order) VALUES
('書籍', 'EDU_BOOK', (SELECT category_id FROM categories WHERE category_code = 'EDUCATION'), '本、電子書籍、オーディオブック', '📖', '#FDD467', true, true, 1),
('講座・受講料', 'EDU_COURSE', (SELECT category_id FROM categories WHERE category_code = 'EDUCATION'), 'オンライン講座、塾代', '🎓', '#FDDE77', true, true, 2),
('自己啓発', 'EDU_SELF', (SELECT category_id FROM categories WHERE category_code = 'EDUCATION'), 'セミナー、ワークショップ、資格', '💡', '#FEE887', true, true, 3),
('資格', 'EDU_CERT', (SELECT category_id FROM categories WHERE category_code = 'EDUCATION'), '資格試験料、教材', '📜', '#FEF297', true, true, 4),
('オンライン講座', 'EDU_ONLINE', (SELECT category_id FROM categories WHERE category_code = 'EDUCATION'), 'Udemy、Courseraなどオンライン講座', '💻', '#FEF5A7', true, true, 5);

-- 大分類: 投資・貯金
INSERT INTO categories (category_name, category_code, description, icon_name, color_code, is_system, is_active, sort_order) VALUES
('投資・貯金', 'INVESTMENT', '投資および貯金関連', '💰', '#A55EEA', true, true, 6);

-- 投資 下位カテゴリ
INSERT INTO categories (category_name, category_code, parent_category_id, description, icon_name, color_code, is_system, is_active, sort_order) VALUES
('定期預金', 'INV_SAVINGS', (SELECT category_id FROM categories WHERE category_code = 'INVESTMENT'), '銀行定期預金、普通預金', '🏦', '#B56EF0', true, true, 1),
('株式', 'INV_STOCK', (SELECT category_id FROM categories WHERE category_code = 'INVESTMENT'), '株式投資', '📈', '#C57EF6', true, true, 2),
('投資信託', 'INV_FUND', (SELECT category_id FROM categories WHERE category_code = 'INVESTMENT'), '投資信託、ETF投資', '📊', '#D58EFC', true, true, 3),
('その他投資', 'INV_OTHER', (SELECT category_id FROM categories WHERE category_code = 'INVESTMENT'), '不動産、暗号通貨等その他投資', '🔮', '#E59EFF', true, true, 4);

-- 大分類: 冠婚葬祭
INSERT INTO categories (category_name, category_code, description, icon_name, color_code, is_system, is_active, sort_order) VALUES
('冠婚葬祭', 'OCCASIONS', '冠婚葬祭関連支出', '🎁', '#FF9FF3', true, true, 7);

-- 冠婚葬祭 下位カテゴリ
INSERT INTO categories (category_name, category_code, parent_category_id, description, icon_name, color_code, is_system, is_active, sort_order) VALUES
('祝い金', 'OCC_CONGRATULATION', (SELECT category_id FROM categories WHERE category_code = 'OCCASIONS'), '結婚式、誕生日祝い金', '💝', '#FFA9F5', true, true, 1),
('香典', 'OCC_CONDOLENCE', (SELECT category_id FROM categories WHERE category_code = 'OCCASIONS'), '葬式香典', '🕊️', '#FFB3F7', true, true, 2),
('プレゼント', 'OCC_GIFT', (SELECT category_id FROM categories WHERE category_code = 'OCCASIONS'), '誕生日プレゼント、記念日プレゼント', '🎀', '#FFBDF9', true, true, 3),
('その他', 'OCC_OTHER', (SELECT category_id FROM categories WHERE category_code = 'OCCASIONS'), 'その他冠婚葬祭支出', '🌸', '#FFC7FB', true, true, 4);

-- 大分類: 収入
INSERT INTO categories (category_name, category_code, description, icon_name, color_code, is_system, is_active, sort_order) VALUES
('収入', 'INCOME', '各種収入関連', '💵', '#28A745', true, true, 8);

-- 収入 下位カテゴリ
INSERT INTO categories (category_name, category_code, parent_category_id, description, icon_name, color_code, is_system, is_active, sort_order) VALUES
('給与', 'INC_SALARY', (SELECT category_id FROM categories WHERE category_code = 'INCOME'), '月給、年俸', '💼', '#38B755', true, true, 1),
('副業', 'INC_SIDEJOB', (SELECT category_id FROM categories WHERE category_code = 'INCOME'), 'アルバイト、フリーランス', '💻', '#48C765', true, true, 2),
('投資収益', 'INC_INVESTMENT', (SELECT category_id FROM categories WHERE category_code = 'INCOME'), '株式、投資信託収益', '📈', '#58D775', true, true, 3),
('お小遣い', 'INC_ALLOWANCE', (SELECT category_id FROM categories WHERE category_code = 'INCOME'), 'お小遣い、プレゼントでもらったお金', '🎉', '#68E785', true, true, 4),
('その他', 'INC_OTHER', (SELECT category_id FROM categories WHERE category_code = 'INCOME'), 'その他収入', '💫', '#78F795', true, true, 5);

-- ==========================================
-- 2. システム決済方法データ挿入
-- ==========================================

-- 大分類: 現金
INSERT INTO payment_methods (method_name, method_code, description, icon_name, is_system, is_active, sort_order) VALUES
('現金', 'CASH', '現金決済', '💵', true, true, 1);

-- 大分類: カード
INSERT INTO payment_methods (method_name, method_code, description, icon_name, is_system, is_active, sort_order) VALUES
('カード', 'CARD', 'カード決済統合', '💳', true, true, 2);

-- カード 下位方法
INSERT INTO payment_methods (method_name, method_code, parent_method_id, description, icon_name, is_system, is_active, sort_order) VALUES
('クレジットカード', 'CARD_CREDIT', (SELECT method_id FROM payment_methods WHERE method_code = 'CARD'), 'クレジットカード決済', '💳', true, true, 1),
('デビットカード', 'CARD_DEBIT', (SELECT method_id FROM payment_methods WHERE method_code = 'CARD'), 'デビットカード決済', '💳', true, true, 2),
('プリペイドカード', 'CARD_PREPAID', (SELECT method_id FROM payment_methods WHERE method_code = 'CARD'), 'プリペイドカード決済', '💳', true, true, 3);

-- 大分類: 振込
INSERT INTO payment_methods (method_name, method_code, description, icon_name, is_system, is_active, sort_order) VALUES
('振込', 'TRANSFER', '銀行振込', '🏦', true, true, 3);

-- 振込 下位方法
INSERT INTO payment_methods (method_name, method_code, parent_method_id, description, icon_name, is_system, is_active, sort_order) VALUES
('オンライン振込', 'TRANSFER_ONLINE', (SELECT method_id FROM payment_methods WHERE method_code = 'TRANSFER'), 'インターネットバンキング、モバイルバンキング', '💻', true, true, 1),
('ATM振込', 'TRANSFER_ATM', (SELECT method_id FROM payment_methods WHERE method_code = 'TRANSFER'), 'ATMによる振込', '🏧', true, true, 2),
('かんたん送金', 'TRANSFER_EASY', (SELECT method_id FROM payment_methods WHERE method_code = 'TRANSFER'), '簡単送金アプリ', '💸', true, true, 3);

-- 大分類: ペイ (日本で主要な決済サービス)
INSERT INTO payment_methods (method_name, method_code, description, icon_name, is_system, is_active, sort_order) VALUES
('ペイ', 'PAY', 'スマホ決済サービス', '📱', true, true, 4);

-- ペイ 下位方法 (日本の主要サービス)
INSERT INTO payment_methods (method_name, method_code, parent_method_id, description, icon_name, is_system, is_active, sort_order) VALUES
('PayPay', 'PAY_PAYPAY', (SELECT method_id FROM payment_methods WHERE method_code = 'PAY'), 'PayPay決済', '💛', true, true, 1),
('LINE Pay', 'PAY_LINE', (SELECT method_id FROM payment_methods WHERE method_code = 'PAY'), 'LINE Pay決済', '💚', true, true, 2),
('楽天ペイ', 'PAY_RAKUTEN', (SELECT method_id FROM payment_methods WHERE method_code = 'PAY'), '楽天ペイ決済', '❤️', true, true, 3),
('d払い', 'PAY_DOCOMO', (SELECT method_id FROM payment_methods WHERE method_code = 'PAY'), 'd払い決済', '🔵', true, true, 4),
('au PAY', 'PAY_AU', (SELECT method_id FROM payment_methods WHERE method_code = 'PAY'), 'au PAY決済', '🧡', true, true, 5),
('メルペイ', 'PAY_MERCARI', (SELECT method_id FROM payment_methods WHERE method_code = 'PAY'), 'メルペイ決済', '🔴', true, true, 6),
('Apple Pay', 'PAY_APPLE', (SELECT method_id FROM payment_methods WHERE method_code = 'PAY'), 'Apple Pay決済', '🍎', true, true, 7),
('Google Pay', 'PAY_GOOGLE', (SELECT method_id FROM payment_methods WHERE method_code = 'PAY'), 'Google Pay決済', '🔵', true, true, 8);

-- 大分類: 電子マネー
INSERT INTO payment_methods (method_name, method_code, description, icon_name, is_system, is_active, sort_order) VALUES
('電子マネー', 'EMONEY', '電子マネー決済', '💳', true, true, 5);

-- 電子マネー 下位方法 (日本の主要電子マネー)
INSERT INTO payment_methods (method_name, method_code, parent_method_id, description, icon_name, is_system, is_active, sort_order) VALUES
('Suica', 'EMONEY_SUICA', (SELECT method_id FROM payment_methods WHERE method_code = 'EMONEY'), 'Suica決済', '🚃', true, true, 1),
('PASMO', 'EMONEY_PASMO', (SELECT method_id FROM payment_methods WHERE method_code = 'EMONEY'), 'PASMO決済', '🚇', true, true, 2),
('nanaco', 'EMONEY_NANACO', (SELECT method_id FROM payment_methods WHERE method_code = 'EMONEY'), 'nanaco決済', '🟡', true, true, 3),
('WAON', 'EMONEY_WAON', (SELECT method_id FROM payment_methods WHERE method_code = 'EMONEY'), 'WAON決済', '🔵', true, true, 4),
('楽天Edy', 'EMONEY_EDY', (SELECT method_id FROM payment_methods WHERE method_code = 'EMONEY'), '楽天Edy決済', '❤️', true, true, 5);

-- 大分類: その他
INSERT INTO payment_methods (method_name, method_code, description, icon_name, is_system, is_active, sort_order) VALUES
('その他', 'OTHER', 'その他決済方法', '🔄', true, true, 6);

-- その他 下位方法
INSERT INTO payment_methods (method_name, method_code, parent_method_id, description, icon_name, is_system, is_active, sort_order) VALUES
('商品券', 'OTHER_VOUCHER', (SELECT method_id FROM payment_methods WHERE method_code = 'OTHER'), '商品券、ギフトカード', '🎫', true, true, 1),
('ポイント', 'OTHER_POINT', (SELECT method_id FROM payment_methods WHERE method_code = 'OTHER'), '貯まったポイント使用', '⭐', true, true, 2),
('クーポン', 'OTHER_COUPON', (SELECT method_id FROM payment_methods WHERE method_code = 'OTHER'), '割引クーポン', '🎟️', true, true, 3),
('仮想通貨', 'OTHER_CRYPTO', (SELECT method_id FROM payment_methods WHERE method_code = 'OTHER'), 'ビットコイン、イーサリアムなど', '₿', true, true, 4),
('その他', 'OTHER_ETC', (SELECT method_id FROM payment_methods WHERE method_code = 'OTHER'), 'その他決済手段', '❓', true, true, 5);

-- ==========================================
-- データ挿入確認クエリ
-- ==========================================

-- システムカテゴリ作成確認
SELECT 'システムカテゴリ作成完了:' as info, COUNT(*) as count FROM categories WHERE is_system = true;

-- システム決済方法作成確認
SELECT 'システム決済方法作成完了:' as info, COUNT(*) as count FROM payment_methods WHERE is_system = true;

-- カテゴリ階層構造確認
SELECT 
    COALESCE(p.category_name, 'トップレベル') as parent_category,
    c.category_name as child_category,
    c.category_code,
    c.sort_order
FROM categories c
LEFT JOIN categories p ON c.parent_category_id = p.category_id
WHERE c.is_system = true
ORDER BY COALESCE(p.sort_order, c.sort_order), c.sort_order;

-- 決済方法階層構造確認
SELECT 
    COALESCE(p.method_name, 'トップレベル') as parent_method,
    pm.method_name as child_method,
    pm.method_code,
    pm.sort_order
FROM payment_methods pm
LEFT JOIN payment_methods p ON pm.parent_method_id = p.method_id
WHERE pm.is_system = true
ORDER BY COALESCE(p.sort_order, pm.sort_order), pm.sort_order;

-- ==========================================
-- 日本語システムデータ挿入完了
-- ==========================================