/**
 * @file components/Select.jsx
 * @overview label과 select를 하나의 field 블록으로 묶는 드롭다운 컴포넌트.
 */

/**
 * 드롭다운 선택 필드 (label + select + options).
 * @param {{ label?: string, id: string, options: Array<{ value: string, label: string }> }} props
 */
export function Select({ label, id, options, ...rest }) {
  return (
    <div className="field">	{/* 라벨·셀렉트를 세로로 쌓는 컨테이너 */}
      {label && <label htmlFor={id}>{label}</label>}	{/* 라벨이 있을 때만 렌더 */}
      <select id={id} {...rest}>	{/* 나머지 props(value, onChange 등) 전달 */}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>	{/* value를 key로 사용해 React 재조정 최적화 */}
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
