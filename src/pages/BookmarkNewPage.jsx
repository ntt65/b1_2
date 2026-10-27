/**
 * @file pages/BookmarkNewPage.jsx
 * @overview /bookmarks/new 라우트.
 * 폼 제출로 새 북마크를 Supabase에 등록하고 생성된 레코드의 상세 페이지로 이동한다.
 */
import { useState } from "react";	// 제출 에러 상태 관리
import { useNavigate, Link } from "react-router-dom";	// 프로그래매틱 이동, 취소 링크
import { BookmarkForm } from "../components/BookmarkForm";	// 등록/수정 공용 폼
import { supabase } from "../lib/supabase";	// Supabase 클라이언트

/**
 * 새 북마크 등록 페이지.
 * BookmarkForm에 onSubmit 핸들러를 주입하고, 등록 성공 시 새 레코드의 상세 페이지로 이동한다.
 */
export function BookmarkNewPage() {
  const navigate = useNavigate();	// 등록 성공 후 상세 페이지로 이동
  const [submitError, setSubmitError] = useState(null);	// Supabase 등록 실패 메시지

  /**
   * 폼에서 검증을 통과한 값을 받아 Supabase에 insert한다.
   * @param {{ title: string, url: string, memo: string, category: string }} values
   */
  async function handleCreate(values) {
    setSubmitError(null);	// 이전 에러 초기화
    const { data, error } = await supabase.from("bookmarks").insert(values).select().single();	// 삽입 후 생성된 레코드 반환
    if (error) {	// insert 실패
      setSubmitError("등록에 실패했습니다. 다시 시도하세요.");	// 에러 메시지 설정
      return;	// 이동하지 않음
    }
    // create success -> move straight to the new record's detail page.
    navigate(`/bookmarks/${data.id}`);	// 등록 성공 → 새 레코드 상세 페이지로 이동
  }

  return (
    <section>
      <h1>새 북마크</h1>	{/* 페이지 제목 */}
      <BookmarkForm onSubmit={handleCreate} submitLabel="등록" submitError={submitError} />	{/* 공용 폼에 핸들러와 에러 주입 */}
      <Link to="/bookmarks">목록으로 돌아가기</Link>	{/* 취소 링크 */}
    </section>
  );
}
