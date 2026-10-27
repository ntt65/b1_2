import { useMemo, useState } from "react";
import { useBookmarks } from "../hooks/useBookmarks";
import { BookmarkList } from "../components/BookmarkList";
import { CategoryFilter } from "../components/CategoryFilter";
import { Loading } from "../components/Loading";
import { ErrorState } from "../components/ErrorState";

export function BookmarksPage() {
  const { bookmarks, loading, error, refetch } = useBookmarks();
  const [category, setCategory] = useState("all");

  // state change (category filter) -> render change (filtered card list), no refetch needed.
  const filtered = useMemo(
    () => (category === "all" ? bookmarks : bookmarks.filter((b) => b.category === category)),
    [bookmarks, category]
  );

  return (
    <section>
      <h1>북마크 목록</h1>
      <CategoryFilter value={category} onChange={setCategory} />

      {loading && <Loading message="북마크를 불러오는 중..." />}
      {!loading && error && <ErrorState message="요청에 실패했습니다. 다시 시도하세요." onRetry={refetch} />}
      {!loading && !error && <BookmarkList bookmarks={filtered} />}
    </section>
  );
}
