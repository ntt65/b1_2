export function Button({ variant = "primary", loading = false, children, disabled, ...rest }) {
  return (
    <button className={`btn btn-${variant}`} disabled={disabled || loading} {...rest}>
      {loading ? "처리 중..." : children}
    </button>
  );
}
