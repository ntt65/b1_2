export function EmptyState({ message = "표시할 데이터가 없습니다.", action }) {
  return (
    <div className="state state-empty">
      <p>{message}</p>
      {action}
    </div>
  );
}
