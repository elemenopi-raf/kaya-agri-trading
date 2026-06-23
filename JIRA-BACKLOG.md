# Kaya Agri Trading — Backlog

---

## Priority 1 — Critical

### KAYA-1 | Bug | Replace hardcoded JWT secret fallback with env-only requirement
- **File:** `backend/.../security/JwtProvider.java:16`
- **Description:** `System.getenv().getOrDefault("JWT_SECRET", "kaya-agri-secret-key...")` has a hardcoded fallback that makes the secret predictable if the env var is unset.
- **Fix:** Remove the default string so deployment fails loudly when `JWT_SECRET` is missing.

### KAYA-2 | Bug | Add @Version optimistic locking to Product entity
- **File:** `backend/.../entity/Product.java`
- **Description:** Two users selling the same product concurrently can silently overwrite each other's stock changes.
- **Fix:** Add `@Version private Long version;` to `Product` entity to enable optimistic locking.

### KAYA-3 | Bug | Replace empty .catch(() => {}) with user-facing error feedback
- **Files:** All frontend page components (ProductList, Dashboard, SaleCreateModal, etc.)
- **Description:** API errors are silently swallowed everywhere. Users see nothing when requests fail.
- **Fix:** Replace `.catch(() => {})` with `.catch(err => message.error(err.message || 'Request failed'))` or inline error state.

### KAYA-4 | Bug | Reorder stock deduction before em.persist() in SaleService.create()
- **File:** `backend/.../service/SaleService.java:77-82`
- **Description:** Stock is deducted after `em.persist()`. While CMT makes this transactional, the code reads as if a failure between persist and stock update could cause inconsistency.
- **Fix:** Add `em.flush()` after persist, or move stock update logic inside a clearer transactional boundary.

---

## Priority 2 — High

### KAYA-5 | Bug | Replace System.currentTimeMillis() PO numbering with DB sequence
- **File:** `backend/.../service/PurchaseOrderService.java:102-104`
- **Description:** `"PO-" + System.currentTimeMillis()` is not guaranteed unique under concurrent requests and produces unfriendly numbers.
- **Fix:** Use `SELECT nextval('po_number_seq')` or `UUID.randomUUID().toString()`.

### KAYA-6 | Improvement | Convert string-typed statuses to Java enums + TS union types
- **Files:** `backend/.../entity/Sale.java`, `PurchaseOrder.java`, `frontend/.../types/index.ts`
- **Description:** Statuses like `"PENDING"`, `"APPROVED"`, `"RECEIVED"`, `"COMPLETED"`, `"CANCELLED"` are raw strings with no type safety.
- **Fix:** Define `SaleStatus` and `PurchaseOrderStatus` enums in Java and matching union types in TypeScript.

### KAYA-7 | Bug | Have parseDecimal throw on bad input instead of silently returning 0
- **Files:** `backend/.../service/SaleService.java:138`, `PurchaseOrderService.java:106`
- **Description:** `parseDecimal` catches `NumberFormatException` and returns `BigDecimal.ZERO`, masking data entry errors.
- **Fix:** Let the exception propagate or throw a descriptive `IllegalArgumentException`.

### KAYA-8 | Bug | Handle non-JSON server responses in api.ts
- **File:** `frontend/.../services/api.ts:16-17`
- **Description:** `res.json()` fails with a cryptic error if the server returns HTML (e.g., nginx error page).
- **Fix:** Check `res.headers.get('content-type')` before calling `.json()`; throw with status + statusText otherwise.

### KAYA-9 | Improvement | Add logging to all service & resource classes
- **Files:** All `backend/.../service/*.java` and `resource/*.java`
- **Description:** Zero log statements in the entire backend. Production debugging relies entirely on error response bodies.
- **Fix:** Add `java.util.logging.Logger` (or SLF4J) and log at catch sites before returning error responses.

---

## Priority 3 — Medium

### KAYA-10 | Tech Debt | Replace custom search dropdown with Ant Design <Select showSearch>
- **File:** `frontend/.../pages/SaleCreateModal.tsx:128-169`
- **Description:** Customer and product search are implemented with raw `<Input>` + `position: absolute` dropdowns + fragile `onBlur`/`setTimeout` hack.
- **Fix:** Use `<Select showSearch onSearch={...} options={...} />` which handles keyboard nav, debounce, and dismissal natively.

### KAYA-11 | Tech Debt | Replace location.state?.refresh with simple counter
- **Files:** Multiple frontend pages (ProductList, SaleList, etc.)
- **Description:** `Date.now()` as a route state value triggers re-fetches on every render, even when data hasn't changed.
- **Fix:** Use a simple incrementing counter state or refetch on modal close directly.

### KAYA-12 | Improvement | Sanitize error messages returned to API clients
- **Files:** All `backend/.../resource/*.java`
- **Description:** Error responses embed `e.getMessage()` directly (e.g., `"{\"error\":\"" + e.getMessage() + "\"}"`), leaking internal details.
- **Fix:** Return generic messages like `"Invalid request"` and log the real error server-side.

### KAYA-13 | Bug | Add @Min(0) validation on quantity in SaleItem entity
- **File:** `backend/.../entity/SaleItem.java`
- **Description:** No constraint preventing negative quantity values.
- **Fix:** Add `@Min(0)` on the `quantity` and `unitPrice` fields.

### KAYA-14 | Improvement | Move /api base URL to environment variable
- **File:** `frontend/.../services/api.ts:1`
- **Description:** `const BASE_URL = '/api'` is hardcoded.
- **Fix:** Read from `import.meta.env.VITE_API_BASE` with fallback to `/api`.

### KAYA-15 | Bug | Add request cancellation (AbortController) on component unmount
- **Files:** All frontend page components with useEffect API calls
- **Description:** In-flight fetch requests continue after component unmount, potentially calling `setState` on unmounted components.
- **Fix:** Create an `AbortController` per effect and call `.abort()` in the cleanup function.

---

## Priority 4 — Low / Tech Debt

### KAYA-16 | Task | Add smoke tests for critical paths
- **Files:** New test files
- **Description:** Zero tests exist. Critical paths have no regression safety net.
- **Scope:** Sale creation → stock deduction, PO receive → stock addition, login → JWT issuance, login → /auth/me.

### KAYA-17 | Improvement | Introduce Flyway for database migrations
- **Files:** New `backend/src/main/resources/db/migration/` directory
- **Description:** `migration.sql` must be run manually. Schema changes are error-prone and unrepeatable.
- **Fix:** Add Flyway dependency, create `V1__init.sql` from `init.sql`, and remove manual migration script.

### KAYA-18 | Improvement | Add API versioning prefix /api/v1/
- **Files:** All `resource/*.java` `@Path` annotations
- **Description:** All endpoints sit at `/api/` with no versioning, making breaking changes risky.
- **Fix:** Update all `@Path("/...")` to `@Path("/v1/...")` and update nginx proxy config.

### KAYA-19 | Improvement | Add responsive layout for Dashboard quick-action cards
- **File:** `frontend/.../pages/Dashboard.tsx`
- **Description:** Quick action cards use `Col span={4}` which breaks on smaller screens.
- **Fix:** Use responsive `xs`, `sm`, `md`, `lg` breakpoints instead of fixed `span`.

### KAYA-20 | Tech Debt | Refactor duplicate JPQL in repositories with Criteria API
- **Files:** All `backend/.../repository/*.java`
- **Description:** Every `findAll` / `count` pair duplicates the entire WHERE clause building.
- **Fix:** Use JPA Criteria API to build predicates once and reuse for both query and count.
