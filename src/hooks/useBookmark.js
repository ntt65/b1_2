/**
 * @file hooks/useBookmark.js
 * @overview 단건 북마크 조회 커스텀 훅.
 * id가 바뀌면 useCallback이 새 함수를 생성하고 useEffect가 자동으로 재조회한다.
 */
import { useCallback, useEffect, useState } from "react";	// React 훅
import { supabase } from "../lib/supabase";	// Supabase 클라이언트 싱글턴

/**
 * 특정 id의 북마크를 조회하고 비동기 상태를 관리하는 훅.
 * @param {string} id - 조회할 북마크의 UUID (URL 파라미터에서 추출)
 * @returns {{ bookmark: Object|null, loading: boolean, error: string|null, refetch: Function }}
 */
export function useBookmark(id) {
  const [bookmark, setBookmark] = useState(null);	// 조회된 단건 북마크, 없으면 null
  const [loading, setLoading] = useState(true);	// 최초 렌더 시 로딩 상태로 시작
  const [error, setError] = useState(null);	// 에러 메시지 문자열, 정상이면 null

  /**
   * 해당 id의 북마크를 Supabase에서 다시 가져온다.
   * id가 바뀌면 새 함수가 생성되어 useEffect가 재실행된다.
   */
  const refetch = useCallback(async () => {
    setLoading(true);	// 요청 시작 — 로딩 상태로 전환
    setError(null);	// 이전 에러 초기화
    const { data, error: fetchError } = await supabase	// Supabase 단건 조회
      .from("bookmarks")	// 테이블 지정
      .select("*")	// 모든 컬럼 선택
      .eq("id", id)	// URL 파라미터의 id와 일치하는 행만 필터
      .maybeSingle();	// 결과 없으면 에러 대신 null 반환 (.single()은 없을 때 에러)

    if (fetchError) {	// Supabase 요청 실패
      setError(fetchError.message);	// 에러 메시지 저장
    } else {
      setBookmark(data);	// null(없음) 또는 북마크 객체 저장
    }
    setLoading(false);	// 요청 완료 — 로딩 해제
  }, [id]);	// id가 바뀌면 새 refetch 생성 → useEffect 재실행 → 새 데이터 조회

  useEffect(() => {
    refetch();	// 마운트 시 또는 id 변경 시 데이터 로드
  }, [refetch]);	// refetch 참조가 바뀔 때(id 변경 시)만 재실행

  return { bookmark, loading, error, refetch };	// 컴포넌트가 필요한 상태와 재조회 함수 반환
}
