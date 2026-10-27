export function Select({ label, id, options, ...rest }) {
  return (
    <div className="field">
      {label && <label htmlFor={id}>{label}</label>}
      <select id={id} {...rest}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
