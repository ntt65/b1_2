export function Textarea({ label, error, id, ...rest }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <textarea id={id} className={error ? "invalid" : ""} {...rest} />
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
