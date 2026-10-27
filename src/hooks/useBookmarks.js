import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

/** Fetches the bookmark list and exposes loading/error/refetch. */
export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from("bookmarks")
      .select("*")
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setBookmarks(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { bookmarks, loading, error, refetch };
}
