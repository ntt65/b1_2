/**
 * @file lib/supabase.js
 * @overview Supabase 클라이언트 싱글턴.
 * 환경변수 누락 시 즉시 에러를 던져 조용한 오동작을 방지한다.
 */
import { createClient } from "@supabase/supabase-js";	// Supabase JS SDK

const url = import.meta.env.VITE_SUPABASE_URL;	// Vite 환경변수에서 Supabase 프로젝트 URL 읽기
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;	// Vite 환경변수에서 anon 공개 키 읽기

if (!url || !anonKey) {	// 둘 중 하나라도 없으면 앱 전체가 동작 불가 — 조기에 에러를 던져 원인 명확화
  throw new Error(
    "Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Copy .env.example to .env and fill in your Supabase project values."	// 해결 방법을 메시지에 포함
  );
}

export const supabase = createClient(url, anonKey);	// 모듈 전역 싱글턴으로 내보내 중복 생성 방지
