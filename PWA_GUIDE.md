# PWA (Progressive Web App) 설정 가이드

## 📖 PWA란?

Progressive Web App(PWA)은 웹 기술을 사용하여 네이티브 앱과 유사한 경험을 제공하는 웹 애플리케이션입니다.

### PWA의 주요 특징

- **설치 가능**: 홈 화면에 추가하여 네이티브 앱처럼 사용
- **오프라인 지원**: 서비스 워커를 통한 캐싱으로 인터넷 연결 없이도 동작
- **반응형**: 모든 기기에서 최적화된 경험 제공
- **안전**: HTTPS 필수
- **업데이트**: 백그라운드에서 자동 업데이트

## 🛠 현재 프로젝트의 PWA 구성

### 1. 설치된 패키지

```bash
npm install next-pwa
npm install --save-dev @types/next-pwa
```

### 2. 프로젝트 구조

```
project/
├── public/
│   ├── manifest.json          # PWA 매니페스트 파일
│   ├── icon-192x192.png       # 앱 아이콘 (192x192)
│   ├── icon-512x512.png       # 앱 아이콘 (512x512)
│   └── sw.js                  # 서비스 워커 (자동 생성)
├── next.config.js             # Next.js + PWA 설정
└── app/layout.tsx             # PWA 메타데이터 설정
```

## 📝 설정 파일 상세

### 1. next.config.js

```javascript
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  runtimeCaching: [
    {
      urlPattern: /^https?.*\.(png|jpe?g|webp|svg|gif|tiff|js|css)$/,
      handler: "CacheFirst",
      options: {
        cacheName: "static-resources",
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60, // 24시간
        },
      },
    },
    {
      urlPattern: /^https?.*\/api\/.*$/,
      handler: "NetworkFirst",
      options: {
        cacheName: "api-cache",
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 5 * 60, // 5분
        },
      },
    },
  ],
});

const nextConfig = {
  /* config options here */
};

module.exports = withPWA(nextConfig);
```

### 2. public/manifest.json

```json
{
  "name": "家計簿",
  "short_name": "家計簿",
  "description": "가계부 관리 앱",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2563eb",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable any"
    }
  ],
  "categories": ["finance", "productivity"],
  "lang": "ko",
  "scope": "/",
  "prefer_related_applications": false
}
```

### 3. app/layout.tsx의 메타데이터 설정

```typescript
export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "家計簿",
  description: "가계부 관리 앱",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "家計簿",
    startupImage: "/icon-512x512.png",
  },
  icons: {
    icon: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export function generateViewport() {
  return {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    themeColor: "#2563eb",
  };
}
```

## 🐛 설정 중 발생한 문제와 해결방법

### 문제 1: TypeScript 타입 에러

```
Could not find a declaration file for module 'next-pwa'
```

**해결방법:**

```bash
npm install --save-dev @types/next-pwa
```

### 문제 2: Next.js 15에서 타입 호환성 문제

```
Argument of type 'NextConfig' is not assignable to parameter
```

**해결방법:**

- `next.config.ts`를 `next.config.js`로 변경
- TypeScript import 대신 CommonJS require 사용

### 문제 3: 메타데이터 경고

```
Unsupported metadata themeColor is configured in metadata export
```

**해결방법:**

- `themeColor`와 `viewport`를 별도의 `generateViewport()` 함수로 분리

### 문제 4: Supabase 관련 Edge Runtime 경고

```
A Node.js API is used (process.versions) which is not supported in the Edge Runtime
```

**해결방법:**

- 이는 Supabase 라이브러리 자체의 문제로, 앱 동작에는 영향 없음
- 향후 Supabase 업데이트에서 해결될 예정

## 🔧 커스터마이징 가이드

### 1. 앱 이름 변경

**파일:** `public/manifest.json`

```json
{
  "name": "새로운 앱 이름",
  "short_name": "새 앱"
}
```

**파일:** `app/layout.tsx`

```typescript
export const metadata: Metadata = {
  title: "새로운 앱 이름",
  appleWebApp: {
    title: "새로운 앱 이름",
  }
}
```

### 2. 테마 색상 변경

**파일:** `public/manifest.json`

```json
{
  "theme_color": "#새로운컬러코드",
  "background_color": "#새로운배경색"
}
```

**파일:** `app/layout.tsx`

```typescript
export function generateViewport() {
  return {
    themeColor: "#새로운컬러코드",
  };
}
```

### 3. 아이콘 변경

1. **새 아이콘 준비**: 192x192px, 512x512px PNG 파일
2. **파일 교체**: `public/icon-192x192.png`, `public/icon-512x512.png`
3. **추가 사이즈 필요시** `manifest.json`에 아이콘 추가:

```json
{
  "icons": [
    {
      "src": "/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png"
    }
  ]
}
```

### 4. 캐시 전략 수정

**파일:** `next.config.js`

#### 캐시 시간 조정

```javascript
expiration: {
  maxAgeSeconds: 60 * 60 * 24 * 7, // 7일로 변경
}
```

#### 새로운 URL 패턴 추가

```javascript
{
  urlPattern: /^https?.*\/새로운패턴\/.*$/,
  handler: "StaleWhileRevalidate", // 다른 전략 사용
  options: {
    cacheName: "새로운-캐시",
  },
}
```

### 5. 시작 URL 변경

**파일:** `public/manifest.json`

```json
{
  "start_url": "/dashboard", // 앱 시작시 이동할 페이지
}
```

### 6. 화면 방향 설정

**파일:** `public/manifest.json`

```json
{
  "orientation": "landscape", // portrait, landscape, any
}
```

## 📱 테스트 방법

### 1. 로컬 테스트

```bash
npm run build
npm start
```

- `http://localhost:3000` 접속
- 개발자 도구 > Application > Manifest 확인

### 2. PWA 설치 가능 여부 확인

- Chrome 브라우저 주소창 우측의 "설치" 버튼 확인
- 모바일에서 "홈 화면에 추가" 옵션 확인

### 3. Lighthouse 감사

1. Chrome 개발자 도구 > Lighthouse
2. "Progressive Web App" 체크
3. "Generate report" 실행
4. PWA 점수 및 개선사항 확인

### 4. 서비스 워커 확인

- 개발자 도구 > Application > Service Workers
- 등록된 서비스 워커 상태 확인

## 🚀 배포 후 확인사항

### 1. HTTPS 확인

- PWA는 HTTPS에서만 동작
- Vercel은 자동으로 HTTPS 제공

### 2. 서비스 워커 등록 확인

```javascript
// 브라우저 콘솔에서 확인
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Service workers:', registrations);
});
```

### 3. 캐시 동작 확인

- 네트워크 탭에서 "캐시에서 로드됨" 표시 확인
- 오프라인 상태에서 앱 동작 테스트

## 📚 추가 리소스

### PWA 아이콘 생성 도구

- [PWA Icon Generator](https://www.pwabuilder.com/imageGenerator)
- [RealFaviconGenerator](https://realfavicongenerator.net/)

### PWA 테스트 도구

- [PWA Builder](https://www.pwabuilder.com/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

### 문서

- [Next.js PWA 공식 문서](https://github.com/shadowwalker/next-pwa)
- [MDN PWA 가이드](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Google PWA 가이드](https://web.dev/progressive-web-apps/)

## 🔄 업데이트 가이드

### PWA 업데이트 시 주의사항

1. **manifest.json 수정 후**: 새 버전 배포 필요
2. **아이콘 변경 후**: 브라우저 캐시 삭제 권장
3. **서비스 워커 업데이트**: `skipWaiting: true`로 즉시 업데이트

### 버전 관리

**파일:** `public/manifest.json`

```json
{
  "version": "1.0.1", // 버전 업데이트
}
```

이 가이드를 통해 PWA 설정을 이해하고 필요에 따라 커스터마이징할 수 있습니다. 추가 질문이나 문제가 발생하면 위의 문제 해결 방법을 참고하세요.

