/**
 * @file App.jsx
 * @overview 라우트 트리의 루트. Layout을 공통 부모로 두고 6개 라우트를 선언한다.
 */
import { Routes, Route } from "react-router-dom";	// React Router v6 라우팅 컴포넌트
import { Layout } from "./components/Layout";	// 헤더+네비게이션 공통 레이아웃
import { HomePage } from "./pages/HomePage";	// / 경로 홈 화면
import { BookmarksPage } from "./pages/BookmarksPage";	// /bookmarks 목록 화면
import { BookmarkDetailPage } from "./pages/BookmarkDetailPage";	// /bookmarks/:id 상세 화면
import { BookmarkNewPage } from "./pages/BookmarkNewPage";	// /bookmarks/new 등록 화면
import { BookmarkEditPage } from "./pages/BookmarkEditPage";	// /bookmarks/:id/edit 수정 화면
import { NotFoundPage } from "./pages/NotFoundPage";	// * 매칭 실패 시 404 화면

/**
 * 앱 라우트 트리를 반환하는 루트 컴포넌트.
 * Layout이 Outlet을 통해 하위 라우트를 렌더링한다.
 */
function App() {
  return (
    <Routes>	{/* 경로 매칭 컨테이너 */}
      <Route element={<Layout />}>	{/* 모든 페이지에 공통 레이아웃 적용 */}
        <Route path="/" element={<HomePage />} />	{/* 홈 */}
        <Route path="/bookmarks" element={<BookmarksPage />} />	{/* 북마크 목록 */}
        <Route path="/bookmarks/new" element={<BookmarkNewPage />} />	{/* 새 북마크 등록 — :id/edit보다 앞에 선언해야 충돌 없음 */}
        <Route path="/bookmarks/:id" element={<BookmarkDetailPage />} />	{/* 북마크 상세 */}
        <Route path="/bookmarks/:id/edit" element={<BookmarkEditPage />} />	{/* 북마크 수정 */}
        <Route path="*" element={<NotFoundPage />} />	{/* 매칭 실패 시 404 */}
      </Route>
    </Routes>
  );
}

export default App;	// Vite가 main.jsx에서 default import로 사용
