# Offline Functionality Documentation

## Overview

FindHub implements comprehensive offline functionality using Progressive Web App (PWA) technologies, including service workers, cache strategies, and React Query for client-side data persistence.

## Architecture

### 1. Service Worker Configuration

**Location:** `apps/web/next.config.ts`

The service worker is configured using `@ducanh2912/next-pwa` with Workbox for advanced caching strategies:

```typescript
{
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development"
}
```

**Key Features:**
- Disabled in development for easier debugging
- Automatically reloads on reconnection
- Aggressive caching for better offline experience

### 2. Cache Strategies

#### API Endpoints (NetworkFirst)
- **Pattern:** `/api/items/*`
- **Strategy:** NetworkFirst with 10s timeout
- **Cache Duration:** 30 minutes
- **Max Entries:** 100 items
- **Behavior:** Tries network first, falls back to cache if offline or timeout

#### Item Images (CacheFirst)
- **Pattern:** `/uploads/items/*.{jpg,jpeg,png,webp,gif}`
- **Strategy:** CacheFirst
- **Cache Duration:** 30 days
- **Max Entries:** 150 images
- **Behavior:** Serves from cache immediately, updates cache in background

#### Static Resources (StaleWhileRevalidate)
- **Pattern:** `*.{js,css}`
- **Strategy:** StaleWhileRevalidate
- **Cache Duration:** 1 day
- **Max Entries:** 60 files
- **Behavior:** Serves cached version while fetching fresh copy

#### Next.js Data (NetworkFirst)
- **Pattern:** `/_next/data/*.json`
- **Strategy:** NetworkFirst with 10s timeout
- **Cache Duration:** 5 minutes
- **Max Entries:** 50 files

### 3. React Query Configuration

**Location:** `apps/web/src/lib/query-client.ts`

React Query provides client-side caching and offline support:

```typescript
{
  queries: {
    staleTime: 30 * 1000,           // 30 seconds
    gcTime: 30 * 60 * 1000,         // 30 minutes
    refetchOnReconnect: true,        // Sync on reconnect
    networkMode: "online",           // Only fetch when online
    retry: (failureCount) => {
      if (!navigator.onLine) return false;
      return failureCount < 2;
    }
  }
}
```

**Key Features:**
- Automatic retry with offline detection
- Refetch on reconnection for data sync
- Long cache time for offline access
- Smart retry logic (no retries when offline)

### 4. Offline Detection

**Location:** `apps/web/src/hooks/use-online-status.ts`

Custom hook that monitors online/offline status:

```typescript
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [wasOffline, setWasOffline] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setWasOffline(true);
      
      // Refetch all stale queries
      queryClient.refetchQueries({
        type: "active",
        stale: true,
      });
      
      // Reset wasOffline after 3 seconds
      setTimeout(() => setWasOffline(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [queryClient]);

  return { isOnline, wasOffline };
}
```

**Features:**
- Listens to browser online/offline events
- Automatically refetches data when reconnecting
- Provides "wasOffline" flag for reconnection UI
- Integrates with React Query for data sync

### 5. Offline Indicator

**Location:** `apps/web/src/components/offline-indicator.tsx`

Visual indicator that shows offline status:

```typescript
export function OfflineIndicator() {
  const { isOnline, wasOffline } = useOnlineStatus();

  // Show reconnection message
  if (isOnline && wasOffline) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50">
        <div className="bg-green-500 text-white">
          Back online. Syncing latest data...
        </div>
      </div>
    );
  }

  // Show offline message
  if (!isOnline) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50">
        <div className="bg-yellow-500 text-white">
          You are offline. Showing cached results.
        </div>
      </div>
    );
  }

  return null;
}
```

**Features:**
- Shows yellow banner when offline
- Shows green banner when reconnected
- Auto-dismisses reconnection message after 3 seconds
- Fixed position at bottom of screen

### 6. API Client Error Handling

**Location:** `apps/web/src/lib/api-client.ts`

The API client includes offline-aware error handling:

```typescript
export function getErrorMessage(error: unknown): string {
  // Check if offline
  if (!navigator.onLine) {
    return "You are offline. Please check your internet connection.";
  }
  
  // ... other error handling
}
```

**Features:**
- Detects offline status before showing errors
- Provides user-friendly offline messages
- Prevents unnecessary retry attempts when offline
- Exponential backoff for network errors

## User Experience Flow

### Scenario 1: Going Offline

1. User is browsing the search page
2. Network connection is lost
3. **Offline indicator appears** (yellow banner)
4. User continues browsing with cached data
5. Search results show previously loaded items
6. Item images load from cache
7. Attempting to create/update items shows offline error

### Scenario 2: Coming Back Online

1. Network connection is restored
2. **Reconnection indicator appears** (green banner)
3. React Query automatically refetches stale data
4. Service worker updates cached API responses
5. User sees latest data
6. Reconnection message auto-dismisses after 3 seconds

### Scenario 3: First Visit Offline

1. User visits site while offline
2. Service worker not yet installed
3. Offline indicator appears
4. No cached data available
5. Error message: "You are offline. Please check your internet connection."

## Testing Offline Functionality

### Manual Testing

1. **Visit the test page:** Navigate to `/offline-test`
2. **Load data:** Click "Refetch Items" to populate cache
3. **Run tests:** Click "Run Offline Tests" to verify setup
4. **Go offline:** Open DevTools → Network → Set to "Offline"
5. **Verify indicator:** Yellow offline banner should appear
6. **Test navigation:** Navigate to `/search` - cached data should work
7. **Go online:** Set network back to "Online"
8. **Verify sync:** Green reconnection banner should appear

### Automated Testing

E2E tests are available in `e2e/offline-functionality.spec.ts`:

```bash
# Run offline functionality tests
bun run test:e2e e2e/offline-functionality.spec.ts
```

**Test Coverage:**
- Offline indicator display
- Cached search results access
- Create item offline error handling
- Service worker registration
- Data synchronization on reconnection

### Browser DevTools Testing

1. **Check Service Worker:**
   - Open DevTools → Application → Service Workers
   - Verify service worker is registered (production only)
   - Check status: "activated and running"

2. **Check Cache Storage:**
   - Open DevTools → Application → Cache Storage
   - Look for caches: `api-items`, `item-images`, `images`, `static-resources`
   - Inspect cached responses

3. **Simulate Offline:**
   - Open DevTools → Network
   - Set throttling to "Offline"
   - Verify offline indicator appears
   - Test navigation and data access

4. **Monitor Network Requests:**
   - Open DevTools → Network
   - Go offline and reload
   - Verify requests are served from service worker (size: "ServiceWorker")

## Configuration Options

### Adjusting Cache Duration

Edit `apps/web/next.config.ts`:

```typescript
{
  urlPattern: /^\/api\/items/,
  handler: "NetworkFirst",
  options: {
    cacheName: "api-items",
    networkTimeoutSeconds: 10,  // Adjust timeout
    expiration: {
      maxEntries: 100,           // Adjust max cached items
      maxAgeSeconds: 30 * 60,    // Adjust cache duration
    },
  },
}
```

### Adjusting React Query Cache

Edit `apps/web/src/lib/query-client.ts`:

```typescript
{
  queries: {
    staleTime: 30 * 1000,      // How long data is considered fresh
    gcTime: 30 * 60 * 1000,    // How long unused data stays in cache
  }
}
```

### Disabling Offline Features

To disable PWA features in development:

```typescript
// apps/web/next.config.ts
const withPWA = withPWAInit({
  disable: process.env.NODE_ENV === "development", // Already disabled
});
```

## Troubleshooting

### Service Worker Not Registering

**Problem:** Service worker doesn't appear in DevTools

**Solutions:**
1. Ensure you're running a production build: `bun run build && bun run start`
2. Service workers are disabled in development mode
3. Check browser console for registration errors
4. Verify HTTPS (required for service workers, except localhost)

### Cached Data Not Updating

**Problem:** Old data persists even when online

**Solutions:**
1. Check React Query staleTime - data might be considered fresh
2. Manually refetch: `queryClient.refetchQueries()`
3. Clear cache: DevTools → Application → Clear Storage
4. Check service worker cache expiration settings

### Offline Indicator Not Showing

**Problem:** No visual feedback when offline

**Solutions:**
1. Verify `OfflineIndicator` is in root layout
2. Check `useOnlineStatus` hook is working
3. Test with DevTools Network throttling
4. Check z-index conflicts with other UI elements

### Images Not Loading Offline

**Problem:** Item images don't appear when offline

**Solutions:**
1. Ensure images were loaded at least once while online
2. Check cache storage for `item-images` cache
3. Verify image URLs match the cache pattern
4. Check cache size limits (maxEntries: 150)

## Performance Considerations

### Cache Size Management

- **API Cache:** 100 entries, 30 minutes
- **Image Cache:** 150 entries, 30 days
- **Static Resources:** 60 entries, 1 day

Total estimated cache size: ~50-100 MB depending on image sizes

### Network Performance

- **NetworkFirst timeout:** 10 seconds
- **Retry attempts:** 2 times with exponential backoff
- **Background sync:** Failed requests retry for up to 24 hours

### Memory Usage

- React Query cache: ~5-10 MB for typical usage
- Service worker cache: ~50-100 MB
- Total: ~55-110 MB

## Security Considerations

### Cache Security

- Service workers only work over HTTPS (except localhost)
- Cached data is stored locally on user's device
- No sensitive data should be cached (passwords, tokens)
- Cache is cleared when user clears browser data

### Authentication

- Session cookies are not cached
- Protected routes require online authentication
- Offline access limited to public data only

## Future Enhancements

1. **Background Sync:** Queue mutations while offline, sync when online
2. **Periodic Sync:** Automatically update cache in background
3. **Push Notifications:** Notify users of new items
4. **Offline Form Queue:** Save form submissions for later
5. **Selective Caching:** Let users choose what to cache
6. **Cache Analytics:** Track cache hit/miss rates

## References

- [Next PWA Documentation](https://ducanh-next-pwa.vercel.app/)
- [Workbox Documentation](https://developer.chrome.com/docs/workbox/)
- [React Query Offline Support](https://tanstack.com/query/latest/docs/react/guides/network-mode)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Cache API](https://developer.mozilla.org/en-US/docs/Web/API/Cache)
