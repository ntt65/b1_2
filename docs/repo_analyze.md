# 리포지토리 분석 — b1_2 Bookmark Keeper

> 사용된 기술 스택 상세는 [tech.md](./tech.md) 참조.

---

## 1. 프로젝트 개요

개인용 북마크 관리 SPA. 읽고 싶은 URL을 카테고리별로 저장하고 메모를 남길 수 있다.
React + Supabase로 CRUD를 구현하고 Vercel에 배포한다.

- **배포 URL**: https://codyssey-b1-2.vercel.app
- **GitHub**: https://github.com/ntt65/b1_2

---

## 2. 폴더 구조

```
src/
├── App.jsx                       ← 라우트 트리 루트
├── main.jsx                      ← 진입점, BrowserRouter 마운트
├── index.css                     ← 전역 스타일
├── lib/
│   ├── supabase.js               ← Supabase 클라이언트 싱글턴
│   └── constants.js              ← 카테고리 상수 + Select 옵션
├── hooks/
│   ├── useBookmarks.js           ← 목록 조회 커스텀 훅
│   └── useBookmark.js            ← 단건 조회 커스텀 훅
├── pages/                        ← 라우트 1:1 대응 화면
│   ├── HomePage.jsx              ← /
│   ├── BookmarksPage.jsx         ← /bookmarks
│   ├── BookmarkDetailPage.jsx    ← /bookmarks/:id
│   ├── BookmarkNewPage.jsx       ← /bookmarks/new
│   ├── BookmarkEditPage.jsx      ← /bookmarks/:id/edit
│   └── NotFoundPage.jsx          ← *
└── components/                   ← 재사용 UI 컴포넌트 (13개)
    ├── Layout.jsx
    ├── Button.jsx
    ├── Input.jsx
    ├── Textarea.jsx
    ├── Select.jsx
    ├── Card.jsx
    ├── Loading.jsx
    ├── ErrorState.jsx
    ├── EmptyState.jsx
    ├── CategoryFilter.jsx
    ├── BookmarkCard.jsx
    ├── BookmarkList.jsx
    └── BookmarkForm.jsx
```

---

## 3. 라우팅 구조

`App.jsx`에서 Layout을 공통 부모로 두고 6개 라우트를 선언한다.
React Router v7의 `<Routes>` + `<Route>` 방식을 사용한다.

```
Layout (헤더 + Outlet)
├── /                          → HomePage
├── /bookmarks                 → BookmarksPage
├── /bookmarks/new             → BookmarkNewPage   ← :id보다 앞에 선언 (충돌 방지)
├── /bookmarks/:id             → BookmarkDetailPage
├── /bookmarks/:id/edit        → BookmarkEditPage
└── *                          → NotFoundPage
```

`vercel.json`의 `rewrite` 규칙으로 배포 환경에서도 직접 URL 접근이 가능하다.

---

## 4. 컴포넌트 설계

### 4.1 분리 기준

| 종류 | 위치 | 역할 |
| --- | --- | --- |
| 페이지 컴포넌트 | `pages/` | 라우트 1개에 대응. Supabase 요청, navigate 등 부수 효과를 담당 |
| UI 컴포넌트 | `components/` | props만 받아 화면을 그림. 외부 의존성(Supabase, Router) 없음 |

### 4.2 재사용 컴포넌트 목록 (13개)

| 컴포넌트 | 주요 props | 설명 |
| --- | --- | --- |
| `Layout` | `children` (Outlet) | 헤더·네비게이션 공통 레이아웃 |
| `Button` | `variant`, `loading`, `disabled` | primary/secondary/danger/ghost variant, loading 중 텍스트 대체 |
| `Input` | `label`, `error`, `id` | 텍스트 입력 + 에러 메시지 |
| `Textarea` | `label`, `error`, `id` | 여러 줄 입력 + 에러 메시지 |
| `Select` | `label`, `id`, `options` | 드롭다운 + options 배열 |
| `Card` | `className` | 흰 카드 컨테이너, className 확장 가능 |
| `Loading` | `message` | CSS 스피너 + 안내 텍스트, `role="status"` |
| `ErrorState` | `message`, `onRetry` | 에러 메시지 + 재시도 버튼, `role="alert"` |
| `EmptyState` | `message`, `action` | 데이터 없음 안내 + 선택적 액션 |
| `CategoryFilter` | `value`, `onChange` | 카테고리 드롭다운, 상태는 부모가 소유 |
| `BookmarkCard` | `bookmark` | 북마크 한 장 카드, 상세 링크 포함 |
| `BookmarkList` | `bookmarks` | 카드 목록, 빈 배열이면 EmptyState 표시 |
| `BookmarkForm` | `initialValues`, `onSubmit`, `submitLabel`, `submitError` | 등록/수정 공용 폼, 검증·제출 상태 내부 관리 |

---

## 5. 상태 관리

### 5.1 로컬 상태 (useState)

| 위치 | 상태 | 역할 |
| --- | --- | --- |
| `BookmarksPage` | `category` | 선택된 카테고리 필터 |
| `BookmarkDetailPage` | `deleting`, `deleteError` | 삭제 진행 여부, 삭제 에러 |
| `BookmarkNewPage` | `submitError` | 등록 실패 에러 |
| `BookmarkEditPage` | `submitError` | 수정 실패 에러 |
| `BookmarkForm` | `values`, `errors`, `submitting` | 폼 입력값, 검증 에러, 제출 중 여부 |
| `useBookmarks` | `bookmarks`, `loading`, `error` | 목록 데이터 + 비동기 상태 |
| `useBookmark` | `bookmark`, `loading`, `error` | 단건 데이터 + 비동기 상태 |

### 5.2 파생 상태 (useMemo)

`BookmarksPage`에서 `category`와 `bookmarks`를 기반으로 필터된 목록을 계산한다.
두 값 중 하나가 바뀔 때만 재계산하고 나머지 렌더에서는 이전 값을 재사용한다.

```js
const filtered = useMemo(
  () => category === "all" ? bookmarks : bookmarks.filter((b) => b.category === category),
  [bookmarks, category]
);
```

---

## 6. 데이터 흐름 (비동기)

### 6.1 커스텀 훅 구조

두 훅 모두 동일한 패턴을 따른다:

```
마운트 / id 변경
  → useEffect 실행
  → refetch() 호출 (useCallback으로 메모이제이션)
  → setLoading(true)
  → Supabase 요청
  → 성공: setData(data)
  → 실패: setError(message)
  → setLoading(false)
```

| 훅 | Supabase 쿼리 | 재조회 트리거 |
| --- | --- | --- |
| `useBookmarks` | `.select("*").order("created_at", { ascending: false })` | 마운트 1회, 외부에서 `refetch()` 호출 시 |
| `useBookmark(id)` | `.select("*").eq("id", id).maybeSingle()` | 마운트 + `id` 변경 시 |

### 6.2 CRUD 흐름

| 동작 | 페이지 | Supabase 호출 | 성공 후 |
| --- | --- | --- | --- |
| 목록 조회 | `BookmarksPage` | `select` (훅) | 카드 목록 렌더 |
| 상세 조회 | `BookmarkDetailPage` | `select + eq + maybeSingle` (훅) | 상세 렌더 |
| 등록 | `BookmarkNewPage` | `insert + select + single` | 새 레코드 상세 페이지 이동 |
| 수정 | `BookmarkEditPage` | `update + eq` | 해당 상세 페이지 이동 |
| 삭제 | `BookmarkDetailPage` | `delete + eq` | 목록 페이지 이동 |

---

## 7. 폼 UX 흐름

`BookmarkForm`이 등록·수정 양쪽에서 공용으로 사용된다.

```
입력 변경
  → setValues (해당 필드 업데이트)
  → errors[field] 있으면 지우기

제출 버튼 클릭
  → e.preventDefault()
  → validate(values) 실행
  → 에러 있으면 setErrors → 렌더 → 중단
  → setSubmitting(true) → 버튼 비활성화 + "처리 중..."
  → onSubmit(values) (페이지의 Supabase 요청)
  → finally: setSubmitting(false)
  → 페이지에서 에러면 submitError prop으로 폼 상단 표시
  → 성공이면 navigate()
```

---

## 8. 상태 → 렌더링 변화 포인트

| 상태 변화 | 결과 렌더 변화 |
| --- | --- |
| `category` 변경 | `filtered` 재계산 → `BookmarkList` 카드 목록 교체 |
| `loading: true → false` | `<Loading />` 사라지고 데이터/에러/빈 상태 중 하나 렌더 |
| `errors.title` 설정 | `Input`의 `invalid` 클래스 + 에러 메시지 `<p>` 나타남 |
| `submitting: false → true` | 버튼 텍스트 "처리 중…" + `disabled` |
| `deleteError` 설정 | 상세 페이지 삭제 버튼 아래에 에러 메시지 나타남 |

---

## 9. 보안 및 환경변수

- Supabase 키는 `.env`에 저장하고 `.gitignore`로 커밋 제외
- `.env.example`로 키 구조 공개 (실제 값 제외)
- Vercel 배포 시 Environment Variables에 별도 등록
- RLS 정책: `anon` 키 전체 CRUD 허용 (학습 범위 — 인증 미구현)

---

## 10. 미션 요구사항 충족 체크

| 요구사항 | 충족 여부 | 근거 |
| --- | --- | --- |
| 라우팅 5개 이상 | ✓ | 6개 라우트 |
| 목록/상세 라우트 | ✓ | `/bookmarks`, `/bookmarks/:id` |
| Not Found 페이지 | ✓ | `*` → `NotFoundPage` |
| 재사용 컴포넌트 8개 이상 | ✓ | 13개 |
| 커스텀 훅 1개 이상 | ✓ | `useBookmarks`, `useBookmark` |
| CRUD 전체 | ✓ | 목록/상세 조회, 등록, 수정, 삭제 |
| 폼 필수값 검증 + 에러 표시 | ✓ | `validate()`, `errors` state |
| 제출 중 상태 | ✓ | `submitting` state → 버튼 비활성화 |
| 로딩/에러/빈 상태 통일 | ✓ | `Loading`, `ErrorState`, `EmptyState` 재사용 |
| 상태 변화 → 렌더 변화 3곳 이상 | ✓ | 5곳 이상 (8번 항목 참조) |
| 배포 | ✓ | Vercel, SPA rewrite 설정 완료 |
| useMemo (보너스) | ✓ | `BookmarksPage` 카테고리 필터 |
