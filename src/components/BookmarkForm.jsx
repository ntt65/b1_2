import { useState } from "react";
import { Input } from "./Input";
import { Textarea } from "./Textarea";
import { Select } from "./Select";
import { Button } from "./Button";
import { CATEGORY_FORM_OPTIONS } from "../lib/constants";

const emptyValues = { title: "", url: "", memo: "", category: CATEGORY_FORM_OPTIONS[0].value };

function validate(values) {
  const errors = {};
  if (!values.title.trim()) errors.title = "제목을 입력하세요.";
  if (!values.url.trim()) errors.url = "URL을 입력하세요.";
  return errors;
}

/** Shared create/edit form. Controlled inputs + validation + submitting state, owned locally. */
export function BookmarkForm({ initialValues = emptyValues, onSubmit, submitLabel = "저장", submitError }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function handleChange(field) {
    return (e) => {
      setValues((v) => ({ ...v, [field]: e.target.value }));
      if (errors[field]) setErrors((er) => ({ ...er, [field]: undefined }));
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {submitError && <p className="field-error form-error">{submitError}</p>}
      <Input
        id="title"
        label="제목"
        value={values.title}
        onChange={handleChange("title")}
        error={errors.title}
      />
      <Input
        id="url"
        label="URL"
        value={values.url}
        onChange={handleChange("url")}
        error={errors.url}
        placeholder="https://..."
      />
      <Select
        id="category"
        label="카테고리"
        value={values.category}
        onChange={handleChange("category")}
        options={CATEGORY_FORM_OPTIONS}
      />
      <Textarea
        id="memo"
        label="메모"
        value={values.memo}
        onChange={handleChange("memo")}
        rows={4}
      />
      <Button type="submit" loading={submitting}>
        {submitLabel}
      </Button>
    </form>
  );
}
