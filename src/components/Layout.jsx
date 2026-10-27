/**
 * @file components/Layout.jsx
 * @overview 모든 페이지에 공통으로 적용되는 헤더·네비게이션 레이아웃.
 * React Router의 Outlet을 통해 하위 페이지를 렌더한다.
 */
import { NavLink, Outlet } from "react-router-dom";	// NavLink: 활성 링크 강조, Outlet: 하위 라우트 렌더 위치

const navLinks = [	// 네비게이션 링크 목록 — 컴포넌트 바깥에 두어 렌더마다 재생성 방지
  { to: "/", label: "홈", end: true },	// end: true — /bookmarks 같은 하위 경로에서 active 클래스가 붙지 않도록
  { to: "/bookmarks", label: "북마크 목록" },	// 목록 페이지
  { to: "/bookmarks/new", label: "새 북마크" },	// 등록 페이지
];

/**
 * 공통 앱 레이아웃. 헤더(브랜드 + 네비게이션)와 메인 콘텐츠 영역으로 구성된다.
 */
export function Layout() {
  return (
    <div className="app-shell">	{/* 전체 페이지 래퍼 */}
      <header className="app-header">	{/* 상단 고정 헤더 */}
        <div className="brand">📎 Bookmark Keeper</div>	{/* 브랜드/로고 */}
        <nav>	{/* 네비게이션 링크 영역 */}
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end}>	{/* 현재 경로 일치 시 active 클래스 자동 부여 */}
              {link.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="app-main">	{/* 페이지 콘텐츠 영역 */}
        <Outlet />	{/* 현재 경로에 매칭된 하위 라우트(페이지) 렌더 위치 */}
      </main>
    </div>
  );
}
