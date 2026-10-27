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

**상태 배치 결정 기준**: 그 상태가 변할 때 리렌더가 필요한 컴포넌트 중 가장 가까운 공통 부모에 둔다. 두 페이지 이상에서 공유하거나 페이지 수명을 넘어 유지해야 하면 전역 상태(Context 등)를 고려한다. 이 앱은 페이지 간 공유 상태가 없어 전역 상태를 도입하지 않았다.

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

**흔한 실수 — `useCallback` 없이 함수를 의존성에 넣는 경우:**

```js
// ❌ 잘못된 패턴 — 무한 루프 발생
async function refetch() { /* Supabase 요청 */ }  // 렌더마다 새 함수 참조 생성
useEffect(() => { refetch(); }, [refetch]);         // refetch 항상 달라 보임 → 무한 재실행

// ✅ 올바른 패턴
const refetch = useCallback(async () => { /* Supabase 요청 */ }, []);
useEffect(() => { refetch(); }, [refetch]);          // refetch 불변 → 마운트 1회만 실행
```

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

### CRUD 실패 케이스 처리

| 실패 유형 | 원인 | UI 동작 |
| --- | --- | --- |
| 목록·상세 조회 실패 | 네트워크 오류, Supabase 서비스 장애 | `error` state 설정 → `ErrorState` 렌더 ("요청에 실패했습니다.") + 재시도 버튼 |
| 등록 실패 | 필수 컬럼 누락, RLS 정책 거부 | `submitError` state 설정 → 폼 상단에 에러 메시지 표시, 폼 유지 |
| 수정 실패 | 존재하지 않는 id, RLS 정책 거부 | `submitError` state 설정 → 폼 상단 에러 표시, 현재 페이지 유지 |
| 삭제 실패 | 존재하지 않는 id, 네트워크 오류 | `deleteError` state 설정 → 삭제 버튼 위에 에러 메시지 표시, 페이지 유지 |
| 존재하지 않는 id 조회 | `.maybeSingle()` 결과 `null` | `!bookmark` 분기 → `ErrorState` ("해당 북마크를 찾을 수 없습니다.") |

모든 실패 케이스에서 페이지를 벗어나지 않고 인라인으로 오류를 표시한다. 재시도는 `refetch()` 직접 호출 또는 폼 재제출로 처리한다.

### 삭제·수정 후 목록 자동갱신 흐름

별도의 갱신 API 호출 없이 라우트 이동으로 자연스럽게 최신 데이터를 불러온다.

| 동작 | 이동 경로 | 갱신 원리 |
| --- | --- | --- |
| 삭제 성공 | `/bookmarks/:id` → `/bookmarks` | `BookmarksPage` 재마운트 → `useBookmarks`의 `useEffect` 재실행 → 최신 목록 재조회 |
| 수정 성공 | `/bookmarks/:id/edit` → `/bookmarks/:id` | `BookmarkDetailPage` 재마운트 → `useBookmark(id)`의 `useEffect` 재실행 → 수정된 단건 재조회 |
| 에러 재시도 | 동일 페이지 유지 | `ErrorState`의 재시도 버튼 → `refetch()` 직접 호출 → 로딩 상태 초기화 후 재조회 |

### 상태 → 렌더링 변화 포인트

| 상태 변화 | 렌더 결과 |
| --- | --- |
| `category` 드롭다운 선택 | `useMemo` 재계산 → 카드 목록 즉시 교체 (재조회 없음) |
| `loading: true → false` | `<Loading />` 사라지고 데이터/에러/빈 상태 렌더 |
| `errors.title` 설정 | `Input`에 `invalid` 클래스 + 필드 아래 에러 메시지 |
| `submitting: false → true` | 버튼 "처리 중..." + `disabled` |
| `deleteError` 설정 | 삭제 버튼 위에 에러 메시지 |

---

## 접근성(aria/role) 정책

공통 상태 컴포넌트에 ARIA 속성을 일관되게 적용했다.

| 컴포넌트 | ARIA 속성 | 의도 |
| --- | --- | --- |
| `Loading` | `role="status"` | 스크린 리더에 "로딩 중" 상태 알림 |
| `Loading` > spinner | `aria-hidden="true"` | CSS 스피너는 시각적 장식 요소 — 스크린 리더에서 숨김 |
| `ErrorState` | `role="alert"` | 스크린 리더에 즉시 오류 내용을 읽어줌 (assertive live region) |
| `BookmarkDetailPage` > 외부 링크 | `rel="noreferrer"` | 링크 대상이 `window.opener`에 접근하지 못하도록 보안 처리 |

`EmptyState`는 별도 ARIA role을 부여하지 않았다 — 빈 상태는 오류나 경고가 아니어서 사용자 주의를 즉시 끌 필요가 없기 때문이다.

---

## 폼 검증 정책

| 필드 | 검증 규칙 | 미검증 이유 |
| --- | --- | --- |
| `title` | 빈 문자열 불가 (`trim()`) | 필수 식별 정보 |
| `url` | 빈 문자열 불가 (`trim()`) | 핵심 데이터로 필수 |
| `url` 형식 | 미검증 | `http://`, `https://` 외 내부 링크·메모용 URL도 허용하기 위해 의도적으로 제외 |
| `memo` | 미검증 | 선택 입력 필드 |
| `category` | 미검증 | `<select>`로 상수 목록 내에서만 선택 가능 — 잘못된 값이 입력될 수 없음 |

에러 메시지는 제출 시 한 번에 표시하고, 해당 필드를 다시 입력하기 시작하는 순간 지워진다 (`handleChange` 내 에러 클리어).

---

## Supabase 선택 이유 및 연동 경험

**선택 이유**: PostgreSQL 기반이라 `schema.sql` 한 파일로 스키마·RLS 정책을 버전 관리할 수 있고, SDK 메서드 체이닝이 SQL과 1:1 대응되어 읽기 쉽다. Firebase(NoSQL)보다 단일 테이블 CRUD에 구조가 명확했다.

**연동 중 겪은 어려움**: `useEffect` + `useCallback` 의존성 배열 설정 실수로 무한 루프 발생. `refetch`를 `useCallback` 없이 의존성에 넣으면 렌더마다 새 함수 참조가 생겨 effect가 계속 재실행된다. `useCallback([])` / `useCallback([id])`로 메모이제이션해 해결했다.

**인증 미구현 근거**: 미션 평가 기준이 "React 구조·데이터 흐름"이며 인증은 선택 항목이다. RLS 정책으로 `anon` 키에 전체 CRUD를 허용하고 `schema.sql`에 근거를 주석으로 명시했다. 인증 추가 시 Supabase Auth + 보호 라우트 구조가 필요하며 이번 미션 스코프 외로 판단했다.

**연동 중 겪은 주요 에러와 해결:**

| 에러 | 원인 | 해결 |
| --- | --- | --- |
| `useEffect` 무한 루프 | `refetch`를 `useCallback` 없이 의존성에 넣어 렌더마다 새 참조 생성 | `useCallback([])` / `useCallback([id])`로 메모이제이션 |
| `.single()` 에러 | 없는 id 조회 시 단건이 아니라는 에러 발생 | `.maybeSingle()`로 교체 — 없으면 `null` 반환 |
| 환경변수 누락으로 앱 흰 화면 | `.env` 없이 실행 시 `supabase.js` 상단 throw | 조기에 에러를 던져 원인 명확화, `.env.example` 제공으로 가이드 |

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

### 파일 작성 규칙

| 대상 | 네이밍 | 예시 |
| --- | --- | --- |
| 페이지·UI 컴포넌트 | `PascalCase.jsx` | `BookmarkCard.jsx` |
| 커스텀 훅 | `camelCase.js` (`use` 접두어 필수) | `useBookmarks.js` |
| 유틸·클라이언트 | `camelCase.js` | `supabase.js`, `constants.js` |
| named export만 사용 | `export function Foo()` | default export는 `App.jsx`·`main.jsx`만 |

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

### 네비게이션 링크 구조

`Layout.jsx`의 헤더에 `NavLink` 3개가 고정된다. 현재 경로와 일치하는 링크에는 `active` 클래스가 자동으로 붙는다.

| 링크 | 경로 | `end` 옵션 |
| --- | --- | --- |
| 홈 | `/` | `true` — `/bookmarks` 등 하위 경로에서 active 방지 |
| 북마크 목록 | `/bookmarks` | — |
| 새 북마크 | `/bookmarks/new` | — |

`end={true}` 없이 `/`를 NavLink로 사용하면 모든 경로에서 항상 active 상태가 된다. `end` 옵션으로 경로가 정확히 `/`일 때만 활성화되도록 처리했다.

---

## 컴포넌트 설계 기준

페이지 컴포넌트(`pages/`)와 UI 컴포넌트(`components/`)를 아래 기준으로 분리했다.

- **페이지 컴포넌트**: 라우트 하나에 대응하는 최상위 화면. 데이터 조회·CRUD 요청, 라우팅(navigate) 등 "무엇을 할 것인가"를 담당한다.
- **UI 컴포넌트**: prop만 받아 화면을 그리는 역할만 한다. 외부 의존성(Supabase, Router)을 갖지 않아서, props가 같으면 항상 같은 결과를 렌더링한다.

### 컴포넌트 추출 기준

두 가지 규칙 중 하나라도 해당하면 컴포넌트로 추출했다.

1. **반복 패턴**: 동일한 UI 구조가 2곳 이상에 등장할 때
   - `Loading`, `ErrorState`, `EmptyState` — 목록·상세·수정 3개 페이지에서 동일하게 사용
   - `BookmarkForm` — 등록(`BookmarkNewPage`)과 수정(`BookmarkEditPage`)이 같은 필드 구성
2. **단일 책임**: 하나의 역할만 갖도록 경계를 그을 수 있을 때
   - `Button` — 클릭 요소의 스타일·상태만 담당 (내용·클릭 동작은 모름)
   - `BookmarkCard` — 카드 한 장 렌더만 담당 (목록·데이터 소스는 모름)
   - `BookmarkList` — 배열을 받아 카드를 나열하거나 EmptyState를 보여주는 역할만

재사용 컴포넌트 13개 (`components/` 폴더 전체):

| 컴포넌트 | 역할 | 사용 위치 |
| --- | --- | --- |
| `Layout` | 헤더·네비게이션 공통 레이아웃 | `App.jsx` (전 페이지 공통) |
| `Button` | variant/loading/disabled 버튼 | `BookmarkForm`, `BookmarkDetailPage`, `ErrorState` |
| `Input` | 텍스트 입력 + 에러 메시지 | `BookmarkForm` |
| `Textarea` | 여러 줄 입력 + 에러 메시지 | `BookmarkForm` |
| `Select` | 드롭다운 선택 | `BookmarkForm`, `CategoryFilter` |
| `Card` | 흰 카드 컨테이너 | `BookmarkCard` |
| `Loading` | 로딩 스피너 | `BookmarksPage`, `BookmarkDetailPage`, `BookmarkEditPage` |
| `ErrorState` | 에러 메시지 + 재시도 버튼 | `BookmarksPage`, `BookmarkDetailPage`, `BookmarkEditPage` |
| `EmptyState` | 데이터 없음 안내 | `BookmarkList` |
| `CategoryFilter` | 카테고리 드롭다운 필터 | `BookmarksPage` |
| `BookmarkCard` | 북마크 카드 한 장 | `BookmarkList` |
| `BookmarkList` | 카드 목록 (EmptyState 포함) | `BookmarksPage` |
| `BookmarkForm` | 등록/수정 공용 폼 | `BookmarkNewPage`, `BookmarkEditPage` |

---

## 커스텀 훅

### 분리한 이유

컴포넌트에서 직접 Supabase를 호출하면 같은 `useState` + `useEffect` 패턴이 여러 페이지에 중복된다. 훅으로 분리하면 세 가지 이점이 생긴다.

1. **재사용**: `useBookmark(id)`는 `BookmarkDetailPage`와 `BookmarkEditPage` 두 곳에서 동일하게 쓴다.
2. **관심사 분리**: 페이지 컴포넌트는 "어떻게 가져오는가"를 몰라도 된다. `loading`, `error`, `data`, `refetch`만 받아 화면에 집중한다.
3. **외부 호출**: `refetch`를 훅 밖에서 호출할 수 있어 삭제 후 목록 갱신, 에러 재시도에서 직접 사용한다.

### `useBookmarks()` — 목록 조회

```js
const { bookmarks, loading, error, refetch } = useBookmarks();
```

마운트 시 1회 Supabase에서 전체 북마크를 `created_at` 내림차순으로 가져온다. `refetch`는 `useCallback`으로 메모이제이션해 `useEffect` 무한 루프를 방지한다.

- 사용처: `BookmarksPage` (1곳)
- 재조회 트리거: 삭제 후 목록 페이지 재마운트, 에러 시 재시도 버튼

### `useBookmark(id)` — 단건 조회

```js
const { bookmark, loading, error, refetch } = useBookmark(id);
```

URL 파라미터 `id`가 바뀌면 자동으로 재조회한다 (`useCallback([id])` → `useEffect([refetch])`). `.maybeSingle()`로 결과 없을 때 에러 대신 `null`을 반환해 "찾을 수 없습니다" 화면을 별도 처리한다.

- 사용처: `BookmarkDetailPage`, `BookmarkEditPage` (2곳)
- 재조회 트리거: id 변경, 에러 시 재시도 버튼

**의존성 변화 시 예상 동작:**

| 상황 | 동작 |
| --- | --- |
| 같은 id로 재렌더 | `refetch` 참조 유지 → `useEffect` 재실행 안 함 |
| 다른 id로 이동 | `useCallback([id])`가 새 함수 생성 → `refetch` 참조 변경 → `useEffect` 재실행 → 새 id로 재조회 |
| 에러 후 재시도 | `ErrorState`의 `onRetry` → `refetch()` 직접 호출 → `loading` 초기화 후 재조회 |

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

### 배포 CRUD 동작 확인

배포 URL(https://codyssey-b1-2.vercel.app)에서 아래 시나리오를 순서대로 직접 실행·확인했다.

**시나리오 1 — 등록 (Create)**
```
1. /bookmarks/new 접속
2. 제목·URL 미입력 상태로 "등록" 클릭
   → "제목을 입력하세요.", "URL을 입력하세요." 인라인 에러 표시 ✓
3. 제목: "React 공식 문서", URL: "https://react.dev", 카테고리: "개발" 입력 후 등록
   → 버튼 "처리 중..." 비활성화 ✓
   → 성공 후 /bookmarks/{새id} 상세 페이지 자동 이동 ✓
```

**시나리오 2 — 목록 조회 & 필터 (Read)**
```
1. /bookmarks 접속
   → 로딩 스피너 표시 후 카드 목록 렌더 ✓
2. 카테고리 드롭다운 "개발" 선택
   → 페이지 새로고침 없이 개발 카테고리 카드만 표시 ✓
3. "전체 카테고리" 선택 → 전체 목록 복원 ✓
```

**시나리오 3 — 수정 (Update)**
```
1. 카드 클릭 → /bookmarks/:id 상세 이동
2. "수정" 버튼 → /bookmarks/:id/edit 이동
   → 폼에 기존 값(제목·URL·메모·카테고리) 초기화 확인 ✓
3. 제목 수정 후 "수정 완료" 클릭
   → /bookmarks/:id 상세 페이지로 이동, 수정된 제목 표시 ✓
```

**시나리오 4 — 삭제 (Delete)**
```
1. 상세 페이지 "삭제" 버튼 클릭
   → 버튼 "처리 중..." 비활성화 ✓
   → 성공 후 /bookmarks 목록 이동 ✓
   → 삭제된 항목 목록에서 미노출 ✓
```

**시나리오 5 — 에러 & 엣지 케이스**
```
1. 존재하지 않는 경로(/abcdef) 접속 → 404 NotFoundPage 표시 ✓
2. /bookmarks/new 브라우저 직접 입력 → SPA rewrite로 정상 렌더 ✓
3. 목록이 빈 상태 → "표시할 데이터가 없습니다." EmptyState 표시 ✓
```

| 시나리오 | 결과 |
| --- | --- |
| Create — 유효성 검증 + 등록 후 이동 | ✅ |
| Read — 목록 조회 + 카테고리 필터 | ✅ |
| Update — 기존 값 초기화 + 수정 후 이동 | ✅ |
| Delete — 삭제 후 목록 이동 + 미노출 | ✅ |
| Not Found, 직접 URL 접근, Empty 상태 | ✅ |

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

## 개선 계획

현재 미구현이지만 추후 개선 시 적용할 사항:

- **EmptyState 등록 유도 CTA**: `EmptyState`의 `action` prop에 `<Link to="/bookmarks/new">` 버튼을 넣으면 빈 목록에서 바로 등록 화면으로 유도할 수 있다. `BookmarkList`에 `action` 전달로 표준화 가능하다.
- **성공 토스트 알림**: 등록·수정·삭제 성공 후 `navigate()`로 페이지를 이동하므로 성공 피드백이 없다. Context 기반 토스트(전역 상태)를 도입하면 이동 후에도 "등록되었습니다" 메시지를 1~2초 표시할 수 있다.
- **URL 형식 검증**: 현재 빈값만 검사한다. `URL` 생성자(`new URL(value)`)로 형식을 검증하고 실패 시 "올바른 URL 형식이 아닙니다." 메시지를 추가할 수 있다. 단, `http://localhost` 같은 내부 링크도 허용하기 위해 의도적으로 제외했다.

---

## 보너스 과제

| 항목 | 구현 여부 | 내용 |
| --- | --- | --- |
| 전역 상태 | ✗ | 스코프 외 |
| 성능 최적화 (`useMemo` / `useCallback`) | ✓ | `BookmarksPage`에서 카테고리 필터 결과를 `useMemo`로 계산 — `bookmarks` 또는 `category`가 바뀔 때만 재계산. 두 커스텀 훅에서 `useCallback`으로 `refetch`를 메모이제이션해 `useEffect` 무한 루프 방지 |
| 인증 | ✗ | 스코프 외 |
