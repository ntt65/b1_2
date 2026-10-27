import { BookmarkCard } from "./BookmarkCard";
import { EmptyState } from "./EmptyState";

export function BookmarkList({ bookmarks }) {
  if (bookmarks.length === 0) {
    return <EmptyState message="표시할 데이터가 없습니다." />;
  }

  return (
    <div className="bookmark-list">
      {bookmarks.map((b) => (
        <BookmarkCard key={b.id} bookmark={b} />
      ))}
    </div>
  );
}
