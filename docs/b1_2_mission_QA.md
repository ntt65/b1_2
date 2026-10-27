# 미션 요구사항 QA — b1_2 Bookmark Keeper

> 미션 원문: [b1_2_mission.md](./b1_2_mission.md)

---

## 2. 최종 결과물

### 1) 라우팅이 있는 SPA

> 예: `/`, `/login`, `/items`, `/items/:id`, `/items/new`, `/profile`

**✅ 충족**

`App.jsx`에서 React Router v7 기반으로 6개 라우트를 선언했다.

| 경로 | 컴포넌트 |
| --- | --- |
| `/` | `HomePage` |
| `/bookmarks` | `BookmarksPage` |
| `/bookmarks/new` | `BookmarkNewPage` |
| `/bookmarks/:id` | `BookmarkDetailPage` |
| `/bookmarks/:id/edit` | `BookmarkEditPage` |
| `*` | `NotFoundPage` |

---

### 2) 핵심 데이터 CRUD

> 서비스의 핵심 데이터를 등록/조회/수정/삭제할 수 있다. 목록 페이지와 상세 페이지가 존재한다.

**✅ 충족**

Supabase `bookmarks` 테이블을 대상으로 전체 CRUD가 구현되어 있다.

| 동작 | 파일 | Supabase 호출 |
| --- | --- | --- |
| 목록 조회 | `BookmarksPage` + `useBookmarks` | `.select("*").order("created_at", { ascending: false })` |
| 상세 조회 | `BookmarkDetailPage` + `useBookmark` | `.select("*").eq("id", id).maybeSingle()` |
| 등록 | `BookmarkNewPage` → `handleCreate` | `.insert(values).select().single()` |
| 수정 | `BookmarkEditPage` → `handleUpdate` | `.update(values).eq("id", id)` |
| 삭제 | `BookmarkDetailPage` → `handleDelete` | `.delete().eq("id", id)` |

목록 페이지(`/bookmarks`)와 상세 페이지(`/bookmarks/:id`)가 분리되어 있다.

---

### 3) React 폼 기반 입력 경험

> 등록/수정 화면에 폼이 있고, 유효성 검증 + 에러 표시 + 제출 중 상태가 UI로 드러난다.

**✅ 충족**

`BookmarkForm.jsx`가 등록·수정 양쪽에서 공용으로 사용된다.

- **유효성 검증**: `validate()` 함수가 `title`, `url` 필수값을 검증하고 에러 객체를 반환한다.
- **에러 표시**: 검증 실패 시 `errors` state가 채워지고, `Input`/`Textarea`에 `error` prop으로 전달되어 필드 아래에 인라인으로 표시된다. `invalid` 클래스로 테두리도 빨간색이 된다.
- **제출 중 상태**: `submitting` state가 `true`이면 Button이 `disabled`되고 텍스트가 "처리 중..."으로 바뀐다.
- **요청 실패**: Supabase 에러 시 `submitError`가 폼 상단에 표시된다.

---

### 4) 상태 관리가 설계된 UI

> 로딩/에러/빈 상태가 모든 핵심 화면에서 일관된 방식으로 처리된다. 컴포넌트 단위로 상태가 적절히 분리되어 있다.

**✅ 충족**

세 가지 공용 컴포넌트로 통일되어 있다.

| 상태 | 컴포넌트 | 적용 화면 |
| --- | --- | --- |
| 로딩 중 | `Loading` (`role="status"`) | `BookmarksPage`, `BookmarkDetailPage`, `BookmarkEditPage` |
| 에러 | `ErrorState` (`role="alert"`, 재시도 버튼) | 동일 |
| 빈 데이터 | `EmptyState` | `BookmarkList` |

상태 분리: 데이터·비동기 상태는 커스텀 훅이 소유하고, 폼 상태는 `BookmarkForm`이 로컬로 소유한다. 페이지는 CRUD 요청과 라우팅만 담당한다.

---

### 5) 배포

> 외부에서 접속 가능한 제출 URL로 배포. GitHub 레포지토리 URL 함께 제출. README에 실행 방법과 기술 스택 명시.

**✅ 충족**

- **배포 URL**: https://codyssey-b1-2.vercel.app (Vercel)
- **GitHub URL**: https://github.com/ntt65/b1_2
- **README**: 로컬 실행 방법(`npm install` → `cp .env.example .env` → `npm run dev`), 기술 스택 표, 폴더 구조, 라우트 목록, 상태-렌더링 흐름 설명 포함

---

## 3. 과제 목표

### Q1. 컴포넌트가 왜 필요한지, 어떤 기준으로 쪼갰는지 설명할 수 있는가?

**✅**

두 기준으로 분리했다.

1. **페이지 vs UI**: `pages/`는 라우트 1개에 대응하고 Supabase 요청·navigate 같은 부수 효과를 담당한다. `components/`는 props만 받아 화면을 그리며 외부 의존성이 없다.
2. **반복 패턴 추출**: 로딩/에러/빈 상태는 모든 화면에서 동일하게 나타나므로 `Loading`, `ErrorState`, `EmptyState`로 뽑아냈다. 등록·수정 폼이 동일한 구조이므로 `BookmarkForm` 하나로 통일했다.

---

### Q2. props와 state의 차이, 상태를 어디에 두었는지 설명할 수 있는가?

**✅**

- **props**: 부모가 자식에게 내려주는 읽기 전용 값. 예) `BookmarkForm`이 받는 `initialValues`, `onSubmit`, `submitError`.
- **state**: 컴포넌트가 직접 소유하고 변경할 수 있는 값. 변경되면 해당 컴포넌트가 리렌더된다.

상태 배치:
- 비동기 데이터(`bookmarks`, `loading`, `error`)는 커스텀 훅이 소유 — 여러 페이지가 같은 패턴을 재사용할 수 있도록 분리.
- 카테고리 필터(`category`)는 `BookmarksPage`가 소유 — 필터 결과(`filtered`)는 이 컴포넌트 안에서만 의미가 있기 때문.
- 폼 값(`values`, `errors`, `submitting`)은 `BookmarkForm`이 소유 — 폼 내부 검증 로직과 결합도가 높기 때문.

---

### Q3. useEffect가 언제 실행되고, 어떤 의존성으로 동작하며, 데이터 요청과 어떤 관계가 있는지 설명할 수 있는가?

**✅**

`useBookmarks`와 `useBookmark` 두 훅에서 동일한 패턴을 사용한다.

```js
// useBookmarks: 마운트 1회만 실행
const refetch = useCallback(async () => { ... }, []);   // 의존성 없음 → 항상 같은 참조
useEffect(() => { refetch(); }, [refetch]);              // refetch 불변 → 마운트 1회

// useBookmark: id가 바뀌면 재실행
const refetch = useCallback(async () => { ... }, [id]); // id 바뀌면 새 함수 생성
useEffect(() => { refetch(); }, [refetch]);              // refetch 바뀌면 재실행 → id 바뀌면 재조회
```

`useCallback`으로 함수를 메모이제이션해야 `useEffect`의 의존성 배열이 안정되어 무한 루프가 생기지 않는다.

---

### Q4. 비동기 흐름에서 로딩/성공/실패/빈 상태를 React UI로 어떻게 표현했는지 설명할 수 있는가?

**✅**

훅이 `loading`, `error`, 데이터 세 가지를 반환하고 페이지에서 조건부 렌더로 처리한다.

```jsx
// BookmarksPage 예시
{loading && <Loading message="북마크를 불러오는 중..." />}
{!loading && error && <ErrorState message="요청에 실패했습니다." onRetry={refetch} />}
{!loading && !error && <BookmarkList bookmarks={filtered} />}
// BookmarkList 내부: bookmarks.length === 0 이면 <EmptyState />
```

4가지 상태가 서로 겹치지 않도록 `!loading &&` 조건으로 구분했다.

---

### Q5. 라우팅 → 컴포넌트 → 상태 → 이벤트 → 렌더링이 어떻게 연결되는지 설명할 수 있는가?

**✅**

북마크 등록 흐름을 예시로 설명한다.

```
1. 사용자가 네비게이션에서 "새 북마크" 클릭
   → React Router가 /bookmarks/new 로 이동
   → BookmarkNewPage 렌더

2. BookmarkForm 마운트 → values state 초기화 (title:"", url:"", ...)

3. 사용자가 제목 입력
   → onChange 이벤트 → handleChange("title") 호출
   → setValues로 title 필드 업데이트 (state 변경)
   → Input 컴포넌트 리렌더 → 새 값 표시

4. 제출 버튼 클릭
   → handleSubmit → validate() → 에러 없음
   → setSubmitting(true) → Button "처리 중..." 렌더
   → Supabase insert 요청 (비동기)
   → 성공: navigate("/bookmarks/:id") → 상세 페이지 이동
   → 실패: submitError state 설정 → 폼 상단 에러 메시지 렌더
```

---

## 4. 기능 요구사항

### 1) 프로젝트 기본 구성

| 항목 | 체크 | 근거 |
| --- | --- | --- |
| React 프로젝트로 시작 | ✅ | Vite + React 19, `package.json` 확인 |
| `pages/` 분리 | ✅ | `src/pages/` — 6개 페이지 컴포넌트 |
| `components/` 분리 | ✅ | `src/components/` — 13개 UI 컴포넌트 |
| `hooks/` 또는 `lib/` 분리 | ✅ | `src/hooks/` (커스텀 훅), `src/lib/` (Supabase 클라이언트, 상수) |
| 공통 레이아웃(헤더/네비게이션) 적용 | ✅ | `Layout.jsx` — React Router `<Outlet>`으로 모든 페이지에 헤더·네비 적용 |

---

### 2) 라우팅

| 항목 | 체크 | 근거 |
| --- | --- | --- |
| 최소 5개 라우트 동작 | ✅ | 6개 (`/`, `/bookmarks`, `/bookmarks/new`, `/bookmarks/:id`, `/bookmarks/:id/edit`, `*`) |
| 목록/상세 라우트 포함 | ✅ | `/bookmarks` (목록), `/bookmarks/:id` (상세) |
| Not Found 페이지 | ✅ | `*` → `NotFoundPage` ("404 페이지를 찾을 수 없습니다.") |
| 네비게이션 링크 제공 | ✅ | `Layout.jsx`의 `NavLink`로 홈, 목록, 새 북마크 이동 가능. 현재 경로에 active 클래스 자동 부여 |

---

### 3) 컴포넌트 설계

| 항목 | 체크 | 근거 |
| --- | --- | --- |
| 재사용 컴포넌트 8개 이상 | ✅ | 13개 (`Layout`, `Button`, `Input`, `Textarea`, `Select`, `Card`, `Loading`, `ErrorState`, `EmptyState`, `CategoryFilter`, `BookmarkCard`, `BookmarkList`, `BookmarkForm`) |
| 최소 1개 이상의 prop으로 동작이 달라지는 컴포넌트 | ✅ | 예) `Button`: `variant` prop으로 primary/secondary/danger/ghost 스타일 분기. `loading` prop으로 텍스트/비활성화 분기. `ErrorState`: `onRetry` 유무로 재시도 버튼 렌더 여부 분기 |
| 페이지와 UI 컴포넌트 분리 | ✅ | `pages/`는 Supabase·navigate 담당, `components/`는 props만 받아 렌더 |
| 로딩/에러/빈 상태 재사용 컴포넌트로 통일 | ✅ | `Loading`, `ErrorState`, `EmptyState` — 매 페이지에서 별도 구현 없이 동일 컴포넌트 사용 |

---

### 4) 상태 관리

| 항목 | 체크 | 근거 |
| --- | --- | --- |
| 폼 입력 상태 (controlled input) | ✅ | `BookmarkForm`의 `values` state — 모든 input이 `value={values.xxx}`로 제어됨 |
| 목록/상세 데이터 상태 | ✅ | `useBookmarks`의 `bookmarks` state, `useBookmark`의 `bookmark` state |
| 로딩/에러 상태 | ✅ | 두 훅 모두 `loading`, `error` state 관리 |
| 커스텀 훅으로 분리 (1개 이상) | ✅ | `useBookmarks()` (목록), `useBookmark(id)` (단건) — 2개 |

---

### 5) CRUD (원격 데이터 연동)

| 항목 | 체크 | 근거 |
| --- | --- | --- |
| 목록 조회 | ✅ | `useBookmarks` → Supabase `select` → `BookmarkList` 렌더 |
| 상세 조회 | ✅ | `useBookmark(id)` → URL 파라미터 id로 단건 조회 → `BookmarkDetailPage` 렌더 |
| 등록 | ✅ | `BookmarkNewPage.handleCreate` → `insert` → 성공 시 새 레코드 상세 이동 |
| 수정 | ✅ | `BookmarkEditPage.handleUpdate` → `update().eq("id", id)` → 성공 시 상세 이동 |
| 삭제 | ✅ | `BookmarkDetailPage.handleDelete` → `delete().eq("id", id)` → 성공 시 목록 이동 |

---

### 6) 폼 UX

| 항목 | 체크 | 근거 |
| --- | --- | --- |
| 필수값 검증 | ✅ | `validate()` — `title.trim()`, `url.trim()` 빈값 시 에러 반환 |
| 에러 메시지 표시 | ✅ | `Input`/`Textarea`의 `error` prop → 필드 바로 아래 `<p className="field-error">` 표시 |
| 제출 중 버튼 비활성화/스피너 | ✅ | `submitting: true` → `Button`의 `disabled` + 텍스트 "처리 중..." |
| 요청 실패 시 화면에 표시 | ✅ | Supabase 에러 → `submitError` state → 폼 상단 `<p className="field-error form-error">` |

---

### 7) React 이벤트 & 렌더링

| 항목 | 체크 | 근거 |
| --- | --- | --- |
| 이벤트 → 상태 변경 → 렌더링 변화 흐름 명확 | ✅ | 아래 3곳 이상 명확히 드러남 |

**상태 변화 → 렌더 변화 포인트 (5곳)**

| 상태 변화 | 렌더 결과 |
| --- | --- |
| `category` 변경 (드롭다운 선택) | `filtered` useMemo 재계산 → `BookmarkList` 카드 목록 교체 |
| `loading: true → false` | `<Loading />` 사라지고 데이터/에러/빈 상태 렌더 |
| `errors.title` 설정 (제출 시 검증 실패) | `Input`에 `invalid` 클래스 + 에러 메시지 `<p>` 나타남 |
| `submitting: false → true` | `Button` 텍스트 "처리 중..." + `disabled` |
| `deleteError` 설정 (삭제 실패) | 상세 페이지 삭제 버튼 위에 에러 메시지 나타남 |

---

### 8) 배포

| 항목 | 체크 | 근거 |
| --- | --- | --- |
| 목록/상세 조회 동작 | ✅ | Vercel 환경변수에 Supabase 키 등록, 앱 배포 완료 |
| 등록/수정/삭제 동작 | ✅ | 동일 |
| 환경변수 누락으로 인한 기능 불동작 없음 | ✅ | Vercel 대시보드에 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` 등록 |

---

## 5. 보너스 과제

| 항목 | 체크 | 내용 |
| --- | --- | --- |
| 전역 상태 (Context 등) | ❌ | 미구현 — 이번 미션 스코프 외 |
| 성능 최적화 (`useMemo` / `useCallback` / `React.memo`) | ✅ | `BookmarksPage`에서 `useMemo`로 카테고리 필터 결과를 메모이제이션. 두 커스텀 훅에서 `useCallback`으로 `refetch` 함수를 메모이제이션해 `useEffect` 무한 루프 방지 |
| 인증 추가 (Supabase Auth + 보호 라우트) | ❌ | 미구현 — 이번 미션 스코프 외 |

---

## 7. 제약 사항

| 제약 | 체크 | 근거 |
| --- | --- | --- |
| React 기반 구현 | ✅ | React 19 + JSX |
| Supabase 또는 Firebase 사용 | ✅ | Supabase (Postgres + PostgREST) |
| 라우팅 존재, pages/components/hooks 분리 | ✅ | 위 항목들 참조 |
| TypeScript 미사용 (선택) | ✅ | JavaScript만으로 구현 |
| `.env`에 API Key 저장, `.gitignore` 포함 | ✅ | `.gitignore`에 `.env`, `.env.local` 포함. `.env.example` 제공 |
| API Key GitHub 푸시 금지 | ✅ | `.env`가 `.gitignore`에 포함되어 있어 커밋되지 않음 |
| Vercel 환경변수 별도 등록 | ✅ | Vercel 대시보드에 등록 완료 |

---

## 결론

**필수 요구사항 전체 충족.** 보너스 과제 중 성능 최적화(`useMemo`, `useCallback`)를 추가로 구현했다.
