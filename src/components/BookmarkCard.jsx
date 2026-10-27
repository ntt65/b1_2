import { Link } from "react-router-dom";
import { Card } from "./Card";

export function BookmarkCard({ bookmark }) {
  return (
    <Card className="bookmark-card">
      <span className="badge">{bookmark.category}</span>
      <h3>
        <Link to={`/bookmarks/${bookmark.id}`}>{bookmark.title}</Link>
      </h3>
      <p className="bookmark-url">{bookmark.url}</p>
      {bookmark.memo && <p className="bookmark-memo">{bookmark.memo}</p>}
    </Card>
  );
}
