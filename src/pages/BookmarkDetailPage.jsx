import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useBookmark } from "../hooks/useBookmark";
import { Loading } from "../components/Loading";
import { ErrorState } from "../components/ErrorState";
import { Button } from "../components/Button";
import { supabase } from "../lib/supabase";

export function BookmarkDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { bookmark, loading, error, refetch } = useBookmark(id);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  async function handleDelete() {
    setDeleting(true);
    setDeleteError(null);
    const { error: deleteErr } = await supabase.from("bookmarks").delete().eq("id", id);
    setDeleting(false);
    if (deleteErr) {
      setDeleteError("삭제에 실패했습니다. 다시 시도하세요.");
      return;
    }
    // delete success -> navigate back to the (now refreshed) list.
    navigate("/bookmarks");
  }

  if (loading) return <Loading message="북마크를 불러오는 중..." />;
  if (error) return <ErrorState message="요청에 실패했습니다. 다시 시도하세요." onRetry={refetch} />;
  if (!bookmark) return <ErrorState message="해당 북마크를 찾을 수 없습니다." />;

  return (
    <section>
      <span className="badge">{bookmark.category}</span>
      <h1>{bookmark.title}</h1>
      <p>
        <a href={bookmark.url} target="_blank" rel="noreferrer">
          {bookmark.url}
        </a>
      </p>
      {bookmark.memo && <p className="bookmark-memo">{bookmark.memo}</p>}
      <p className="meta">등록일: {new Date(bookmark.created_at).toLocaleString()}</p>

      {deleteError && <p className="field-error">{deleteError}</p>}

      <div className="detail-actions">
        <Link className="btn btn-secondary" to={`/bookmarks/${id}/edit`}>
          수정
        </Link>
        <Button variant="danger" onClick={handleDelete} loading={deleting}>
          삭제
        </Button>
        <Link className="btn btn-ghost" to="/bookmarks">
          목록으로
        </Link>
      </div>
    </section>
  );
}
