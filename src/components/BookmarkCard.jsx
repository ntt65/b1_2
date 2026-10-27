/**
 * @file components/BookmarkCard.jsx
 * @overview 북마크 한 장을 카드 형태로 렌더하는 컴포넌트.
 * Card를 래핑하고 상세 페이지로의 링크를 포함한다.
 */
import { Link } from "react-router-dom";	// 상세 페이지 이동 링크
import { Card } from "./Card";	// 흰 카드 컨테이너

/**
 * 단일 북마크를 카드로 표시한다.
 * @param {{ bookmark: { id: string, title: string, url: string, memo?: string, category: string } }} props
 */
export function BookmarkCard({ bookmark }) {
  return (
    <Card className="bookmark-card">	{/* 카드 컨테이너에 bookmark-card 클래스 추가 */}
      <span className="badge">{bookmark.category}</span>	{/* 카테고리 배지 */}
      <h3>
        <Link to={`/bookmarks/${bookmark.id}`}>{bookmark.title}</Link>	{/* 제목 클릭 시 상세 페이지 이동 */}
      </h3>
      <p className="bookmark-url">{bookmark.url}</p>	{/* URL 텍스트 표시 */}
      {bookmark.memo && <p className="bookmark-memo">{bookmark.memo}</p>}	{/* 메모가 있을 때만 렌더 */}
    </Card>
  );
}
