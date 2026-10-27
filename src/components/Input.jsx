export function Input({ label, error, id, ...rest }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input id={id} className={error ? "invalid" : ""} {...rest} />
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
