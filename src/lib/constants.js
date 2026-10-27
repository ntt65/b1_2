export const CATEGORIES = ["개발", "디자인", "글", "영상", "etc"];

export const CATEGORY_FILTER_OPTIONS = [
  { value: "all", label: "전체 카테고리" },
  ...CATEGORIES.map((c) => ({ value: c, label: c })),
];

export const CATEGORY_FORM_OPTIONS = CATEGORIES.map((c) => ({ value: c, label: c }));
