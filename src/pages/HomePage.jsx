import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <section className="home">
      <h1>Bookmark Keeper</h1>
      <p>읽고 싶은 링크를 저장하고, 카테고리로 분류하고, 메모를 남기는 개인용 북마크 관리 서비스입니다.</p>
      <div className="home-actions">
        <Link className="btn btn-primary" to="/bookmarks">
          북마크 목록 보기
        </Link>
        <Link className="btn btn-secondary" to="/bookmarks/new">
          새 북마크 등록
        </Link>
      </div>
    </section>
  );
}
