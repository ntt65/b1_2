# 평가문항 QA

> 기술 스택 상세: [tech.md](./tech.md)

---

## 항목 1

### Q. 최소 5개 이상의 라우트가 동작하고, 잘못된 주소 접근 시 Not Found 페이지가 표시되는가?

**✅**

`App.jsx`에서 React Router v7로 6개 라우트를 선언했다.

| 경로 | 컴포넌트 | 동작 |
| --- | --- | --- |
| `/` | `HomePage` | 서비스 소개 + CTA |
| `/bookmarks` | `BookmarksPage` | 목록 + 카테고리 필터 |
| `/bookmarks/new` | `BookmarkNewPage` | 등록 폼 |
| `/bookmarks/:id` | `BookmarkDetailPage` | 상세 + 삭제 |
| `/bookmarks/:id/edit` | `BookmarkEditPage` | 수정 폼 |
| `*` | `NotFoundPage` | "404 페이지를 찾을 수 없습니다." + 홈으로 링크 |

`/bookmarks/new`를 `/bookmarks/:id`보다 앞에 선언해서 `new`가 id로 매칭되는 충돌을 방지했다. `vercel.json`의 rewrite 규칙으로 배포 환경에서 직접 URL 접근 시에도 React Router가 처리한다.

---

### Q. 목록 조회, 상세 조회, 등록, 수정, 삭제가 모두 정상 동작하는가?

**✅**

| 동작 | 파일 | Supabase 쿼리 |
| --- | --- | --- |
| 목록 조회 | `useBookmarks.js` | `.from("bookmarks").select("*").order("created_at", { ascending: false })` |
| 상세 조회 | `useBookmark.js` | `.from("bookmarks").select("*").eq("id", id).maybeSingle()` |
| 등록 | `BookmarkNewPage` → `handleCreate` | `.from("bookmarks").insert(values).select().single()` |
| 수정 | `BookmarkEditPage` → `handleUpdate` | `.from("bookmarks").update(values).eq("id", id)` |
| 삭제 | `BookmarkDetailPage` → `handleDelete` | `.from("bookmarks").delete().eq("id", id)` |

성공/실패 후 흐름: 등록 성공 → 새 레코드 상세(`/bookmarks/:id`) 이동. 수정 성공 → 해당 상세 이동. 삭제 성공 → 목록(`/bookmarks`) 이동.

---

### Q. 로딩/에러/빈 상태가 모든 핵심 화면에서 일관된 방식으로 표시되는가?

**✅**

세 가지 공용 컴포넌트로 통일했다. 페이지마다 별도로 구현하지 않는다.

| 상태 | 컴포넌트 | 특징 |
| --- | --- | --- |
| 로딩 중 | `Loading` | CSS 스피너 + 메시지, `role="status"` |
| 에러 | `ErrorState` | 메시지 + 재시도 버튼(선택), `role="alert"` |
| 빈 데이터 | `EmptyState` | 안내 메시지 + 선택적 액션 |

`BookmarksPage`, `BookmarkDetailPage`, `BookmarkEditPage` 세 화면 모두 동일한 패턴으로 처리한다.

```jsx
{loading && <Loading message="북마크를 불러오는 중..." />}
{!loading && error && <ErrorState message="요청에 실패했습니다." onRetry={refetch} />}
{!loading && !error && <BookmarkList bookmarks={filtered} />}
```

---

### Q. 폼에서 필수값 검증, 에러 메시지 표시, 제출 중 상태 표시가 동작하는가?

**✅**

`BookmarkForm.jsx`가 등록·수정 양쪽에서 공용으로 처리한다.

- **필수값 검증**: `validate()` 함수가 `title`, `url`의 `trim()` 결과가 빈 문자열이면 에러 객체를 반환한다.
- **에러 메시지**: `errors` state가 채워지면 `Input` 컴포넌트가 필드 아래에 `<p className="field-error">` 를 렌더하고 `invalid` 클래스로 테두리를 빨갛게 표시한다. 다시 입력을 시작하는 순간 해당 필드 에러가 지워진다.
- **제출 중 상태**: `submitting: true`이면 `Button`이 `disabled`되고 텍스트가 "처리 중..."으로 바뀐다. `try/finally`로 성공·실패 무관하게 제출 완료 시 해제된다.
- **요청 실패**: Supabase 에러 시 페이지가 `submitError` prop을 내려주고 폼 상단에 표시된다.

---

### Q. 배포된 URL에서 CRUD를 포함한 모든 기능이 정상 동작하는가?

**✅**

- 배포 URL: https://codyssey-b1-2.vercel.app
- Vercel 환경변수에 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` 등록 완료
- 목록 조회 / 카테고리 필터 / 상세 / 등록 / 수정 / 삭제 / Not Found 전부 배포 환경에서 동작 확인

---

## 항목 2

### Q. 데이터 조회/갱신 흐름 중 최소 1개 이상이 커스텀 훅으로 분리되어 있고 왜 분리했는지 설명할 수 있는가?

**✅ — 2개 훅**

**`src/hooks/useBookmarks.js`** — 목록 조회
```js
export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const refetch = useCallback(async () => { ... }, []);
  useEffect(() => { refetch(); }, [refetch]);
  return { bookmarks, loading, error, refetch };
}
```
- 사용처: `BookmarksPage` (1곳)

**`src/hooks/useBookmark.js`** — 단건 조회 (id 기반)
```js
export function useBookmark(id) {
  const [bookmark, setBookmark] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const refetch = useCallback(async () => {
    ...
    .eq("id", id).maybeSingle();   // 없으면 null, 에러 아님
  }, [id]);                         // id 바뀌면 새 함수 → useEffect 재실행
  useEffect(() => { refetch(); }, [refetch]);
  return { bookmark, loading, error, refetch };
}
```
- 사용처: `BookmarkDetailPage`, `BookmarkEditPage` (2곳)

**분리한 이유:**
1. **관심사 분리**: 페이지 컴포넌트가 Supabase 쿼리를 몰라도 된다. `{ loading, error, data, refetch }`만 받아 화면에 집중한다.
2. **재사용 제거 중복**: `useBookmark(id)` 없이 구현하면 `BookmarkDetailPage`와 `BookmarkEditPage` 두 곳에 동일한 `useState` + `useEffect` + Supabase 코드가 중복된다.
3. **외부 `refetch` 호출**: `ErrorState` 재시도 버튼에서 `refetch()`를 직접 호출한다. 훅 내부에 숨기면 외부 트리거가 불가능하다.

기술 상세 → [tech.md — useEffect + useCallback 패턴](./tech.md#useeffect--usecallback-패턴)

---

### Q. pages, components, hooks(또는 lib)로 폴더가 분리되어 있고 이 구조를 선택한 이유를 설명할 수 있는가?

**✅**

```
src/
├── pages/       ← 라우트 1:1 대응, 부수 효과(Supabase 요청, navigate) 담당
├── components/  ← props만 받아 렌더, 외부 의존성 없음
├── hooks/       ← 비동기 상태 로직 캡슐화
└── lib/         ← 외부 클라이언트 초기화(supabase.js), 상수(constants.js)
```

**이 구조를 선택한 이유:**

- `pages/`와 `components/`를 나누면 UI 컴포넌트가 Supabase나 Router에 의존하지 않는다. props만 바꿔서 어디서든 재사용할 수 있고 테스트도 쉽다.
- `hooks/`를 별도 폴더로 두면 "이 폴더 안의 파일은 상태 로직만 있다"는 약속이 된다. 나중에 로직을 찾거나 수정할 때 위치가 예측 가능하다.
- `lib/`는 앱 전체에서 쓰는 싱글턴(Supabase 클라이언트)과 상수를 분리한다. `supabase.js`를 여러 파일에서 import해도 항상 동일한 인스턴스를 쓴다.

---

### Q. 최소 8개 이상의 재사용 컴포넌트가 있고 어떤 기준으로 컴포넌트를 나눴는지 구체적으로 말할 수 있는가?

**✅ — 13개**

나누는 기준은 두 가지였다.

**기준 1 — 반복 패턴 추출**: 같은 UI가 여러 곳에서 쓰이면 컴포넌트로 뽑는다.
- `Loading`, `ErrorState`, `EmptyState`: 세 화면 모두 동일 패턴
- `BookmarkForm`: 등록과 수정 폼이 필드 구성이 같아서 `initialValues` prop 하나로 공용화

**기준 2 — 단일 책임**: "이 컴포넌트가 하는 일이 하나인가"를 기준으로 나눈다.
- `Button`: 클릭 가능한 요소의 스타일과 상태(`variant`, `loading`, `disabled`)만 담당
- `Input`, `Textarea`, `Select`: label + 입력 + 에러 메시지 하나의 블록으로 묶는 역할만
- `Card`: 흰 카드 컨테이너 역할만 (내용을 모름)
- `BookmarkCard`: 카드 한 장 렌더만 (목록이나 데이터 가져오는 방법을 모름)
- `BookmarkList`: 배열을 받아 카드를 나열하거나 EmptyState를 보여주는 역할만

---

### Q. 로딩/에러/빈 상태 UI가 페이지마다 따로 구현되지 않고 공통 컴포넌트로 통일되어 있는지 코드에서 보여줄 수 있는가?

**✅**

`BookmarksPage`, `BookmarkDetailPage`, `BookmarkEditPage` 세 파일을 열어보면 동일한 컴포넌트를 import한다.

```jsx
// 세 페이지 모두 동일한 import
import { Loading } from "../components/Loading";
import { ErrorState } from "../components/ErrorState";

// 세 페이지 모두 동일한 패턴
if (loading) return <Loading message="북마크를 불러오는 중..." />;
if (error)   return <ErrorState message="요청에 실패했습니다." onRetry={refetch} />;
```

빈 상태는 `BookmarkList` 내부에서 `EmptyState`를 렌더한다. 페이지가 빈 배열인지 직접 판단하지 않는다.

---

### Q. 커스텀 훅으로 분리한 데이터 흐름이 1개 이상 있고 왜 훅으로 분리했는지 이유를 말할 수 있는가?

앞의 항목 2 첫 번째 답변과 동일하다. `useBookmarks`, `useBookmark(id)` 2개 존재. 분리 이유: 관심사 분리 + 재사용 + 외부 `refetch` 호출 가능.

---

## 항목 3

### Q. props와 state의 차이를 구분하고 상태를 어디에 두었는지 흐름을 따라며 대답할 수 있는가?

**✅**

- **props**: 부모가 자식에게 내려주는 읽기 전용 값. 자식이 변경할 수 없다.
- **state**: 컴포넌트 자신이 소유하고 변경할 수 있는 값. 바뀌면 해당 컴포넌트가 리렌더된다.

**상태 배치 흐름:**

```
useBookmarks 훅
  └─ bookmarks, loading, error   ← 비동기 데이터. 훅이 소유 (여러 화면에서 동일 패턴 재사용)

BookmarksPage
  └─ category (state)            ← 카테고리 필터. 이 화면에서만 의미가 있으므로 로컬
      → filtered (useMemo)       ← category + bookmarks에서 파생, state가 아님
      → CategoryFilter에 value/onChange로 props 전달

BookmarkForm
  └─ values, errors, submitting  ← 폼 입력·검증·제출. 폼 내부 로직과 결합도가 높아 로컬
      → Input/Textarea/Select에 value, onChange, error를 props로 전달

BookmarkNewPage / BookmarkEditPage
  └─ submitError (state)         ← Supabase 에러 메시지. 페이지가 소유하고 BookmarkForm에 prop으로 전달
```

---

### Q. useEffect가 언제 실행되는지, 의존성 배열이 어떤 역할을 하는지 본인 코드 기준으로 짚어가며 답변할 수 있는가?

**✅**

`useBookmarks`와 `useBookmark` 두 훅에서 사용한다.

```js
// useBookmarks — 마운트 1회만 실행
const refetch = useCallback(async () => { ... }, []);
//                                                ↑ 의존성 없음 → 컴포넌트 생명주기 동안 같은 함수 참조 유지
useEffect(() => {
  refetch();
}, [refetch]);
// refetch가 항상 같은 참조 → useEffect는 마운트 시 1회만 실행됨

// useBookmark(id) — id 바뀔 때마다 재실행
const refetch = useCallback(async () => { ... }, [id]);
//                                                ↑ id가 바뀌면 새 함수 생성
useEffect(() => {
  refetch();
}, [refetch]);
// refetch 참조가 바뀌었으므로 useEffect 재실행 → 새 id로 재조회
```

의존성 배열의 역할: React가 이전 렌더와 현재 렌더의 배열 값을 비교(`Object.is`)해서 하나라도 달라졌으면 effect를 재실행한다. 빈 배열 `[]`이면 비교할 대상이 없어 마운트 1회만 실행된다.

기술 상세 → [tech.md — useEffect + useCallback 패턴](./tech.md#useeffect--usecallback-패턴)

---

### Q. 비동기 데이터 요청 시 로딩/성공/실패/빈 상태를 React에서 어떤 방식으로 처리했는지 보여주고 설명할 수 있는가?

**✅**

훅이 세 가지 state를 반환하고 컴포넌트가 조건부 렌더로 처리한다.

```js
// 훅 내부
const [data, setData] = useState([]);   // 성공 시 채워짐
const [loading, setLoading] = useState(true);  // 요청 중 true
const [error, setError] = useState(null);      // 실패 시 메시지

// 컴포넌트에서
{loading && <Loading />}                            // 로딩 중
{!loading && error && <ErrorState onRetry={refetch} />}  // 실패
{!loading && !error && <BookmarkList bookmarks={data} />} // 성공
// BookmarkList 내부: data.length === 0 → <EmptyState />  // 빈 데이터
```

네 가지 상태가 `loading`과 `error` 두 boolean 조합으로 완전히 구분되어 겹치지 않는다.

---

### Q. 상태 변경이 화면 변화로 이어지는 지점을 3군데 이상 코드에서 짚어가며 설명할 수 있는가?

**✅ — 5곳**

| # | 상태 변경 | 화면 변화 | 파일 |
| --- | --- | --- | --- |
| 1 | `category` 변경 (드롭다운 선택) | `useMemo`로 `filtered` 재계산 → `BookmarkList` 카드 목록 교체 | `BookmarksPage.jsx` |
| 2 | `loading: true → false` | `<Loading />` 사라지고 데이터/에러/빈 상태 중 하나 렌더 | 목록·상세·수정 페이지 |
| 3 | `errors.title` 설정 (제출 시 검증 실패) | `Input`에 `invalid` 클래스 + 필드 아래 에러 `<p>` 나타남 | `BookmarkForm.jsx` |
| 4 | `submitting: false → true` | `Button` 텍스트 "처리 중..." + `disabled` | `BookmarkForm.jsx` |
| 5 | `deleteError` 설정 (삭제 실패) | 상세 페이지 삭제 버튼 위에 에러 메시지 나타남 | `BookmarkDetailPage.jsx` |

---

## 항목 4

### Q. 하나의 기능이 동작하기까지 라우팅 → 컴포넌트 → 상태 → 이벤트 → 렌더링이 어떻게 이어지는지 설명할 수 있는가?

**✅ — 북마크 등록 흐름 예시**

```
1. [라우팅]
   네비게이션 "새 북마크" 클릭
   → React Router가 /bookmarks/new 매칭
   → BookmarkNewPage 렌더

2. [컴포넌트 + 상태 초기화]
   BookmarkNewPage가 BookmarkForm을 렌더
   → BookmarkForm 마운트 → values state 초기화 { title:"", url:"", memo:"", category:"개발" }

3. [이벤트 → 상태 → 렌더링]
   사용자가 제목 입력
   → input onChange 이벤트 발생
   → handleChange("title")(e) 호출
   → setValues(v => ({ ...v, title: e.target.value })) — state 변경
   → Input 컴포넌트 리렌더 → 입력값 화면에 반영

4. [이벤트 → 검증 → 상태 → 렌더링]
   제출 버튼 클릭
   → handleSubmit(e) — e.preventDefault()
   → validate(values) 실행 → 에러 있으면 setErrors → Input에 에러 표시 후 중단
   → 에러 없으면 setSubmitting(true) — Button "처리 중..." 렌더

5. [비동기 → 라우팅]
   await onSubmit(values) → BookmarkNewPage의 handleCreate 실행
   → supabase.insert(values).select().single()
   → 성공: navigate("/bookmarks/{새 id}") → 상세 페이지로 이동
   → 실패: submitError state 설정 → BookmarkForm 상단 에러 메시지 렌더
   → finally: setSubmitting(false)
```

---

### Q. Supabase 또는 Firebase를 선택한 이유와 연동하면서 겪은 어려움을 구체적으로 말할 수 있는가?

**✅**

**선택 이유 — Firebase 대신 Supabase를 선택한 근거:**

| 기준 | Supabase | Firebase |
| --- | --- | --- |
| DB 구조 | PostgreSQL — 컬럼·타입 명확, `schema.sql`로 버전 관리 가능 | NoSQL — 단순 CRUD에 컬렉션 설계 오버헤드 |
| SDK 가독성 | `.from("bookmarks").select("*").order(...)` — SQL과 1:1 | `.collection("bookmarks").orderBy(...)` — Firebase 전용 문법 |
| 보안 근거 명시 | RLS 정책을 `schema.sql`에 SQL로 작성 — "왜 anon 키가 안전한가" 코드로 증명 | Rules 파일 별도 — 연결이 덜 명확 |

**연동 중 겪은 어려움과 해결:**

| 에러 | 원인 | 해결 |
| --- | --- | --- |
| `useEffect` 무한 루프 | `refetch`를 `useCallback` 없이 의존성에 넣어 렌더마다 새 함수 참조 생성 | `useCallback([])` / `useCallback([id])`로 메모이제이션 |
| `.single()` PostgrestError | 없는 id 조회 시 결과가 0건이어서 에러 발생 | `.maybeSingle()`로 교체 — 없으면 `null` 반환 |
| 배포 후 흰 화면 | Vercel에 환경변수 미등록 → `supabase.js` 상단 `throw` 실행 | Vercel 대시보드 → Environment Variables 등록, 재배포 |

상세 → [tech.md — Supabase 선택 이유](./tech.md#supabase-선택-이유)

---

## 항목 5

### 보너스 문제 해결에 따른 크레딧 부여

| 보너스 항목 | 구현 | 내용 |
| --- | --- | --- |
| 전역 상태 (Context) | ❌ | 미구현 |
| 성능 최적화 (메모이제이션) | ✅ | `BookmarksPage`에서 `useMemo`로 카테고리 필터 결과 메모이제이션 — `bookmarks`나 `category`가 바뀔 때만 재계산. 두 커스텀 훅에서 `useCallback`으로 `refetch` 메모이제이션 — `useEffect` 무한 루프 방지 |
| 인증 (Supabase Auth + 보호 라우트) | ❌ | 미구현 |

---

## 6. 평가결과

| 항목 | 결과 |
| --- | --- |
| 항목 1 — 동작 검증 | ✅ 전항목 충족 |
| 항목 2 — 구조 설명 | ✅ 전항목 설명 가능 |
| 항목 3 — React 개념 | ✅ 전항목 코드 기준 설명 가능 |
| 항목 4 — 통합 흐름 | ✅ 등록 흐름 전 단계 추적 가능 |
| 항목 5 — 보너스 | ✅ 성능 최적화 (`useMemo`, `useCallback`) 구현 |

**필수 항목 전부 충족, 보너스 1개 추가 구현.**
