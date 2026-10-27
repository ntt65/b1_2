/**
 * @file components/BookmarkForm.jsx
 * @overview 북마크 등록/수정에 공용으로 사용하는 폼 컴포넌트.
 * 제어 입력(controlled inputs), 필수값 검증, 제출 중 상태를 로컬에서 관리한다.
 */
import { useState } from "react";	// 폼 값, 에러, 제출 상태 관리
import { Input } from "./Input";	// 텍스트 입력 + 에러 메시지
import { Textarea } from "./Textarea";	// 여러 줄 입력 + 에러 메시지
import { Select } from "./Select";	// 드롭다운 선택
import { Button } from "./Button";	// 제출 버튼 (loading 상태 포함)
import { CATEGORY_FORM_OPTIONS } from "../lib/constants";	// 카테고리 옵션 목록

const emptyValues = { title: "", url: "", memo: "", category: CATEGORY_FORM_OPTIONS[0].value };	// 등록 모드 기본값 — 첫 번째 카테고리 선택

/**
 * 폼 값을 받아 필수 필드(제목, URL)를 검증하고 에러 객체를 반환한다.
 * @param {{ title: string, url: string }} values
 * @returns {{ title?: string, url?: string }} 에러가 없으면 빈 객체
 */
function validate(values) {
  const errors = {};	// 에러 수집 객체
  if (!values.title.trim()) errors.title = "제목을 입력하세요.";	// 제목 필수값 검증
  if (!values.url.trim()) errors.url = "URL을 입력하세요.";	// URL 필수값 검증
  return errors;	// 에러 없으면 빈 객체 반환
}

/**
 * 북마크 등록/수정 공용 폼.
 * @param {{ initialValues?: object, onSubmit: Function, submitLabel?: string, submitError?: string|null }} props
 */
export function BookmarkForm({ initialValues = emptyValues, onSubmit, submitLabel = "저장", submitError }) {
  const [values, setValues] = useState(initialValues);	// 각 입력 필드의 현재 값
  const [errors, setErrors] = useState({});	// 필드별 검증 에러 메시지
  const [submitting, setSubmitting] = useState(false);	// 제출 요청 진행 중 여부 — 버튼 비활성화에 사용

  /**
   * 특정 필드의 변경 핸들러를 반환하는 커리 함수.
   * 입력할 때마다 해당 필드의 에러를 지운다.
   * @param {string} field - 업데이트할 필드 키
   */
  function handleChange(field) {
    return (e) => {
      setValues((v) => ({ ...v, [field]: e.target.value }));	// 해당 필드 값만 업데이트 (나머지 유지)
      if (errors[field]) setErrors((er) => ({ ...er, [field]: undefined }));	// 입력 시작 시 해당 필드 에러 제거
    };
  }

  /**
   * 폼 제출 핸들러. 검증 통과 시 onSubmit을 호출하고 제출 중 상태를 관리한다.
   */
  async function handleSubmit(e) {
    e.preventDefault();	// 브라우저 기본 폼 제출(페이지 새로고침) 방지
    const nextErrors = validate(values);	// 현재 값으로 검증 실행
    setErrors(nextErrors);	// 에러 상태 갱신 — 에러 메시지 렌더 트리거
    if (Object.keys(nextErrors).length > 0) return;	// 에러가 있으면 제출 중단

    setSubmitting(true);	// 제출 시작 — 버튼 비활성화
    try {
      await onSubmit(values);	// 부모(페이지)의 실제 Supabase 요청 호출
    } finally {
      setSubmitting(false);	// 성공/실패 무관하게 제출 상태 해제
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>	{/* noValidate: 브라우저 기본 검증 비활성화, 커스텀 검증 사용 */}
      {submitError && <p className="field-error form-error">{submitError}</p>}	{/* Supabase 요청 실패 에러 폼 상단 표시 */}
      <Input
        id="title"	{/* label과 input 연결용 id */}
        label="제목"	{/* 라벨 텍스트 */}
        value={values.title}	{/* 제어 컴포넌트 — 항상 state와 동기화 */}
        onChange={handleChange("title")}	{/* 변경 시 title 필드 업데이트 */}
        error={errors.title}	{/* 검증 에러 메시지 전달 */}
      />
      <Input
        id="url"	{/* label과 input 연결용 id */}
        label="URL"	{/* 라벨 텍스트 */}
        value={values.url}	{/* 제어 컴포넌트 — 항상 state와 동기화 */}
        onChange={handleChange("url")}	{/* 변경 시 url 필드 업데이트 */}
        error={errors.url}	{/* 검증 에러 메시지 전달 */}
        placeholder="https://..."	{/* 입력 힌트 */}
      />
      <Select
        id="category"	{/* label과 select 연결용 id */}
        label="카테고리"	{/* 라벨 텍스트 */}
        value={values.category}	{/* 제어 컴포넌트 — 항상 state와 동기화 */}
        onChange={handleChange("category")}	{/* 변경 시 category 필드 업데이트 */}
        options={CATEGORY_FORM_OPTIONS}	{/* 상수에서 가져온 카테고리 옵션 */}
      />
      <Textarea
        id="memo"	{/* label과 textarea 연결용 id */}
        label="메모"	{/* 라벨 텍스트 */}
        value={values.memo}	{/* 제어 컴포넌트 — 항상 state와 동기화 */}
        onChange={handleChange("memo")}	{/* 변경 시 memo 필드 업데이트 */}
        rows={4}	{/* 기본 4줄 높이 */}
      />
      <Button type="submit" loading={submitting}>	{/* submitting 중에는 "처리 중..." 표시 + 비활성화 */}
        {submitLabel}	{/* "등록" 또는 "수정 완료" */}
      </Button>
    </form>
  );
}
