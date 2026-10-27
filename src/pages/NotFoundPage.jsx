import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <section className="state state-empty">
      <h1>404</h1>
      <p>페이지를 찾을 수 없습니다.</p>
      <Link className="btn btn-primary" to="/">
        홈으로
      </Link>
    </section>
  );
}
