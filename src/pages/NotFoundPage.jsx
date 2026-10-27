/**
 * @file pages/NotFoundPage.jsx
 * @overview * 라우트(매칭 실패). 404 메시지와 홈으로 돌아가는 링크를 제공한다.
 */
import { Link } from "react-router-dom";	// 홈으로 돌아가는 클라이언트 사이드 링크

/**
 * 404 페이지. 잘못된 경로 접근 시 렌더된다.
 */
export function NotFoundPage() {
  return (
    <section className="state state-empty">	{/* EmptyState와 동일한 레이아웃 재사용 */}
      <h1>404</h1>	{/* HTTP 상태 코드 */}
      <p>페이지를 찾을 수 없습니다.</p>	{/* 안내 문구 */}
      <Link className="btn btn-primary" to="/">	{/* 홈으로 돌아가기 */}
        홈으로
      </Link>
    </section>
  );
}
