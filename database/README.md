# 데이터베이스 스키마 및 설정

가계부 앱을 위한 Supabase PostgreSQL 데이터베이스 스키마와 관련 설정 파일들입니다.

## 📁 파일 구조

```
database/
├── schema.sql          # 메인 데이터베이스 스키마
├── seed-data.sql       # 기본 시드 데이터 (카테고리, 결제방법)
├── rls-policies.sql    # Row Level Security 정책
└── README.md          # 이 파일
```

## 🚀 설치 순서

### 1. 스키마 생성
```sql
-- Supabase SQL 에디터에서 실행
\i schema.sql
```

### 2. 시드 데이터 삽입
```sql
-- 기본 카테고리 및 결제방법 생성
\i seed-data.sql
```

### 3. RLS 정책 적용
```sql
-- 보안 정책 설정
\i rls-policies.sql
```

## 📊 데이터베이스 구조

### 핵심 테이블

#### 👤 사용자 관련
- **users**: 사용자 기본 정보
- **user_groups**: 사용자 그룹 (개인/가족 단위)
- **user_group_members**: 사용자-그룹 멤버십

#### 📝 거래 관련
- **transactions**: 메인 거래 테이블
- **categories**: 카테고리 (대분류/소분류)
- **payment_methods**: 결제 방법
- **tags**: 거래 태그
- **transaction_tags**: 거래-태그 연결

#### 💰 예산 및 관리
- **budgets**: 예산 설정
- **transaction_templates**: 거래 템플릿
- **favorite_locations**: 즐겨찾기 장소

#### 📎 첨부파일 및 이력
- **attachments**: 영수증 등 첨부파일
- **transaction_history**: 거래 변경 이력

### 주요 특징

1. **계층형 구조**: 카테고리와 결제방법은 대분류/소분류 지원
2. **그룹 기반**: 개인/가족 단위의 데이터 분리
3. **감사 로그**: 모든 거래 변경 이력 자동 추적
4. **보안**: Row Level Security로 데이터 접근 제어

## 🔐 보안 정책 (RLS)

### 기본 원칙
- 사용자는 자신이 속한 그룹의 데이터만 접근 가능
- 시스템 기본 데이터(카테고리, 결제방법)는 모든 인증된 사용자가 조회 가능
- 관리자는 그룹 내 모든 데이터에 대한 관리 권한 보유

### 권한 레벨
- **admin**: 그룹 관리, 모든 데이터 CRUD
- **member**: 데이터 생성/조회, 본인 데이터 수정/삭제
- **readonly**: 데이터 조회만 가능

## 📈 성능 최적화

### 인덱스 설정
- 자주 조회되는 컬럼에 인덱스 생성
- 복합 인덱스를 통한 쿼리 최적화
- 날짜 범위 검색 최적화

### 뷰 활용
- **monthly_expense_summary**: 월별 지출 요약
- **category_expense_summary**: 카테고리별 지출 요약

## 🛠️ 유지보수

### 정기 작업
1. **통계 업데이트**: PostgreSQL ANALYZE 실행
2. **인덱스 재구성**: 필요시 REINDEX 실행
3. **이력 데이터 정리**: 오래된 transaction_history 정리

### 백업 정책
- Supabase 자동 백업 활용
- 중요한 설정 변경 전 수동 백업 수행

## 📋 기본 데이터 현황

### 카테고리 (8개 대분류)
1. **식비** (3개 하위 카테고리)
   - 식재료, 외식, 음료/간식
2. **생활비** (5개 하위 카테고리)
   - 의류, 생필품, 의료비, 교통비, 기타
3. **고정비** (5개 하위 카테고리)
   - 주거비, 통신비, 보험료, 구독료, 대출상환
4. **여가/엔터테인먼트** (4개 하위 카테고리)
   - 영화/공연, 여행, 취미활동, 게임/앱
5. **교육** (4개 하위 카테고리)
   - 도서, 강의/수강료, 자기계발, 자격증
6. **투자/저축** (4개 하위 카테고리)
   - 적금, 주식, 펀드, 기타 투자
7. **경조사** (4개 하위 카테고리)
   - 축의금, 부의금, 선물, 기타
8. **수입** (5개 하위 카테고리)
   - 급여, 부업, 투자수익, 용돈, 기타

### 결제방법 (5개 대분류)
1. **현금**
2. **카드** (3개 하위 방법)
   - 신용카드, 체크카드, 선불카드
3. **계좌이체** (2개 하위 방법)
   - 온라인 이체, ATM 이체
4. **페이** (6개 하위 방법)
   - 카카오페이, 네이버페이, 삼성페이, 애플페이, 페이코, 토스페이
5. **기타** (4개 하위 방법)
   - 상품권, 포인트, 쿠폰, 기타

## 🔧 개발 참고사항

### TypeScript 타입
- 각 테이블에 대응하는 TypeScript 인터페이스 정의 권장
- Supabase 타입 생성기 활용: `supabase gen types typescript`

### 쿼리 패턴
```typescript
// 사용자 거래 조회 예시
const { data } = await supabase
  .from('transactions')
  .select(`
    *,
    categories(category_name, color_code),
    payment_methods(method_name, icon_name)
  `)
  .eq('user_id', userId)
  .gte('transaction_date', startDate)
  .lte('transaction_date', endDate)
  .order('transaction_date', { ascending: false });
```

### 주의사항
- RLS 정책으로 인해 서버에서는 `service_role` 키 사용 필요
- 클라이언트에서는 `anon` 키로 인증된 요청만 가능
- 시스템 데이터(is_system=true) 수정 시 주의

## 📞 문제 해결

### 자주 발생하는 이슈
1. **권한 오류**: RLS 정책 확인, 사용자 그룹 멤버십 확인
2. **성능 저하**: 쿼리 실행 계획 분석, 인덱스 최적화
3. **데이터 불일치**: 트랜잭션 내에서 관련 테이블 동시 업데이트

### 로그 확인
```sql
-- 최근 쿼리 성능 확인
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
WHERE query LIKE '%transactions%' 
ORDER BY mean_exec_time DESC 
LIMIT 10;
```