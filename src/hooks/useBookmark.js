import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

/** Fetches a single bookmark by id and exposes loading/error/refetch. */
export function useBookmark(id) {
  const [bookmark, setBookmark] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setBookmark(data);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { bookmark, loading, error, refetch };
}
