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
