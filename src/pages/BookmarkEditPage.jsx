import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useBookmark } from "../hooks/useBookmark";
import { BookmarkForm } from "../components/BookmarkForm";
import { Loading } from "../components/Loading";
import { ErrorState } from "../components/ErrorState";
import { supabase } from "../lib/supabase";

export function BookmarkEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { bookmark, loading, error, refetch } = useBookmark(id);
  const [submitError, setSubmitError] = useState(null);

  async function handleUpdate(values) {
    setSubmitError(null);
    const { error: updateErr } = await supabase.from("bookmarks").update(values).eq("id", id);
    if (updateErr) {
      setSubmitError("수정에 실패했습니다. 다시 시도하세요.");
      return;
    }
    navigate(`/bookmarks/${id}`);
  }

  if (loading) return <Loading message="북마크를 불러오는 중..." />;
  if (error) return <ErrorState message="요청에 실패했습니다. 다시 시도하세요." onRetry={refetch} />;
  if (!bookmark) return <ErrorState message="해당 북마크를 찾을 수 없습니다." />;

  return (
    <section>
      <h1>북마크 수정</h1>
      <BookmarkForm
        initialValues={{ title: bookmark.title, url: bookmark.url, memo: bookmark.memo ?? "", category: bookmark.category }}
        onSubmit={handleUpdate}
        submitLabel="수정 완료"
        submitError={submitError}
      />
      <Link to={`/bookmarks/${id}`}>취소하고 상세로</Link>
    </section>
  );
}
