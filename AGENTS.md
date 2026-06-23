# Kaya Agri Trading — AGENTS.md

## Stack

- **Backend**: Jakarta EE 10 (Open Liberty `webProfile-10.0`), Java 17, Maven, packaged as WAR (`kaya-agri-backend.war`)
- **Frontend**: React 18, Vite, TypeScript, Ant Design 6.x, `@react-pdf/renderer`
- **Infra**: 3 containers via `podman compose` (Docker Desktop): PostgreSQL 16, Open Liberty backend, nginx frontend

## Running

```bash
podman compose up -d --build   # full stack at http://localhost:8081
npm run dev                     # in frontend/ — dev server on port 3000, proxies /api → localhost:8080
```

Ports: 8081 (frontend), 8080 (backend), 5432 (db).

Default users: `admin`/`admin123`, `manager`/`manager123`, `cashier`/`cashier123`.

## Validation (no tests, no lint)

These are the *only* validation commands. Nothing else passes/fails:

```bash
cd backend  && mvn compile             # or: mvn package -DskipTests
cd frontend && npm ci && npm run build  # which runs: tsc && vite build
```

## Architecture

### Backend (15 entities, 11 services, 10 resource classes)

- **Context root**: `/api` (set in `server.xml` `<webApplication contextRoot="/api">`, WAR name `kaya-agri-backend.war`)
- **Custom JWT auth** (not mpJwt): `JwtAuthFilter` (`ContainerRequestFilter`) validates Bearer token; `JwtProvider` signs/verifies with HMAC-SHA384 (24h expiry); roles stored as comma-separated JWT claim
- **PUBLIC_PREFIXES** (bypass filter): `auth/login`, `health`, `admin/re-seed`
- **`@RolesAllowed` NOT used** — `RoleUtil.requireRole(ctx, "ADMIN", "MANAGER")` called explicitly in resource methods
- **All resource endpoints** apply role gating similarly: read endpoints for any authenticated user, write endpoints for ADMIN/MANAGER (except Sales, Customers, Categories, UOMs — no role check)
- **`@Stateless` EJB + `@PersistenceContext`** for data access; DTOs for all API responses
- **`@Transactional` (CDI) prohibited on `@Stateless` EJBs** — Open Liberty rejects it. `@Stateless` already defaults to container-managed `REQUIRED` transactions
- **`DataInitializer`** (`@Singleton @Startup`) must NOT use `@PersistenceContext` directly for writes in `@PostConstruct` — delegate to a `@Stateless` EJB (`SeedService`) for guaranteed transaction context
- **`total_price`** in `sale_items` / `purchase_order_items` = `GENERATED ALWAYS AS (qty * unit_price) STORED` — *not set from Java*. `SaleItem` maps it with `insertable = false, updatable = false`; `PurchaseOrderItem` doesn't map it at all (computed in DTO)
- **Stock deduction on Sale creation** (not on payment). Cancel restores stock. Payment auto-completes sale when `paid_amount >= total_amount`

### Frontend (22 page/modal files)

- **API client** (`services/api.ts`): generic `api.get/post/put/delete<T>`, prepends `/api`, injects `Authorization: Bearer` from `localStorage`
- **Types** (`types/index.ts`): 21 interfaces mirroring backend DTOs
- **Auth**: token in `localStorage` key `"token"`; `AuthContext` provides `{ user, token, loading, login, logout }` via React context; `ProtectedRoute` checks auth + optionally roles
- **Create forms** are modals (not pages) — two-step flow: form modal → success modal with redirect to list (`navigate(..., { state: { refresh } })`)
- **Role-filtered sidebar**: Layout hides menu items based on `user.roles`; unmatched routes show 403 by `ProtectedRoute`
- **Invoice PDF**: `InvoicePDF` component using `@react-pdf/renderer` — A4 layout with customer info, items, payments, balance due; viewed/downloaded from SaleDetail
- **Primary color**: `#2d6a4f` (forest green); sidebar: `#1e293b` (slate-800); Ant Design `ConfigProvider` + inline `<style>` block in `App.tsx`

### Proxy

- **Dev** (`vite.config.ts`): `/api` → `http://localhost:8080`
- **Prod** (`nginx.conf`): `location /api/` → `proxy_pass http://backend:8080` (no trailing slash — preserves `/api` prefix). Note: `resolver 127.0.0.11` does NOT work on Docker Desktop on Windows (different DNS). Nginx resolves the hostname at startup; if backend container restarts and gets a new IP, run `podman compose restart frontend` to force re-resolution

### Database

- **Full schema**: `database/init.sql` — runs only on first PostgreSQL container start (mounted to `/docker-entrypoint-initdb.d/`)
- **Migration**: `database/migration.sql` — for existing databases that lack new tables (sales, customers, payments). Run manually if needed
- **Entity → table**: JPA auto-matches table names; no `@Table(name=...)` overrides

## Credentials (seeded by DataInitializer via SeedService)

| User | Password | Roles |
|------|----------|-------|
| admin | admin123 | ADMIN, MANAGER, CLERK, CASHIER, VIEWER |
| manager | manager123 | MANAGER, CLERK |
| cashier | cashier123 | CASHIER |

BCrypt cost factor 12 (`at.favre.lib:bcrypt`). If passwords get out of sync: `POST /api/admin/re-seed` (public endpoint) or restart the backend container.

## CI

`.github/workflows/ci.yml` — runs on push/PR to `main`:
- **frontend**: `npm ci` → `npm run build` (Node 20)
- **backend**: `mvn compile` (Java 17, Temurin)

## Gotchas

- **`@Transactional` from `jakarta.transaction` causes deployment failure** on `@Stateless` EJBs in Open Liberty — remove it; `@Stateless` already provides `REQUIRED` transactions
- **DataInitializer** must delegate `em.persist/merge` to a `@Stateless` EJB (`SeedService`) — direct writes in `@PostConstruct` silently fail outside a transaction
- **init.sql only runs once** — if you add tables later, use `docker compose down -v` (destroys data) or run `migration.sql` manually
- **nginx caches DNS** — backend container restart changes internal IP; use `podman compose restart frontend` to force re-resolution (Docker Desktop DNS at `127.0.0.11` is unavailable on Windows)
- **On Windows**: `podman compose` forwards to Docker Desktop; use `curl.exe` (not `curl` alias); JSON payloads need temp files (PowerShell quoting breaks inline `curl -d`)
- **Local PostgreSQL** on port 5432 must be stopped before containers start
