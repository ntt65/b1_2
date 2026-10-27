/**
 * @file components/Textarea.jsx
 * @overview label, textarea, 에러 메시지를 하나의 field 블록으로 묶는 컴포넌트.
 */

/**
 * 여러 줄 텍스트 입력 필드 (label + textarea + 에러 메시지).
 * @param {{ label: string, error?: string, id: string }} props
 */
export function Textarea({ label, error, id, ...rest }) {
  return (
    <div className="field">	{/* 라벨·입력·에러를 세로로 쌓는 컨테이너 */}
      <label htmlFor={id}>{label}</label>	{/* id로 textarea와 연결 */}
      <textarea id={id} className={error ? "invalid" : ""} {...rest} />	{/* 에러 있으면 invalid 클래스로 빨간 테두리 */}
      {error && <p className="field-error">{error}</p>}	{/* 에러 메시지 인라인 표시 */}
    </div>
  );
}
