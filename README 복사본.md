# b1-2 Bookmark Keeper

React + Supabase로 구현한 개인용 북마크 관리 SPA. 읽고 싶은 링크를 카테고리별로 저장하고, 메모를 남기고, 목록/상세/등록/수정/삭제를 수행한다.

## 개발 환경

| 항목 | 내용 |
|---|---|
| 언어 | JavaScript (ES2020+), JSX |
| 프레임워크 | React 19 + React Router 7 |
| 빌드 도구 | Vite 8 |
| 백엔드 | Supabase (Postgres + PostgREST, `bookmarks` 테이블) |
| 배포 | Vercel |

## 배포 URL

**https://codyssey-b1-2.vercel.app**

## 폴더 구조

```
codyssey-b1-2/
├── src/
│   ├── pages/              # 라우트 단위 화면
│   │   ├── HomePage.jsx
│   │   ├── BookmarksPage.jsx        # 목록 (카테고리 필터)
│   │   ├── BookmarkDetailPage.jsx   # 상세 + 삭제
│   │   ├── BookmarkNewPage.jsx      # 등록
│   │   ├── BookmarkEditPage.jsx     # 수정
│   │   └── NotFoundPage.jsx
│   ├── components/         # 재사용 UI 컴포넌트 (10개)
│   │   ├── Layout.jsx       # 헤더/네비게이션 공통 레이아웃
│   │   ├── Button.jsx, Input.jsx, Textarea.jsx, Select.jsx
│   │   ├── Loading.jsx, ErrorState.jsx, EmptyState.jsx, Card.jsx
│   │   ├── CategoryFilter.jsx
│   │   ├── BookmarkCard.jsx, BookmarkList.jsx, BookmarkForm.jsx
│   ├── hooks/               # 커스텀 훅
│   │   ├── useBookmarks.js  # 목록 조회 (loading/error/refetch)
│   │   └── useBookmark.js   # 단건 조회 (loading/error/refetch)
│   ├── lib/
│   │   ├── supabase.js      # Supabase 클라이언트 초기화
│   │   └── constants.js     # 카테고리 목록
│   ├── App.jsx               # 라우트 정의
│   └── main.jsx               # BrowserRouter 진입점
├── schema.sql                 # Supabase 테이블 + RLS 정책 (이미 적용됨)
├── .env.example
└── vercel.json                 # SPA client-side 라우팅 rewrite
```

## 라우트 (6개)

| 경로 | 화면 |
|---|---|
| `/` | 홈 |
| `/bookmarks` | 북마크 목록 (카테고리 필터) |
| `/bookmarks/:id` | 북마크 상세 |
| `/bookmarks/new` | 북마크 등록 |
| `/bookmarks/:id/edit` | 북마크 수정 |
| `*` | Not Found |

## 상태 → 렌더링 흐름 (3가지 이상)

1. **카테고리 필터**: `BookmarksPage`의 `category` state 변경 → `useMemo`로 필터링된 목록 재계산 → `BookmarkList` 재렌더링 (재조회 없이 클라이언트에서 즉시 반영).
2. **폼 입력/검증**: `BookmarkForm`의 controlled input 변경 → 해당 필드의 에러 state 초기화 → 제출 시 `validate()` 결과에 따라 에러 메시지 표시/숨김.
3. **비동기 CRUD 흐름**: 등록/수정/삭제 버튼 클릭 → `submitting`/`deleting` state가 `true`로 바뀌며 버튼이 "처리 중..."으로 렌더링 → Supabase 응답 성공 시 `navigate()`로 라우트 이동, 실패 시 `submitError`/`deleteError` state가 채워지며 에러 메시지가 렌더링됨.
4. **데이터 로딩**: `useBookmarks`/`useBookmark` 훅의 `loading` state가 `true`인 동안 `Loading` 컴포넌트 렌더링 → 응답 도착 후 `loading=false`로 바뀌며 실제 데이터 또는 `ErrorState`/`EmptyState`가 렌더링됨.

## 로컬 실행 방법

```bash
npm install
cp .env.example .env   # Supabase 프로젝트의 URL/anon key로 채운다
npm run dev
```

Supabase 테이블이 아직 없다면 `schema.sql`을 Supabase 대시보드의 SQL Editor에서 실행한다 (이 프로젝트의 실제 배포 환경에는 이미 적용되어 있다).

## 보너스 과제

구현하지 않음 (전역 상태/메모이제이션/인증은 이번 미션 필수 범위가 아니라서 스코프에서 제외).
