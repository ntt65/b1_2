# b1-2 Bookmark Keeper

React + Supabase로 구현한 개인용 북마크 관리 SPA. 읽고 싶은 링크를 카테고리별로 저장하고, 메모를 남기고, 목록/상세/등록/수정/삭제를 수행한다.

- **배포 URL**: https://codyssey-b1-2.vercel.app
- **소스 코드**: https://github.com/ntt65/b1_2

---

## 미션 구현 결과

### 필수 요구사항 체크리스트

| 항목 | 결과 | 근거 |
| --- | --- | --- |
| 라우팅 5개 이상 | ✅ | 6개 라우트 (`/`, `/bookmarks`, `/bookmarks/new`, `/bookmarks/:id`, `/bookmarks/:id/edit`, `*`) |
| 목록/상세 페이지 분리 | ✅ | `/bookmarks` (목록) ↔ `/bookmarks/:id` (상세) |
| Not Found 페이지 | ✅ | `*` → `NotFoundPage` (404 메시지 + 홈으로 링크) |
| 재사용 컴포넌트 8개 이상 | ✅ | 13개 (`Layout`, `Button`, `Input`, `Textarea`, `Select`, `Card`, `Loading`, `ErrorState`, `EmptyState`, `CategoryFilter`, `BookmarkCard`, `BookmarkList`, `BookmarkForm`) |
| 커스텀 훅 1개 이상 | ✅ | `useBookmarks()`, `useBookmark(id)` 2개 |
| CRUD 전체 | ✅ | 목록/상세 조회, 등록, 수정, 삭제 — Supabase 원격 DB 기준 |
| 폼 필수값 검증 | ✅ | `validate()` — title, url 빈값 시 에러 반환 |
| 폼 에러 메시지 표시 | ✅ | 필드 바로 아래 인라인 에러 메시지, `invalid` 클래스로 테두리 강조 |
| 제출 중 상태 표시 | ✅ | `submitting: true` → 버튼 비활성화 + "처리 중..." 텍스트 |
| 로딩/에러/빈 상태 통일 | ✅ | `Loading`, `ErrorState`, `EmptyState` 공용 컴포넌트로 모든 화면 통일 |
| 상태 → 렌더 변화 3곳 이상 | ✅ | 5곳 (카테고리 필터, 로딩 전환, 검증 에러, 제출 중, 삭제 에러) |
| 배포 | ✅ | Vercel, SPA rewrite 설정, 환경변수 등록 완료 |
| 보너스: 성능 최적화 | ✅ | `useMemo` (필터 결과), `useCallback` (refetch 메모이제이션) |

---

### 과제 목표 달성

> 미션이 끝난 후 스스로 설명할 수 있어야 하는 5가지 항목

**1. 컴포넌트를 어떤 기준으로 쪼갰는가**

두 기준으로 나눴다. ① `pages/`는 라우트 1개에 대응하며 Supabase 요청·`navigate` 같은 부수 효과를 담당한다. `components/`는 props만 받아 화면을 그리며 외부 의존성이 없다. ② 같은 UI가 여러 곳에서 반복되면 컴포넌트로 추출했다 — 로딩/에러/빈 상태 3종, 등록·수정 공용 폼 `BookmarkForm`.

**2. props와 state의 차이, 상태를 어디에 두었는가**

- props: 부모가 자식에게 내려주는 읽기 전용 값. `BookmarkForm`이 받는 `initialValues`, `onSubmit`, `submitError`가 예시다.
- state: 컴포넌트 자신이 소유하고 변경할 수 있는 값. 비동기 데이터(`bookmarks`, `loading`, `error`)는 커스텀 훅이 소유, 카테고리 필터(`category`)는 `BookmarksPage`가 소유, 폼 값(`values`, `errors`, `submitting`)은 `BookmarkForm`이 소유한다.

**3. useEffect가 언제 실행되고 의존성 배열이 어떤 역할을 하는가**

```js
// useBookmarks — 마운트 1회
const refetch = useCallback(async () => { /* Supabase select */ }, []);
useEffect(() => { refetch(); }, [refetch]); // refetch 불변 → 1회

// useBookmark(id) — id 바뀔 때마다 재조회
const refetch = useCallback(async () => { /* eq("id", id) */ }, [id]);
useEffect(() => { refetch(); }, [refetch]); // id 바뀌면 refetch 새 참조 → 재실행
```

의존성 배열은 이전/현재 값을 `Object.is`로 비교해 달라진 게 있으면 effect를 재실행한다. `useCallback`으로 `refetch`를 메모이제이션하지 않으면 렌더마다 새 함수가 만들어져 무한 루프가 생긴다.

**4. 비동기 흐름에서 로딩/성공/실패/빈 상태를 어떻게 표현했는가**

```jsx
{loading && <Loading message="북마크를 불러오는 중..." />}
{!loading && error && <ErrorState message="요청에 실패했습니다." onRetry={refetch} />}
{!loading && !error && <BookmarkList bookmarks={filtered} />}
// BookmarkList 내부: bookmarks.length === 0 → <EmptyState />
```

`loading`과 `error` 두 boolean 조합으로 네 상태가 겹치지 않게 처리했다.

**5. 라우팅 → 컴포넌트 → 상태 → 이벤트 → 렌더링 연결**

북마크 등록 흐름: "새 북마크" 클릭 → `/bookmarks/new` 매칭 → `BookmarkNewPage` 렌더 → `BookmarkForm` 마운트 → 입력 `onChange` → `values` state 갱신 → 제출 클릭 → `validate()` → `submitting: true` → Supabase `insert` → 성공 시 `navigate("/bookmarks/:id")` → 실패 시 `submitError` state → 폼 상단 에러 표시.

---

## 기능 구현

### CRUD 흐름

| 동작 | 진입 경로 | Supabase 쿼리 | 결과 |
| --- | --- | --- | --- |
| 목록 조회 | `/bookmarks` | `select("*").order("created_at", {ascending:false})` | 카드 목록 렌더, 카테고리 필터 적용 |
| 상세 조회 | `/bookmarks/:id` | `select("*").eq("id", id).maybeSingle()` | 제목/URL/메모/등록일 표시 |
| 등록 | `/bookmarks/new` → 폼 제출 | `insert(values).select().single()` | 새 레코드 상세 페이지로 이동 |
| 수정 | `/bookmarks/:id/edit` → 폼 제출 | `update(values).eq("id", id)` | 해당 상세 페이지로 이동 |
| 삭제 | `/bookmarks/:id` → 삭제 버튼 | `delete().eq("id", id)` | 목록 페이지로 이동 |

### 상태 → 렌더링 변화 포인트

| 상태 변화 | 렌더 결과 |
| --- | --- |
| `category` 드롭다운 선택 | `useMemo` 재계산 → 카드 목록 즉시 교체 (재조회 없음) |
| `loading: true → false` | `<Loading />` 사라지고 데이터/에러/빈 상태 렌더 |
| `errors.title` 설정 | `Input`에 `invalid` 클래스 + 필드 아래 에러 메시지 |
| `submitting: false → true` | 버튼 "처리 중..." + `disabled` |
| `deleteError` 설정 | 삭제 버튼 위에 에러 메시지 |

---

## Supabase 선택 이유 및 연동 경험

**선택 이유**: PostgreSQL 기반이라 `schema.sql` 한 파일로 스키마·RLS 정책을 버전 관리할 수 있고, SDK 메서드 체이닝이 SQL과 1:1 대응되어 읽기 쉽다. Firebase(NoSQL)보다 단일 테이블 CRUD에 구조가 명확했다.

**연동 중 겪은 어려움**: `useEffect` + `useCallback` 의존성 배열 설정 실수로 무한 루프 발생. `refetch`를 `useCallback` 없이 의존성에 넣으면 렌더마다 새 함수 참조가 생겨 effect가 계속 재실행된다. `useCallback([])` / `useCallback([id])`로 메모이제이션해 해결했다.

**인증 미구현 근거**: 미션 평가 기준이 "React 구조·데이터 흐름"이며 인증은 선택 항목이다. RLS 정책으로 `anon` 키에 전체 CRUD를 허용하고 `schema.sql`에 근거를 주석으로 명시했다. 인증 추가 시 Supabase Auth + 보호 라우트 구조가 필요하며 이번 미션 스코프 외로 판단했다.

상세 내용(RLS 정책, useEffect 패턴, 버전) → [docs/tech.md](./docs/tech.md)

---

## 개발 환경

| 항목 | 내용 |
| --- | --- |
| 언어 | JavaScript (ES2020+), JSX |
| 프레임워크 | React 19 + React Router 7 |
| 빌드 도구 | Vite 8 |
| 백엔드 | Supabase (Postgres + PostgREST, `bookmarks` 테이블) |
| 배포 | Vercel |

버전 상세, DB 스키마, 환경변수, useEffect 패턴 → [docs/tech.md](./docs/tech.md)

---

## 폴더 구조

```
src/
├── App.jsx                  # 라우트 트리 루트
├── main.jsx                 # BrowserRouter 진입점
├── lib/
│   ├── supabase.js          # Supabase 클라이언트 싱글턴
│   └── constants.js         # 카테고리 상수
├── hooks/
│   ├── useBookmarks.js      # 목록 조회 (loading/error/refetch)
│   └── useBookmark.js       # 단건 조회 (loading/error/refetch)
├── pages/                   # 라우트 단위 화면
│   ├── HomePage.jsx
│   ├── BookmarksPage.jsx    # 목록 + 카테고리 필터
│   ├── BookmarkDetailPage.jsx
│   ├── BookmarkNewPage.jsx
│   ├── BookmarkEditPage.jsx
│   └── NotFoundPage.jsx
└── components/              # 재사용 UI 컴포넌트 (13개)
    ├── Layout.jsx
    ├── Button.jsx / Input.jsx / Textarea.jsx / Select.jsx / Card.jsx
    ├── Loading.jsx / ErrorState.jsx / EmptyState.jsx
    ├── CategoryFilter.jsx
    └── BookmarkCard.jsx / BookmarkList.jsx / BookmarkForm.jsx
```

---

## 라우트 (6개)

| 경로 | 화면 |
| --- | --- |
| `/` | 홈 |
| `/bookmarks` | 북마크 목록 (카테고리 필터) |
| `/bookmarks/new` | 북마크 등록 |
| `/bookmarks/:id` | 북마크 상세 |
| `/bookmarks/:id/edit` | 북마크 수정 |
| `*` | Not Found |

---

## 컴포넌트 설계 기준

페이지 컴포넌트(`pages/`)와 UI 컴포넌트(`components/`)를 아래 기준으로 분리했다.

- **페이지 컴포넌트**: 라우트 하나에 대응하는 최상위 화면. 데이터 조회·CRUD 요청, 라우팅(navigate) 등 "무엇을 할 것인가"를 담당한다.
- **UI 컴포넌트**: prop만 받아 화면을 그리는 역할만 한다. 외부 의존성(Supabase, Router)을 갖지 않아서, props가 같으면 항상 같은 결과를 렌더링한다.

재사용 컴포넌트 13개 (`components/` 폴더 전체):

| 컴포넌트 | 역할 | 주요 prop |
| --- | --- | --- |
| `Layout` | 헤더·네비게이션 공통 레이아웃 | `children` |
| `Button` | 버튼 (variant/disabled/loading 상태) | `variant`, `loading` |
| `Input` | 텍스트 입력 + 에러 메시지 | `value`, `onChange`, `error` |
| `Textarea` | 여러 줄 입력 + 에러 메시지 | `value`, `onChange`, `error` |
| `Select` | 드롭다운 선택 | `value`, `onChange`, `options` |
| `Card` | 흰 카드 컨테이너 | `className` |
| `Loading` | 로딩 스피너 + 메시지 | `message` |
| `ErrorState` | 에러 메시지 + 재시도 버튼 | `message`, `onRetry` |
| `EmptyState` | 데이터 없음 안내 | `message`, `action` |
| `CategoryFilter` | 카테고리 드롭다운 필터 | `value`, `onChange` |
| `BookmarkCard` | 북마크 카드 한 장 | `bookmark` |
| `BookmarkList` | 카드 목록 (EmptyState 포함) | `bookmarks` |
| `BookmarkForm` | 등록/수정 공용 폼 | `initialValues`, `onSubmit`, `submitLabel`, `submitError` |

---

## 커스텀 훅

### `useBookmarks()` — 목록 조회

```js
const { bookmarks, loading, error, refetch } = useBookmarks();
```

마운트 시 1회 Supabase에서 전체 북마크를 `created_at` 내림차순으로 가져온다. `refetch`는 `useCallback`으로 메모이제이션해 `useEffect` 무한 루프를 방지한다. 삭제 후 목록 갱신, 에러 시 재시도에서 외부 호출로 사용한다.

### `useBookmark(id)` — 단건 조회

```js
const { bookmark, loading, error, refetch } = useBookmark(id);
```

URL 파라미터 `id`가 바뀌면 자동으로 재조회한다 (`useCallback([id])` → `useEffect([refetch])`). `.maybeSingle()`로 결과 없을 때 에러 대신 `null`을 반환해 "찾을 수 없습니다" 화면을 별도 처리한다.

---

## 로컬 실행 방법

```bash
npm install
cp .env.example .env   # Supabase 프로젝트의 URL/anon key로 채운다
npm run dev
```

Supabase 테이블이 없다면 `schema.sql`을 Supabase 대시보드의 SQL Editor에서 실행한다.

### 실행 결과

```
$ npm install

added 312 packages in 8s

$ npm run dev

  VITE v8.1.1  ready in 342 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### 빌드 결과

```
$ npm run build

vite v8.1.1 building for production...
✓ 87 modules transformed.
dist/index.html                   0.46 kB │ gzip:  0.30 kB
dist/assets/index-BkR3qX2m.css   6.12 kB │ gzip:  2.01 kB
dist/assets/index-Dv9K7Lem.js  189.34 kB │ gzip: 61.48 kB
✓ built in 1.24s
```

---

## 보너스 과제

| 항목 | 구현 여부 | 내용 |
| --- | --- | --- |
| 전역 상태 | ✗ | 스코프 외 |
| 성능 최적화 (`useMemo` / `useCallback`) | ✓ | `BookmarksPage`에서 카테고리 필터 결과를 `useMemo`로 계산 — `bookmarks` 또는 `category`가 바뀔 때만 재계산. 두 커스텀 훅에서 `useCallback`으로 `refetch`를 메모이제이션해 `useEffect` 무한 루프 방지 |
| 인증 | ✗ | 스코프 외 |
