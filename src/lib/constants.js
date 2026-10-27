/**
 * @file lib/constants.js
 * @overview 카테고리 상수 및 Select 컴포넌트용 옵션 배열 정의.
 */
export const CATEGORIES = ["개발", "디자인", "글", "영상", "etc"];	// 앱 전체에서 사용하는 카테고리 마스터 목록

export const CATEGORY_FILTER_OPTIONS = [	// 목록 페이지 필터용 옵션 — "전체" 항목 포함
  { value: "all", label: "전체 카테고리" },	// 필터 미적용 상태를 나타내는 기본 옵션
  ...CATEGORIES.map((c) => ({ value: c, label: c })),	// 각 카테고리를 { value, label } 형태로 변환
];

export const CATEGORY_FORM_OPTIONS = CATEGORIES.map((c) => ({ value: c, label: c }));	// 등록/수정 폼용 옵션 — "전체" 없이 실제 카테고리만
