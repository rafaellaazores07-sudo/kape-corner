# Project Guidance

## User Preferences

- Warm coffee palette: brown, cream, beige, white, dark coffee
- Clean, cozy, modern coffee-shop aesthetic
- Fully responsive across desktop, tablet, and mobile
- Philippine Peso (₱) used throughout
- Design and content appropriate for customers in the Philippines
- GCash and Maya credentials must be configurable placeholders, never hard-coded
- Confirmation dialogs before cancelling or deleting an order
- Functional working ordering system, not a static website
- Admin and customer accounts must be clearly separated

## Verified Commands

- **typecheck**: `pnpm typecheck`
- **fix**: `pnpm fix`
- **build**: `pnpm build`

## Learnings

- Frontend and backend must share the service-fee constant; a mismatch silently re-prices orders at confirmation.
- StoredFile.blob is an ExternalBlob at runtime despite the generated FileRef (Uint8Array) type; always resolve via storedFileBlob(file).getDirectURL().
- Order numbers are generated server-side as 'ORDER #YYYYMMDD-NNN'; user-facing examples and placeholders must use that exact format.
- Motoko has no triple-quoted string literal; multi-line doc strings must be concatenated literals with \n escapes.
- Enhanced-migration check-limit counts migration FILES in the chain; a redundant identity migration must be removed, not emptied.
- OQL records with option/variant/nested/collection fields need .toEntityManual with .payload/.flatten.
- useOrder returns TanStack Query's refetch; error-state retry buttons should call it directly rather than mutating submitted state.
- zod and @hookform/resolvers are not preinstalled in this template; install both before using zodResolver with react-hook-form.
- useInternetIdentity() from @caffeineai/core-infrastructure exposes login(), clear(), identity, isAuthenticated, isInitializing, isLoggingIn; gate signed-in UI on isAuthenticated (not isLoginSuccess, which is only true after an interactive popup login).
- Sign-out should call clear() and queryClient.clear() together so cached backend data tied to the previous principal is dropped.
- Header consumes useInternetIdentity() and useQueryClient(), so any test rendering Header must wrap it in InternetIdentityProvider and QueryClientProvider.
- The header's Login / Register controls (desktop header.login_link, mobile header.mobile_login_link) route to the dedicated /auth page; /admin stays admin-gated behind AdminGuard.
- isCallerAdmin() is provided by the caffeineai-authorization mixin and appears in the generated DID; AdminGuard's role query is wired to it.
- The customer /auth page must call registerCustomer() once getCallerRole() resolves to #anonymous; otherwise the caller stays unregistered and the staff portal's _initialize_access_control() can hand them the first-admin slot.
- The staff portal must call _initialize_access_control() for an authenticated #anonymous caller; it is the only path that grants #admin, and registerCustomer() always assigns #user.
- zustand persist JSON-serializes bigint to string, so persisted money fields must be revived to bigint in the persist merge() and coerced at every arithmetic site; toCentavos() is exported from the cart store.
- success/warning CSS variables in index.css only produce Tailwind utilities when mapped under theme.extend.colors in tailwind.config.js.
- Layout uses useRouterState to detect /admin* and omits the storefront Header/Footer so the admin area renders its own chrome.
- Any test that mocks @/lib/backend must also export useCallerRole, useRegisterCustomer, and useInitializeAccessControl; any test rendering Header or AdminPage must mock useNavigate from @tanstack/react-router.
