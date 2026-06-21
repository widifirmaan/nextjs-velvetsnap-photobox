# VelvetSnap Photobox — Optimization Plan

## 🔴 PHASE 1: Security (Revenue-Affecting)

### 1.1 Midtrans Notification — Signature Verification

**File:** `src/app/api/midtrans/notification/route.ts`
**Severity:** CRITICAL — anyone can mark any transaction as PAID

**Problem:** No `signature_key` verification. Midtrans requires `SHA512(order_id + status_code + gross_amount + server_key)`. Without it, an attacker can POST `{"order_id":"VS-xxx","transaction_status":"settlement"}` and bypass payment.

**Fix:** 
```typescript
const computed = crypto
  .createHash('sha512')
  .update(orderId + statusCode + grossAmount + process.env.MIDTRANS_SERVER_KEY)
  .digest('hex');
if (computed !== body.signature_key) {
  return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 403 });
}
```

### 1.2 Template PUT/DELETE — Auth Bypass

**File:** `src/app/api/templates/[id]/route.ts`
**Severity:** CRITICAL — unauthenticated users can edit/delete templates

**Problem:** Guard `if (session.accountId && existing.accountId && ...)` skips entirely when `session.accountId` is `null` (no session). Any unauthenticated request bypasses auth.

**Fix:** Add `requireAdmin()` or check `if (!session.token) return 401` before the account-scope check.

### 1.3 NoSQL Injection — Untrusted Body Fields in Queries

**Files:** 
- `midtrans/charge/route.ts` — `sessionId` in `findOne`
- `midtrans/notification/route.ts` — `orderId` in `findOneAndUpdate`
- `transactions/route.ts` — `sessionId` in `findOne`
- `templates/[id]/route.ts` — multiple body fields

**Severity:** HIGH

**Fix:** Validate string fields with `typeof x === 'string'` before using in queries. Reject objects/arrays.

### 1.4 Transaction POST — Default Status PAID

**File:** `src/app/api/transactions/route.ts:21`
**Severity:** HIGH

**Problem:** `const txData = { ... status: status || 'PAID' ... }` — if caller omits `status`, transaction is created as PAID without payment.

**Fix:** Remove default `'PAID'`. Only accept status from Midtrans notification, not from POST body.

### 1.5 Upload Route — Missing Auth/Validation

**File:** `src/app/api/upload/route.ts`
**Severity:** MEDIUM

**Problem:** No auth, no file size validation, weak `isBase64` (only checks `startsWith('data:')`). Anyone can upload arbitrary content to Cloudinary.

**Fix:** Add `requireAdmin()`, validate file size (< 10MB), verify valid base64 + image MIME type.

---

## 🟠 PHASE 2: Logic Bugs (UX-Affecting)

### 2.1 StepperFlow — photoAdjust Reset on Captures Change

**File:** `src/app/main/StepperFlow.tsx:218-220`
**Severity:** HIGH — user edits lost on capture change

**Problem:** `setPhotoAdjust(captures.map(() => default))` resets ALL adjustments every time captures change. If user edits photo 0 brightness, then deletes photo 2, photo 0's edit is lost.

**Fix:** Use functional updater to preserve existing adjustments for unchanged indices:
```typescript
setPhotoAdjust(prev => captures.map((_, i) => prev[i] || defaultAdjust));
```

### 2.2 StepperFlow — Compositing Race Condition

**File:** `src/app/main/StepperFlow.tsx:222-238`
**Severity:** HIGH — stale results overwrite fresh

**Problem:** Compositing promises have no cancellation. If deps change while compositing is in-flight, old result may overwrite new.

**Fix:** Add `AbortController` or `useRef` flag to discard stale results:
```typescript
const compositingId = useRef(0);
// In effect:
const id = ++compositingId.current;
const result = await composeStripImage(...);
if (id === compositingId.current) setCompositedImage(result);
```

### 2.3 StepperFlow — All Async Errors Silently Swallowed

**File:** `src/app/main/StepperFlow.tsx:89,100,143,232,236`
**Severity:** HIGH — user sees blank/empty UI with no feedback

**Fix:** Add `console.error()` at minimum. Show user-facing error toast for critical failures.

### 2.4 StepperFlow — Redundant Fetch with keyedUrl

**File:** `src/app/main/StepperFlow.tsx:110-114,134`
**Severity:** MEDIUM

**Problem:** When `handleSelectTemplate` is called with `keyedUrl` but no `data`, it returns early without `templateData`. The `[templateId]` effect then fetches from API unnecessarily.

**Fix:** When `keyedUrl` is provided, also normalize and set basic `templateData` from cached data.

### 2.5 PaymentStep — snap.js Timeout

**File:** `src/app/main/payment/component/PaymentStep.tsx`
**Severity:** MEDIUM

**Problem:** If `snap.js` CDN fails to load, `loading` state stays `true` forever. User is stuck on spinner.

**Fix:** Add timeout (e.g., 15s) to show "Unable to load payment gateway" with retry button.

---

## 🟡 PHASE 3: Dead Code & Duplication

### 3.1 Extract Shared Error Handler

**Files:** All 20+ API route files
**Effort:** LOW

**Pattern (30 occurrences):**
```typescript
catch (error: unknown) {
  return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
}
```

**Fix:** Create `src/lib/api-utils.ts`:
```typescript
export function apiError(error: unknown, status = 500) {
  return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status });
}
```

### 3.2 Extract Account-Scoping Filter Logic

**Files:** 5 routes (templates/route, templates/list, transactions/route, transactions/strips, transactions/count)
**Effort:** MEDIUM

**Fix:** Create `buildAccountFilter(req)` in `lib/require-admin.ts` that returns `Promise<Record<string, unknown>>`.

### 3.3 Unify `templates/route.ts` and `templates/list/route.ts`

**Files:** `src/app/api/templates/route.ts`, `src/app/api/templates/list/route.ts`
**Effort:** HIGH (95% identical — one has Cache-Control, other doesn't)

**Fix:** Remove `templates/list/route.ts`, add `Cache-Control` to `templates/route.ts` GET, or unify into shared handler.

### 3.4 Use `adminFetch` in All Admin Pages

**Files:** `history/page.tsx`, `templates/page.tsx`, `reprocess-templates/page.tsx`
**Effort:** LOW

**Fix:** Replace raw `fetch()` calls with `adminFetch()`.

### 3.5 Unify Logout Logic

**Files:** `layout.tsx`, `MobileActions.tsx`
**Effort:** LOW

**Fix:** Extract `clearAdminSession()` into `lib/admin-fetch.ts`.

### 3.6 Remove Duplicate `@keyframes spin`

**Files:** `page.module.css`, `AssetSearch.module.css`
**Effort:** LOW

**Fix:** Remove local keyframes, reference global `@keyframes spin` from `globals.css`.

### 3.7 Remove Local Transaction Interface

**File:** `src/app/admin/history/page.tsx:9-19`
**Effort:** LOW

**Fix:** Import `ITransaction` from `@/models/Transaction` instead of redefining locally.

### 3.8 Remove Duplicate Midtrans Expiry

**File:** `src/app/api/midtrans/charge/route.ts:30`
**Effort:** LOW

**Fix:** Use `MIDTRANS_PAYMENT_EXPIRY_DURATION` and `MIDTRANS_PAYMENT_EXPIRY_UNIT` from `constants.ts`.

---

## 🔵 PHASE 4: UX Improvements

### 4.1 Add Error Boundaries

**Severity:** HIGH — entire app crashes if provider throws

**Fix:** Add `error.tsx` at root + `app/main/error.tsx` + `app/admin/error.tsx`.

### 4.2 Add Loading States for Compositing

**Files:** `StepperFlow.tsx`, `EditorStep.tsx`
**Severity:** HIGH

**Fix:** Show spinner/skeleton during `composeFrameImage` / `composeStripImage` processing. Disable "Proceed to Pay" until `compositedImage` is available.

### 4.3 Add Template Empty State

**File:** `src/app/main/template/TemplateStep.tsx:31-32`
**Severity:** MEDIUM

**Fix:** Show "No templates available" message instead of loading spinner when `loading === false && templates.length === 0`.

### 4.4 Add ARIA Labels

**Severity:** HIGH — only 1 `aria-label` exists in entire app

**Fix:** Add `aria-label` to all interactive elements (back buttons, capture buttons, sliders, stepper, admin nav).

### 4.5 Payment — QR Code + Timeout

**File:** `src/app/main/payment/component/PaymentStep.tsx`
**Severity:** MEDIUM

**Fix:** Show actual QR code for QRIS, add 15s timeout for `snap.js` load with retry button.

---

## 🟢 PHASE 5: CSS & Performance

### 5.1 Remove 55 Unused Google Fonts

**File:** `src/app/globals.css:1`
**Severity:** CRITICAL — ~1.5MB wasted bandwidth, render-blocking

**Current:** `@import url('https://fonts.googleapis.com/css2?family=Inter...&family=Playfair+Display...&family=... (56 families)')`

**Fix:** 
1. Remove `@import` from CSS
2. Use `next/font/google` in `layout.tsx` for only `Inter` (the only font actually used)
3. Remove unused Google Font variable from CSS

### 5.2 Add Caching Headers for Static Assets

**File:** `next.config.ts`
**Effort:** LOW

**Fix:**
```typescript
async headers() {
  return [
    { source: '/:path*.(jpg|png|svg|ico|webp)', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
  ];
}
```

### 5.3 Fix `!important` Overrides

**Files:** 5 instances across admin CSS
**Effort:** 2-3 hours

**Fix:** Replace with proper specificity or CSS variables.

### 5.4 Extract CSS Hardcoded Values to Variables

**Files:** `page.module.css` (~50 instances), admin CSS (~40 instances)
**Effort:** 2-3 days (lowest priority)

**Fix:** Move colors, spacing, radii to CSS custom properties.

---

## 📊 Priority Matrix

| # | Item | Effort | Impact | Category |
|---|------|--------|--------|----------|
| 1 | Midtrans signature verification | 30 min | 🔴 Revenue | Security |
| 2 | Template PUT/DELETE auth bypass | 15 min | 🔴 Data loss | Security |
| 3 | Remove 55 unused Google Fonts | 1 hour | 🔴 1.5MB savings | Performance |
| 4 | Transaction POST default PAID | 5 min | 🟠 Payment bypass | Security |
| 5 | NoSQL injection sanitization | 2 hours | 🟠 Data leak | Security |
| 6 | photoAdjust reset on captures change | 15 min | 🟠 Data loss | Logic |
| 7 | Compositing race condition | 30 min | 🟠 Stale results | Logic |
| 8 | Error boundaries (error.tsx) | 1 hour | 🟠 UX | UX |
| 9 | Upload route auth + validation | 30 min | 🟠 Resource abuse | Security |
| 10 | Silent error swallowing | 30 min | 🟡 Debugging | Logic |
| 11 | ARIA labels | 2 hours | 🟡 Accessibility | UX |
| 12 | Shared error handler extract | 1 hour | 🟡 30× dedup | Code |
| 13 | Account-scoping filter extract | 1 hour | 🟡 5× dedup | Code |
| 14 | Missing empty/loading states | 2 hours | 🟡 UX | UX |
| 15 | snap.js timeout | 30 min | 🟡 UX | UX |
| 16 | adminFetch migration | 30 min | 🟢 Dedup | Code |
| 17 | Caching headers for static assets | 15 min | 🟢 Vercel | Perf |
| 18 | Remove duplicate @keyframes | 5 min | 🟢 Dedup | Code |
| 19 | Fix !important overrides | 2 hours | 🟢 CSS | CSS |
| 20 | Unify template routes | 3 hours | 🔵 Dedup | Code |
| 21 | CSS variables extraction | 2-3 days | 🔵 CSS | CSS |

---

## 🏁 First Week Focus

### Day 1 (Security)
- [ ] 1.1 Midtrans signature verification
- [ ] 1.2 Template auth bypass
- [ ] 1.3 NoSQL injection (4 routes)
- [ ] 1.4 Transaction POST default PAID

### Day 2 (Critical UX + Font)
- [ ] 5.1 Remove unused Google Fonts → `next/font`
- [ ] 2.1 photoAdjust reset fix
- [ ] 2.2 Compositing race condition fix
- [ ] 4.1 Error boundaries (error.tsx)
- [ ] 4.4 ARIA labels

### Day 3 (Code Quality)
- [ ] 3.1 Shared error handler
- [ ] 3.2 Account-scoping filter
- [ ] 3.3 Unify template routes
- [ ] 3.4 adminFetch migration
- [ ] 3.5 Unify logout logic
- [ ] 3.6-3.8 Minor dedup

### Day 4 (UX Polish)
- [ ] 4.2 Loading states for compositing
- [ ] 4.3 Template empty state
- [ ] 4.5 Payment QR + timeout
- [ ] 5.2 Static asset caching

### Day 5 (CSS Cleanup)
- [ ] 5.3 Fix !important
- [ ] 5.4 CSS variables (partial)
- [ ] 1.5 Upload route validation
