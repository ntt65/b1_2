import { Select } from "./Select";
import { CATEGORY_FILTER_OPTIONS } from "../lib/constants";

/** Controlled category filter — value/onChange driven, parent owns the state. */
export function CategoryFilter({ value, onChange }) {
  return (
    <Select
      label="카테고리"
      id="category-filter"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      options={CATEGORY_FILTER_OPTIONS}
    />
  );
}
