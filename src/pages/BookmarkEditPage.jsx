/**
 * @file pages/BookmarkEditPage.jsx
 * @overview /bookmarks/:id/edit 라우트.
 * 기존 북마크를 불러와 폼에 초기값으로 채우고 수정 후 상세 페이지로 이동한다.
 */
import { useState } from "react";	// 제출 에러 상태 관리
import { useNavigate, useParams, Link } from "react-router-dom";	// URL 파라미터, 프로그래매틱 이동, 취소 링크
import { useBookmark } from "../hooks/useBookmark";	// 기존 북마크 단건 조회
import { BookmarkForm } from "../components/BookmarkForm";	// 등록/수정 공용 폼
import { Loading } from "../components/Loading";	// 조회 중 로딩 스피너
import { ErrorState } from "../components/ErrorState";	// 조회 실패 에러
import { supabase } from "../lib/supabase";	// Supabase 클라이언트

/**
 * 북마크 수정 페이지.
 * useBookmark로 기존 값을 가져와 BookmarkForm의 initialValues에 넘기고,
 * 수정 성공 시 해당 북마크의 상세 페이지로 이동한다.
 */
export function BookmarkEditPage() {
  const { id } = useParams();	// URL 파라미터에서 북마크 id 추출
  const navigate = useNavigate();	// 수정 성공 후 상세 페이지로 이동
  const { bookmark, loading, error, refetch } = useBookmark(id);	// 기존 북마크 조회
  const [submitError, setSubmitError] = useState(null);	// Supabase 수정 실패 메시지

  /**
   * 폼에서 검증을 통과한 값을 받아 Supabase에서 해당 id를 update한다.
   * @param {{ title: string, url: string, memo: string, category: string }} values
   */
  async function handleUpdate(values) {
    setSubmitError(null);	// 이전 에러 초기화
    const { error: updateErr } = await supabase.from("bookmarks").update(values).eq("id", id);	// id 일치 행 업데이트
    if (updateErr) {	// update 실패
      setSubmitError("수정에 실패했습니다. 다시 시도하세요.");	// 에러 메시지 설정
      return;	// 이동하지 않음
    }
    navigate(`/bookmarks/${id}`);	// 수정 성공 → 해당 북마크 상세 페이지로 이동
  }

  if (loading) return <Loading message="북마크를 불러오는 중..." />;	// 조회 중 로딩 스피너
  if (error) return <ErrorState message="요청에 실패했습니다. 다시 시도하세요." onRetry={refetch} />;	// 조회 실패 에러
  if (!bookmark) return <ErrorState message="해당 북마크를 찾을 수 없습니다." />;	// id에 해당하는 데이터 없음

  return (
    <section>
      <h1>북마크 수정</h1>	{/* 페이지 제목 */}
      <BookmarkForm
        initialValues={{ title: bookmark.title, url: bookmark.url, memo: bookmark.memo ?? "", category: bookmark.category }}	{/* 기존 값으로 폼 초기화, memo가 null이면 빈 문자열로 대체 */}
        onSubmit={handleUpdate}	{/* 수정 핸들러 주입 */}
        submitLabel="수정 완료"	{/* 버튼 라벨 재정의 */}
        submitError={submitError}	{/* Supabase 에러 메시지 전달 */}
      />
      <Link to={`/bookmarks/${id}`}>취소하고 상세로</Link>	{/* 취소 링크 — 상세 페이지로 */}
    </section>
  );
}
