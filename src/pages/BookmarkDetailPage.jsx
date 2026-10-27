/**
 * @file pages/BookmarkDetailPage.jsx
 * @overview /bookmarks/:id 라우트.
 * 단건 북마크를 표시하고 수정·삭제 액션을 제공한다.
 */
import { useState } from "react";	// 삭제 진행 상태 관리
import { useNavigate, useParams, Link } from "react-router-dom";	// URL 파라미터, 프로그래매틱 이동, 링크
import { useBookmark } from "../hooks/useBookmark";	// 단건 조회 훅
import { Loading } from "../components/Loading";	// 로딩 스피너
import { ErrorState } from "../components/ErrorState";	// 에러 메시지 + 재시도
import { Button } from "../components/Button";	// 삭제 버튼
import { supabase } from "../lib/supabase";	// Supabase 클라이언트 (삭제 요청용)

/**
 * 북마크 상세 페이지.
 * URL의 :id로 단건 조회 후 제목/URL/메모/등록일을 표시하고 수정·삭제 액션을 제공한다.
 */
export function BookmarkDetailPage() {
  const { id } = useParams();	// URL 파라미터에서 북마크 id 추출
  const navigate = useNavigate();	// 삭제 성공 후 목록으로 이동
  const { bookmark, loading, error, refetch } = useBookmark(id);	// id로 단건 조회
  const [deleting, setDeleting] = useState(false);	// 삭제 요청 진행 중 여부 — 버튼 비활성화에 사용
  const [deleteError, setDeleteError] = useState(null);	// 삭제 실패 에러 메시지

  /**
   * 현재 북마크를 Supabase에서 삭제하고 목록으로 이동한다.
   * 실패 시 deleteError를 채워 화면에 표시한다.
   */
  async function handleDelete() {
    setDeleting(true);	// 삭제 시작 — 버튼 비활성화
    setDeleteError(null);	// 이전 에러 초기화
    const { error: deleteErr } = await supabase.from("bookmarks").delete().eq("id", id);	// Supabase 삭제 요청
    setDeleting(false);	// 요청 완료 — 버튼 활성화
    if (deleteErr) {	// 삭제 실패
      setDeleteError("삭제에 실패했습니다. 다시 시도하세요.");	// 에러 메시지 설정
      return;	// 이동하지 않음
    }
    // delete success -> navigate back to the (now refreshed) list.
    navigate("/bookmarks");	// 삭제 성공 → 목록으로 이동
  }

  if (loading) return <Loading message="북마크를 불러오는 중..." />;	// 조회 중 로딩 스피너
  if (error) return <ErrorState message="요청에 실패했습니다. 다시 시도하세요." onRetry={refetch} />;	// 조회 실패 에러
  if (!bookmark) return <ErrorState message="해당 북마크를 찾을 수 없습니다." />;	// id에 해당하는 데이터 없음

  return (
    <section>
      <span className="badge">{bookmark.category}</span>	{/* 카테고리 배지 */}
      <h1>{bookmark.title}</h1>	{/* 북마크 제목 */}
      <p>
        <a href={bookmark.url} target="_blank" rel="noreferrer">	{/* 새 탭으로 원본 URL 열기, rel="noreferrer"로 보안 처리 */}
          {bookmark.url}
        </a>
      </p>
      {bookmark.memo && <p className="bookmark-memo">{bookmark.memo}</p>}	{/* 메모가 있을 때만 렌더 */}
      <p className="meta">등록일: {new Date(bookmark.created_at).toLocaleString()}</p>	{/* ISO 문자열을 로컬 날짜 형식으로 변환 */}

      {deleteError && <p className="field-error">{deleteError}</p>}	{/* 삭제 에러 인라인 표시 */}

      <div className="detail-actions">	{/* 액션 버튼 영역 */}
        <Link className="btn btn-secondary" to={`/bookmarks/${id}/edit`}>	{/* 수정 페이지로 이동 */}
          수정
        </Link>
        <Button variant="danger" onClick={handleDelete} loading={deleting}>	{/* 삭제 — deleting 중에는 "처리 중..." 표시 */}
          삭제
        </Button>
        <Link className="btn btn-ghost" to="/bookmarks">	{/* 목록으로 돌아가기 */}
          목록으로
        </Link>
      </div>
    </section>
  );
}
