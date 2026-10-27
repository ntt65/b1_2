/**
 * @file components/Loading.jsx
 * @overview 데이터 로딩 중 스피너와 메시지를 표시하는 컴포넌트.
 */

/**
 * 로딩 스피너 UI.
 * @param {{ message?: string }} props
 */
export function Loading({ message = "불러오는 중..." }) {
  return (
    <div className="state state-loading" role="status">	{/* role="status"로 스크린 리더에 로딩 상태 알림 */}
      <span className="spinner" aria-hidden="true" />	{/* CSS 애니메이션 스피너, 스크린 리더에서 숨김 */}
      <p>{message}</p>	{/* 로딩 안내 텍스트 */}
    </div>
  );
}
