import { useState, useEffect, useCallback, useRef } from 'react';
import { getMessages, getMessage, markAsRead as apiMarkAsRead } from '../services/api';

/**
 * useEmails — manages the inbox email list:
 * - fetches paginated messages for a given label
 * - handles search (debounced)
 * - optimistically marks emails as read
 * - provides refresh capability
 */
export function useEmails(label = 'INBOX', searchQuery = '') {
  const [messages, setMessages] = useState([]);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const debounceTimer = useRef(null);
  const currentLabel = useRef(label);
  const currentQuery = useRef(searchQuery);

  const fetchMessages = useCallback(async (opts = {}) => {
    const { append = false, pageToken, q, lbl } = opts;
    if (!append) setLoading(true);
    else setLoadingMore(true);
    setError(null);

    try {
      const result = await getMessages({
        label: lbl ?? currentLabel.current,
        ...(pageToken ? { pageToken } : {}),
        ...(q !== undefined ? { q } : currentQuery.current ? { q: currentQuery.current } : {}),
      });

      setMessages((prev) =>
        append ? [...prev, ...result.messages] : result.messages
      );
      setNextPageToken(result.nextPageToken);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load emails');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Re-fetch when label changes
  useEffect(() => {
    currentLabel.current = label;
    currentQuery.current = searchQuery;
    fetchMessages({ lbl: label, q: searchQuery || undefined });
  }, [label, fetchMessages, refreshKey]);

  // Debounced search
  useEffect(() => {
    clearTimeout(debounceTimer.current);
    if (searchQuery !== currentQuery.current) {
      currentQuery.current = searchQuery;
      debounceTimer.current = setTimeout(() => {
        fetchMessages({ lbl: currentLabel.current, q: searchQuery || undefined });
      }, 400);
    }
    return () => clearTimeout(debounceTimer.current);
  }, [searchQuery, fetchMessages]);

  const loadMore = useCallback(() => {
    if (!nextPageToken || loadingMore) return;
    fetchMessages({ append: true, pageToken: nextPageToken, lbl: currentLabel.current });
  }, [nextPageToken, loadingMore, fetchMessages]);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const markAsRead = useCallback(async (id) => {
    // Optimistic update
    setMessages((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, isUnread: false, labelIds: (m.labelIds || []).filter((l) => l !== 'UNREAD') }
          : m
      )
    );
    try {
      await apiMarkAsRead(id);
    } catch {
      // Revert on failure (simplified — just refresh)
      setRefreshKey((k) => k + 1);
    }
  }, []);

  const toggleStar = useCallback((id, starred) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              isStarred: starred,
              labelIds: starred
                ? [...(m.labelIds || []), 'STARRED']
                : (m.labelIds || []).filter((l) => l !== 'STARRED'),
            }
          : m
      )
    );
  }, []);

  return {
    messages,
    loading,
    loadingMore,
    error,
    hasMore: !!nextPageToken,
    refresh,
    loadMore,
    markAsRead,
    toggleStar,
  };
}

/**
 * useEmail — fetches a single full message by ID.
 */
export function useEmail(id) {
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) { setEmail(null); return; }
    setLoading(true);
    setError(null);
    getMessage(id)
      .then(setEmail)
      .catch((err) => setError(err.response?.data?.error || 'Failed to load email'))
      .finally(() => setLoading(false));
  }, [id]);

  return { email, loading, error };
}
