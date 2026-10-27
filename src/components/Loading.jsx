export function Loading({ message = "불러오는 중..." }) {
  return (
    <div className="state state-loading" role="status">
      <span className="spinner" aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
}
