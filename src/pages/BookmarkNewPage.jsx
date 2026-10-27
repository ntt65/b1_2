import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { BookmarkForm } from "../components/BookmarkForm";
import { supabase } from "../lib/supabase";

export function BookmarkNewPage() {
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState(null);

  async function handleCreate(values) {
    setSubmitError(null);
    const { data, error } = await supabase.from("bookmarks").insert(values).select().single();
    if (error) {
      setSubmitError("등록에 실패했습니다. 다시 시도하세요.");
      return;
    }
    // create success -> move straight to the new record's detail page.
    navigate(`/bookmarks/${data.id}`);
  }

  return (
    <section>
      <h1>새 북마크</h1>
      <BookmarkForm onSubmit={handleCreate} submitLabel="등록" submitError={submitError} />
      <Link to="/bookmarks">목록으로 돌아가기</Link>
    </section>
  );
}
