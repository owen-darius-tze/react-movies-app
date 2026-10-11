import React from 'react';
import { useState, useEffect, createContext, useContext, useMemo, useCallback, useRef, type ReactNode } from 'react';
import { getFeed, type FeedResult, type ContentItem } from '../data';

interface FeedContextValue {
  feed: FeedResult | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

const FeedContext = createContext<FeedContextValue | null>(null);

// Maximum time to wait for initial data before showing empty state (ms)
const INITIAL_LOAD_TIMEOUT = 3000;

export function FeedProvider({ children }: { children: ReactNode }) {
  const [feed, setFeed] = useState<FeedResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isInitialLoad = useRef(true);
  const mountedRef = useRef(true);
  const initialLoadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isRefreshingRef = useRef(false);

  const clearInitialLoadTimer = useCallback(() => {
    if (initialLoadTimerRef.current) {
      clearTimeout(initialLoadTimerRef.current);
      initialLoadTimerRef.current = null;
    }
  }, []);

  const loadFeed = useCallback(async (isRetry = false, fromRefreshEvent = false) => {
    // Prevent concurrent refreshes
    if (isRefreshingRef.current && isRetry) {
      console.log('[FeedProvider] Skipping retry - already refreshing');
      return;
    }
    isRefreshingRef.current = true;
    console.log('[FeedProvider] loadFeed called', { isRetry, isInitialLoad: isInitialLoad.current, mounted: mountedRef.current });

    try {
      // Only show loading spinner for initial load, not for background refreshes
      if (isInitialLoad.current && !isRetry) {
        console.log('[FeedProvider] Setting loading=true (initial load)');
        setLoading(true);
      }
      setError(null);
      const data = await getFeed(fromRefreshEvent);
      console.log('[FeedProvider] getFeed returned', { itemCount: data.items.length, isInitialLoad: isInitialLoad.current });

      if (!mountedRef.current) {
        console.log('[FeedProvider] Not mounted, returning early');
        return;
      }

      // On initial load, keep loading=true until we have actual data OR timeout
      if (isInitialLoad.current) {
        if (data.items.length > 0) {
          // Got data - clear timeout and finish loading
          console.log('[FeedProvider] Got data on initial load, setting loading=false');
          clearInitialLoadTimer();
          isInitialLoad.current = false;
          setFeed(data);
          setLoading(false);
        } else if (!isRetry) {
          // No data yet on initial load (not a retry) - wait for background refresh event, but set a timeout fallback
          if (!initialLoadTimerRef.current) {
            console.log('[FeedProvider] No data yet, starting timeout fallback');
            initialLoadTimerRef.current = setTimeout(() => {
              if (mountedRef.current && isInitialLoad.current) {
                console.warn('[FeedProvider] Initial load timeout - showing empty state');
                isInitialLoad.current = false;
                setFeed(data); // Set empty feed
                setLoading(false);
              }
            }, INITIAL_LOAD_TIMEOUT);
          }
          // loading stays true until data arrives or timeout
        } else {
          // Retry after initial empty load - we got data now, transition out of initial load
          console.log('[FeedProvider] Retry returned data, transitioning out of initial load');
          clearInitialLoadTimer();
          isInitialLoad.current = false;
          setFeed(data);
          setLoading(false);
        }
      } else {
        // Subsequent loads (after initial load completed) - update immediately without loading spinner
        console.log('[FeedProvider] Subsequent load, updating feed without loading spinner');
        setFeed(data);
      }
    } catch (err) {
      if (!mountedRef.current) return;
      clearInitialLoadTimer();
      setError(err instanceof Error ? err : new Error('Failed to load feed'));
      setLoading(false);
      isInitialLoad.current = false;
    } finally {
      isRefreshingRef.current = false;
      console.log('[FeedProvider] loadFeed finished, isRefreshingRef=false');
    }
  }, [clearInitialLoadTimer]);

  // Set up event listener FIRST (before initial load) to catch any rapid updates
  useEffect(() => {
    mountedRef.current = true;

    const handleFeedUpdate = () => {
      if (mountedRef.current && !isRefreshingRef.current) {
        loadFeed(true, true); // Reload cache without starting another refresh.
      }
    };

    window.addEventListener('microfilm:feed-updated', handleFeedUpdate);

    // Then trigger initial load
    loadFeed();

    return () => {
      mountedRef.current = false;
      clearInitialLoadTimer();
      window.removeEventListener('microfilm:feed-updated', handleFeedUpdate);
    };
  }, [loadFeed, clearInitialLoadTimer]);

  const contextValue = useMemo(() => ({ feed, loading, error, refresh: loadFeed }), [feed, loading, error, loadFeed]);

  return React.createElement(FeedContext.Provider, { value: contextValue }, children);
}

export function useFeed() {
  const context = useContext(FeedContext);
  if (!context) {
    throw new Error('useFeed must be used within a FeedProvider');
  }
  return context;
}

// Helper hook to get filtered items from the shared feed
export function useFeedItems(filter?: (item: ContentItem) => boolean) {
  const { feed, loading, error } = useFeed();

  const filteredItems = useMemo(() => {
    const items = feed?.items ?? [];
    return filter ? items.filter(filter) : items;
  }, [feed?.items, filter]);

  return { items: filteredItems, loading, error, sources: feed?.sources ?? [] };
}