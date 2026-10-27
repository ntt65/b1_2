/**
 * @file hooks/useBookmarks.js
 * @overview 북마크 목록 조회 커스텀 훅.
 * Supabase에서 전체 목록을 가져오고 loading/error/refetch를 반환한다.
 */
import { useCallback, useEffect, useState } from "react";	// React 훅
import { supabase } from "../lib/supabase";	// Supabase 클라이언트 싱글턴

/**
 * 북마크 목록을 조회하고 비동기 상태를 관리하는 훅.
 * @returns {{ bookmarks: Array, loading: boolean, error: string|null, refetch: Function }}
 */
export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState([]);	// 조회된 북마크 배열, 초기값은 빈 배열
  const [loading, setLoading] = useState(true);	// 최초 렌더 시 로딩 상태로 시작
  const [error, setError] = useState(null);	// 에러 메시지 문자열, 정상이면 null

  /**
   * Supabase에서 북마크 목록을 다시 가져온다.
   * useCallback으로 메모이제이션해 useEffect 의존성 무한 루프를 방지한다.
   */
  const refetch = useCallback(async () => {
    setLoading(true);	// 요청 시작 — 로딩 상태로 전환
    setError(null);	// 이전 에러 초기화
    const { data, error: fetchError } = await supabase	// Supabase bookmarks 테이블 조회
      .from("bookmarks")	// 테이블 지정
      .select("*")	// 모든 컬럼 선택
      .order("created_at", { ascending: false });	// 최신 등록순(내림차순) 정렬

    if (fetchError) {	// Supabase 요청 실패
      setError(fetchError.message);	// 에러 메시지 저장
    } else {
      setBookmarks(data ?? []);	// 데이터가 null이면 빈 배열로 대체
    }
    setLoading(false);	// 요청 완료 — 로딩 해제
  }, []);	// 의존성 없음 — 컴포넌트 생명주기 동안 동일한 함수 참조 유지

  useEffect(() => {
    refetch();	// 컴포넌트 마운트 시 최초 1회 데이터 로드
  }, [refetch]);	// refetch는 useCallback으로 고정되어 실질적으로 마운트 1회만 실행

  return { bookmarks, loading, error, refetch };	// 컴포넌트가 필요한 상태와 재조회 함수 반환
}
