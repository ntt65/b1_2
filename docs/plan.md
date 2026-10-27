# b1_2 보완 작업 계획

분석 결과 기반 (`b1_2_check_and_rebuild_plan.md`)

## 현황 요약

- 라우팅, CRUD, 폼, 상태관리, 컴포넌트 분리 — 미션 핵심 구현 완료
- 배포 URL: **https://codyssey-b1-2.vercel.app**
- `vercel.json` — SPA 라우팅 rewrite 설정 완료 (`/(.*) → /index.html`)

---

## 작업 목록

### ✅ 1. `.gitignore` 정비
- `node_modules/`, `dist/`, `.env`, `.env.local` 등 표준 항목 추가
- 기존 `Naito.md` 유지
- **완료**

### ✅ 2. `.env.example` 생성
- `VITE_SUPABASE_URL=your-supabase-project-url`
- `VITE_SUPABASE_ANON_KEY=your-supabase-anon-key`
- **완료**

### 🔲 3. 빌드 검증 — `npm install && npm run build`
- node_modules 없음 → 설치 필요
- Supabase 키 없어도 빌드 자체는 통과 예상 (런타임 에러, 빌드 에러 아님)
- **대기 중** — `npm install` 승인 필요

### 🔲 4. Vercel 환경변수 등록 확인
- Vercel 대시보드 → Settings → Environment Variables
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` 등록 여부 확인
- **Supabase 키 있을 때 진행**

### 🔲 5. 배포 URL에서 CRUD 전 기능 동작 확인
- https://codyssey-b1-2.vercel.app 에서 직접 확인
- 목록 조회 / 북마크 생성 / 수정 / 삭제 / 카테고리 필터 / 404
- **키 + 배포 완료 후 진행**

---

## 우선순위

| 순서 | 항목 | 상태 | 비고 |
|------|------|------|------|
| 1 | `.gitignore` 정비 | ✅ 완료 | |
| 2 | `.env.example` 생성 | ✅ 완료 | |
| 3 | 빌드 검증 | 🔲 대기 | npm install 승인 필요 |
| 4 | Vercel 환경변수 | 🔲 대기 | Supabase 키 필요 |
| 5 | 배포 CRUD 확인 | 🔲 대기 | 키 + 배포 후 |
