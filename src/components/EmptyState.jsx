/**
 * @file components/EmptyState.jsx
 * @overview 데이터가 없을 때 보여주는 안내 컴포넌트.
 * 선택적 액션(버튼/링크)을 함께 렌더할 수 있다.
 */

/**
 * 빈 상태 안내 UI.
 * @param {{ message?: string, action?: React.ReactNode }} props
 */
export function EmptyState({ message = "표시할 데이터가 없습니다.", action }) {
  return (
    <div className="state state-empty">	{/* 빈 상태 레이아웃 클래스 */}
      <p>{message}</p>	{/* 안내 메시지 */}
      {action}	{/* 선택적 액션 (예: 등록하기 버튼) */}
    </div>
  );
}
