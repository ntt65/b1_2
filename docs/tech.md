# 기술 스택

## 런타임 · 언어

| 항목 | 버전 | 용도 |
| --- | --- | --- |
| JavaScript (ESM) | ES2020+ | 앱 전체 언어, `"type": "module"` |
| JSX | — | React 컴포넌트 템플릿 문법 |

## 프론트엔드

| 라이브러리 | 버전 | 용도 |
| --- | --- | --- |
| React | ^19.2.7 | UI 컴포넌트 및 상태 관리 (`useState`, `useEffect`, `useMemo`, `useCallback`) |
| React DOM | ^19.2.7 | React를 브라우저 DOM에 마운트 (`createRoot`) |
| React Router DOM | ^7.18.1 | SPA 클라이언트 사이드 라우팅 (`BrowserRouter`, `Routes`, `Route`, `NavLink`, `Outlet`, `useParams`, `useNavigate`, `Link`) |

## 백엔드 (BaaS)

| 항목 | 버전 | 용도 |
| --- | --- | --- |
| Supabase JS | ^2.110.8 | Postgres 기반 원격 DB CRUD (`select`, `insert`, `update`, `delete`) |
| Supabase (서버) | — | PostgreSQL 호스팅 + PostgREST API + Row Level Security(RLS) |

### Supabase 테이블 구조 (`bookmarks`)

| 컬럼 | 타입 | 제약 |
| --- | --- | --- |
| `id` | `uuid` | PK, `gen_random_uuid()` 기본값 |
| `title` | `text` | NOT NULL |
| `url` | `text` | NOT NULL |
| `memo` | `text` | nullable |
| `category` | `text` | NOT NULL, 기본값 `'etc'` |
| `created_at` | `timestamptz` | NOT NULL, `now()` 기본값 |

RLS 정책: `anon` 키에 전체 CRUD 허용 (학습 범위 앱, 인증 불필요).

## 빌드 도구

| 도구 | 버전 | 용도 |
| --- | --- | --- |
| Vite | ^8.1.1 | 개발 서버 (`npm run dev`), 번들링 (`npm run build`), 미리보기 (`npm run preview`) |
| @vitejs/plugin-react | ^6.0.3 | Vite에서 JSX 변환 및 React Fast Refresh 지원 |

## 린터

| 도구 | 버전 | 용도 |
| --- | --- | --- |
| oxlint | ^1.71.0 | ESLint 대체 Rust 기반 린터, `npm run lint` |

## devDependencies

| 패키지 | 용도 |
| --- | --- |
| `@types/react` ^19.2.17 | TypeScript 미사용이지만 IDE(VS Code)가 JSX props 타입을 자동 완성할 때 참조 |
| `@types/react-dom` ^19.2.3 | 동일 — `createRoot` 등 React DOM API 타입 힌트 |

TypeScript를 쓰지 않아도 `@types/*`가 있으면 VS Code IntelliSense가 `useState<string>()` 대신 `useState("")`처럼 추론해서 편집 경험이 개선된다.

## npm 스크립트

| 명령어 | 내부 실행 | 용도 |
| --- | --- | --- |
| `npm run dev` | `vite` | 개발 서버 (HMR, `http://localhost:5173`) |
| `npm run build` | `vite build` | 프로덕션 번들 → `dist/` |
| `npm run preview` | `vite preview` | `dist/`를 로컬에서 미리보기 (배포 전 확인용) |
| `npm run lint` | `oxlint` | 정적 분석 |

## 스타일링

순수 CSS를 사용한다 (`src/index.css` 단일 파일). CSS Modules, Tailwind, styled-components 등 별도 도구 없이 클래스명으로 스타일을 관리한다.

주요 클래스 규약:

| 클래스 | 용도 |
| --- | --- |
| `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-danger`, `.btn-ghost` | 버튼 variant |
| `.field`, `.field-error` | 폼 필드 + 에러 메시지 |
| `.invalid` | 검증 실패 input 테두리 강조 |
| `.state`, `.state-loading`, `.state-error`, `.state-empty` | 공통 상태 레이아웃 |
| `.card`, `.bookmark-card` | 카드 컨테이너 |
| `.app-shell`, `.app-header`, `.app-main` | 전체 레이아웃 |

## 배포

| 항목 | 내용 |
| --- | --- |
| 플랫폼 | Vercel |
| SPA 라우팅 | `vercel.json`의 `"rewrites"` 규칙으로 모든 경로를 `index.html`로 rewrite |
| 환경변수 | Vercel 대시보드 → Settings → Environment Variables 에 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` 등록 |

## 환경변수

| 변수 | 설명 |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase 프로젝트 URL (`https://<ref>.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon 공개 키 |

로컬 실행 시 `.env.example`을 복사해 `.env`를 만들고 값을 채운다.

---

## React StrictMode 개발 동작

`main.jsx`에서 `<StrictMode>`로 앱을 감싸고 있다. StrictMode는 **개발 모드에서만** 컴포넌트를 두 번 마운트하고 `useEffect`를 두 번 실행한다 (프로덕션에서는 1회).

```text
개발 모드 실행 순서:
mount → effect 실행 → unmount → mount → effect 실행  ← 이것이 실제 동작
```

이 앱에서는 `useBookmarks`와 `useBookmark`의 `useEffect`가 개발 중 Supabase를 **두 번 호출**한다. 이는 의도된 동작으로, 부수 효과가 멱등(idempotent)한지 확인하기 위한 React의 설계다. 네트워크 탭에서 GET 요청이 2번 보여도 버그가 아니다.

프로덕션 빌드(`npm run build` → Vercel 배포)에서는 정상적으로 1회만 호출된다.

---

## Supabase 선택 이유

이 미션의 평가 기준이 "백엔드 구현"이 아니라 "React 구조와 데이터 흐름"이기 때문에, 백엔드를 직접 구현하지 않고 BaaS를 선택했다.

Firebase 대신 Supabase를 선택한 구체적인 이유는 세 가지다.

1. **SQL 기반**: Supabase는 PostgreSQL을 그대로 사용한다. 테이블·컬럼 구조가 명확하고, `schema.sql` 한 파일로 스키마를 버전 관리할 수 있다. Firebase의 NoSQL 방식은 중첩 컬렉션 설계가 필요해 이번처럼 단순한 단일 테이블 CRUD에는 오히려 복잡하다.
2. **JavaScript SDK가 직관적**: `supabase.from("bookmarks").select("*").order(...)` 형태로 쿼리 의도를 그대로 읽을 수 있다. 메서드 체이닝 구조가 SQL과 1:1 대응되어 학습 비용이 낮다.
3. **RLS(Row Level Security)로 anon 키 노출 허용**: 이 앱은 인증이 없다. Firebase Rules도 유사하게 설정할 수 있지만, Supabase는 `schema.sql`에 RLS 정책을 SQL로 명시적으로 작성할 수 있어 "왜 anon 키가 노출되어도 되는가"를 코드로 증명할 수 있다.

**연동 중 겪은 어려움**: `useEffect` + `useCallback` 조합에서 의존성 배열을 잘못 설정하면 무한 루프가 발생한다. `refetch`를 `useCallback` 없이 `useEffect` 의존성에 넣으면 렌더마다 새 함수가 생성되어 `useEffect`가 계속 재실행된다. `useCallback([])` / `useCallback([id])`로 함수를 메모이제이션해서 해결했다.

---

## useEffect + useCallback 패턴

커스텀 훅에서 사용한 패턴이다.

```js
// useBookmarks — 마운트 1회만 조회
const refetch = useCallback(async () => {
  // Supabase 요청
}, []);                          // 의존성 없음 → 항상 같은 함수 참조

useEffect(() => {
  refetch();
}, [refetch]);                   // refetch 불변 → 마운트 1회만 실행

// useBookmark(id) — id가 바뀌면 재조회
const refetch = useCallback(async () => {
  // Supabase 요청 (id 사용)
}, [id]);                        // id 바뀌면 새 함수 생성

useEffect(() => {
  refetch();
}, [refetch]);                   // refetch 바뀌면 재실행 → id 변경 시 재조회
```

`useCallback` 없이 일반 `async function`을 `useEffect` 안에서 직접 선언·호출하는 방법도 있지만, 이 방식은 `refetch()`를 외부(삭제 후 목록 갱신 등)에서 호출할 수 없다. 외부 재호출이 필요하기 때문에 `useCallback`으로 분리했다.
