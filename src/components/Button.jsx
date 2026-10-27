/**
 * @file components/Button.jsx
 * @overview variant·loading 상태를 지원하는 버튼 컴포넌트.
 */

/**
 * 스타일 variant와 loading 상태를 지원하는 버튼.
 * @param {{ variant?: string, loading?: boolean, disabled?: boolean, children: React.ReactNode }} props
 */
export function Button({ variant = "primary", loading = false, children, disabled, ...rest }) {
  return (
    <button className={`btn btn-${variant}`} disabled={disabled || loading} {...rest}>	{/* loading 중이거나 외부에서 disabled가 오면 비활성화 */}
      {loading ? "처리 중..." : children}	{/* loading이면 텍스트 대체, 아니면 자식 렌더 */}
    </button>
  );
}
