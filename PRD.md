# Product Requirements Document (PRD)
## Product Management System — Internship Project

**Version:** 1.0
**Status:** Draft — Single Source of Truth for Development

---

## 1. Executive Summary

The Product Management System (PMS) is a full-stack web application that allows authenticated users to browse a product catalog and allows administrators to manage that catalog. The system is built with a React.js frontend and a Spring Boot backend, using MongoDB Atlas as the persistence layer. It implements JWT-based authentication and Role-Based Access Control (RBAC) with exactly two roles: `USER` and `ADMIN`.

The project is scoped intentionally for an internship-level implementation: it demonstrates secure authentication, proper authorization enforcement, clean layered architecture, and sound CRUD design — without microservices, unnecessary collections, or enterprise-scale complexity.

---

## 2. Problem Statement

Organizations need a simple, secure way for staff to view product information and for a smaller set of trusted administrators to maintain that information (adding new products, correcting details, removing discontinued items). Without RBAC, any user could modify product data, creating risk of accidental or malicious corruption of inventory records. The PMS solves this by separating read-only catalog access (all authenticated users) from write access (administrators only), enforced at the backend — not just hidden in the UI.

---

## 3. Goals and Objectives

- Provide secure user registration and login using JWT authentication.
- Enforce RBAC server-side so that only `ADMIN` users can create, update, or delete products.
- Provide a searchable, filterable, paginated product catalog.
- Provide role-appropriate dashboards showing basic statistics.
- Demonstrate clean separation of concerns across a Spring Boot backend (controller/service/repository/model/dto/security/config/exception) and a modular React frontend.
- Keep the scope realistic for an internship timeline (no microservices, no extra collections, no over-engineered features).

**Non-goals:** multi-tenant support, product images/media pipelines, order/checkout flows, payment processing, email verification workflows, or audit logging beyond basic timestamps.

---

## 4. User Roles

Exactly two roles exist. Role is stored as a string field on the user document (`"USER"` or `"ADMIN"`).

### 4.1 USER (default role)
Assigned automatically on registration. Permissions:
- Register, log in
- View dashboard (USER-scoped statistics)
- View product catalog, product details
- Search and filter products

Restrictions: cannot create, edit, or delete products; cannot manage other users.

### 4.2 ADMIN
Not selectable during registration; must be provisioned manually (e.g., directly in MongoDB or via a seed script) since there is no self-service admin signup. Permissions:
- Everything a USER can do
- Create, edit, delete products
- View admin-scoped dashboard statistics (e.g., low-stock products)

---

## 5. Functional Requirements

| ID | Requirement | Roles |
|----|-------------|-------|
| FR-1 | User can register with name, email, password, confirm password | Public |
| FR-2 | User can log in with email/password and receive a JWT | Public |
| FR-3 | Authenticated user can view the product catalog | USER, ADMIN |
| FR-4 | Authenticated user can view a single product's details | USER, ADMIN |
| FR-5 | Authenticated user can search products by name/SKU | USER, ADMIN |
| FR-6 | Authenticated user can filter products by category | USER, ADMIN |
| FR-7 | Admin can create a new product | ADMIN |
| FR-8 | Admin can edit an existing product | ADMIN |
| FR-9 | Admin can delete a product | ADMIN |
| FR-10 | User can view a dashboard with basic statistics | USER, ADMIN |
| FR-11 | Admin can view additional statistics (low stock, total categories) | ADMIN |
| FR-12 | System rejects requests with missing/invalid/expired JWT | System |
| FR-13 | System rejects role-inappropriate requests with HTTP 403 | System |

---

## 6. Page-by-Page Requirements

### 6.1 Registration Page (`/register`)
**Purpose:** Allow a new user to create an account with the default `USER` role.

**UI requirements:**
- Fields: Full Name, Email, Password, Confirm Password
- "Register" submit button, link to Login page
- Inline field-level validation messages
- Loading state on submit; success message with redirect to Login; error banner on failure

**Validation:**
- Full Name: required, 2–100 characters
- Email: required, valid email format
- Password: required, minimum 8 characters (recommend at least one letter and one number)
- Confirm Password: must match Password
- Client-side validation mirrors backend validation but is **not** trusted as the source of truth

**Role access:** Public (unauthenticated only — redirect authenticated users away)

### 6.2 Login Page (`/login`)
**Purpose:** Authenticate an existing user and issue a JWT.

**UI requirements:**
- Fields: Email, Password
- "Login" submit button, link to Registration page
- Error message on invalid credentials (generic, not revealing which field is wrong)
- Loading state on submit; on success, store token and redirect to Dashboard

**Validation:**
- Email: required, valid format
- Password: required, non-empty

**Role access:** Public (unauthenticated only)

### 6.3 Product Catalog Page (`/products`)
**Purpose:** Display products to any authenticated user; expose management actions to admins.

**UI requirements:**
- Search input (by name/SKU), category filter dropdown, sort control (e.g., name, price)
- Paginated table/grid of products: name, SKU, category, price, stock
- "View Details" per product
- For ADMIN only: "Add Product" button, "Edit" and "Delete" actions per row, delete confirmation dialog

**Validation:** N/A (read view); search/filter inputs sanitized before sending to API

**Role access:** USER, ADMIN (view); ADMIN-only for management controls, both client-hidden and server-enforced

### 6.4 Product Registration Page (`/products/new`, and `/products/:id/edit`)
**Purpose:** Allow admins to create or edit a product.

**UI requirements:**
- Form fields: Name, SKU, Category, Description, Price, Stock, Supplier
- "Save" and "Cancel" buttons
- Inline validation errors; duplicate SKU error surfaced clearly
- Success toast/redirect to catalog on save

**Validation:**
- Name: required, 2–150 characters
- SKU: required, unique, alphanumeric pattern (e.g., `^[A-Za-z0-9\-]{3,30}$`)
- Category: required, from a small controlled set or free text (project choice — recommend a fixed enum/list for simplicity)
- Price: required, numeric, > 0
- Stock: required, integer, >= 0
- Description, Supplier: optional, reasonable max length

**Role access:** ADMIN only. Route is protected client-side and the underlying API is protected server-side; a USER navigating here directly must be redirected/blocked, and any direct API call must return 403.

### 6.5 Dashboard Page (`/dashboard`)
**Purpose:** Landing page after login; shows role-appropriate summary statistics.

**UI requirements:**
- USER view: total products, available (in-stock) products, total categories, simple stat cards
- ADMIN view: everything above, plus low-stock products count/list, total categories breakdown, and any other simple aggregate the team finds useful
- No heavy charting required; simple cards/numbers are sufficient for internship scope (a basic chart is optional, not required)

**Validation:** N/A

**Role access:** USER, ADMIN (content differs by role)

---

## 7. Authentication & Authorization

### 7.1 Registration Flow
1. Frontend submits `{ name, email, password, confirmPassword }` to `POST /api/auth/register`.
2. Backend validates payload via Bean Validation annotations on a `RegisterRequest` DTO.
3. Backend checks `email` uniqueness against the `users` collection.
4. Backend hashes the password using BCrypt (never stores plaintext).
5. Backend creates a user document with `role = "USER"` (hardcoded server-side; the `role` field is never accepted from the client, closing off privilege escalation via a crafted request body).
6. Backend returns 201 Created with a minimal user summary (no password hash).

### 7.2 Login Flow
1. Frontend submits `{ email, password }` to `POST /api/auth/login`.
2. Backend loads the user by email; if not found, returns 401 with a generic "invalid credentials" message.
3. Backend compares the submitted password against the stored BCrypt hash.
4. On success, backend generates a signed JWT containing at minimum: subject (user id), email, role, issued-at, and expiration claims.
5. Backend returns the JWT (and optionally basic user info) to the frontend.
6. Frontend stores the JWT (see 13.4 for storage guidance) and attaches it as `Authorization: Bearer <token>` on subsequent requests.

### 7.3 Authorization Flow (per request)
1. A `JwtAuthenticationFilter` intercepts incoming requests, extracts the bearer token, and validates its signature and expiration.
2. If valid, the filter loads the user's authorities (role) and populates the Spring Security `SecurityContext`.
3. Spring Security's authorization layer (method-level `@PreAuthorize` and/or URL-based `HttpSecurity` rules) checks the authenticated principal's role against the endpoint's required role.
4. If the token is missing/invalid/expired → 401 Unauthorized.
5. If the token is valid but the role is insufficient → 403 Forbidden.

### 7.4 Authentication vs. Authorization
- **Authentication** answers "who are you?" — handled by the login flow and JWT validation.
- **Authorization** answers "are you allowed to do this?" — handled by role checks on protected endpoints. Both are enforced exclusively on the backend; the frontend only uses role information to improve UX (hiding buttons), never as a security boundary.

---

## 8. Product Requirements

### 8.1 Product Model

| Field | Type | Mandatory | Notes |
|-------|------|-----------|-------|
| id | ObjectId (string) | Auto-generated | Primary key |
| name | String | Yes | 2–150 chars |
| sku | String | Yes | Unique, alphanumeric/dash pattern |
| category | String | Yes | From controlled list or free text |
| description | String | No | Max ~1000 chars |
| price | Decimal/Double | Yes | > 0 |
| stock | Integer | Yes | >= 0 |
| supplier | String | No | Max ~150 chars |
| createdAt | Timestamp | Auto-set | Set on creation |
| updatedAt | Timestamp | Auto-set | Updated on every edit |

### 8.2 Validation Rules
- `name`, `sku`, `category`, `price`, `stock` are mandatory; all enforced via Bean Validation (`@NotBlank`, `@NotNull`, `@Positive`, `@PositiveOrZero`, `@Pattern`, `@Size`) on the request DTO, and re-checked in the service layer where cross-record rules apply (e.g., SKU uniqueness).
- `sku` uniqueness is enforced with a unique index in MongoDB and validated in the service before insert/update to return a clean 409 Conflict instead of a raw database exception.

---

## 9. Dashboard Requirements

### 9.1 USER Dashboard
- Total products (count of all products)
- Available products (count where `stock > 0`)
- Total distinct categories
- Optional: recently added products (last N)

### 9.2 ADMIN Dashboard
Everything in the USER dashboard, plus:
- Low-stock products (e.g., `stock < threshold`, threshold configurable, default suggestion: 10)
- Total categories with per-category product counts
- Optional: total inventory value (`sum(price * stock)`) as a simple, useful aggregate

Statistics are computed via simple MongoDB aggregation queries (`$count`, `$group`, `$match`) exposed through a small `DashboardService`; no separate analytics collection or scheduled job is needed for this scope.

---

## 10. MongoDB Database Design

**Database name:** `product_management_system`

### 10.1 `users` collection

| Field | Type | Required | Unique/Indexed | Notes |
|-------|------|----------|-----------------|-------|
| `_id` | ObjectId | Auto | Primary key | |
| `name` | String | Yes | No | 2–100 chars |
| `email` | String | Yes | **Unique index** | Lowercased before save |
| `password` | String | Yes | No | BCrypt hash, never returned in API responses |
| `role` | String (enum: `USER`, `ADMIN`) | Yes | No | Defaults to `USER`; never client-settable |
| `createdAt` | Date | Auto | No | Set on creation |

### 10.2 `products` collection

| Field | Type | Required | Unique/Indexed | Notes |
|-------|------|----------|-----------------|-------|
| `_id` | ObjectId | Auto | Primary key | |
| `name` | String | Yes | Optional text index for search | |
| `sku` | String | Yes | **Unique index** | |
| `category` | String | Yes | Index recommended for filter performance | |
| `description` | String | No | No | |
| `price` | Double/Decimal128 | Yes | No | > 0 |
| `stock` | Integer | Yes | No | >= 0 |
| `supplier` | String | No | No | |
| `createdAt` | Date | Auto | No | |
| `updatedAt` | Date | Auto | No | |

### 10.3 Relationships
No formal relationship (foreign key) exists between `users` and `products` in this scope — products are not owned by individual users, only globally managed by any admin. This keeps the schema flat and avoids unnecessary joins/lookups, consistent with the "no unnecessary collections" constraint.

---

## 11. REST API Specification

Base path: `/api`

| Method | Endpoint | Purpose | Auth Required | Role | Request Body | Response | Possible Errors |
|--------|----------|---------|----------------|------|---------------|----------|------------------|
| POST | `/api/auth/register` | Register new user | No | Public | `{name, email, password, confirmPassword}` | 201 `{id, name, email, role}` | 400 validation, 409 email exists |
| POST | `/api/auth/login` | Authenticate user | No | Public | `{email, password}` | 200 `{token, user}` | 400 validation, 401 invalid credentials |
| GET | `/api/products` | List products (paginated, searchable, filterable) | Yes | USER, ADMIN | Query params: `page,size,sort,search,category` | 200 `{content:[...], totalElements, totalPages}` | 401 unauthenticated |
| GET | `/api/products/{id}` | Get product details | Yes | USER, ADMIN | — | 200 `{product}` | 401, 404 not found |
| POST | `/api/products` | Create product | Yes | ADMIN | `{name, sku, category, description, price, stock, supplier}` | 201 `{product}` | 400 validation, 401, 403, 409 duplicate SKU |
| PUT | `/api/products/{id}` | Update product | Yes | ADMIN | Same as create (fields to update) | 200 `{product}` | 400, 401, 403, 404, 409 duplicate SKU |
| DELETE | `/api/products/{id}` | Delete product | Yes | ADMIN | — | 204 No Content | 401, 403, 404 |
| GET | `/api/products/categories` | List distinct categories (for filter dropdown) | Yes | USER, ADMIN | — | 200 `[categories]` | 401 |
| GET | `/api/dashboard/summary` | Dashboard statistics (role-aware response) | Yes | USER, ADMIN | — | 200 `{totalProducts, availableProducts, totalCategories, lowStock?}` | 401 |

Notes:
- `lowStock` and similar admin-only fields are included in the response only when the caller is `ADMIN`; USER callers receive the base stats.
- Pagination follows Spring Data conventions (`page`, `size`, `sort=field,direction`), default `size=10`.

---

## 12. Backend Architecture

Recommended Spring Boot package structure (`com.example.pms`):

```
com.example.pms
├── controller     # REST endpoints (AuthController, ProductController, DashboardController)
├── service        # Business logic (AuthService, ProductService, DashboardService)
├── repository     # Spring Data MongoDB repositories (UserRepository, ProductRepository)
├── model           # MongoDB documents (User, Product)
├── dto            # Request/response DTOs (RegisterRequest, LoginRequest, ProductRequest, ProductResponse, etc.)
├── security       # JWT filter, JWT util, SecurityConfig, UserDetailsService impl
├── config         # CORS config, application-level beans
└── exception      # Custom exceptions + GlobalExceptionHandler (@ControllerAdvice)
```

**Layer responsibilities:**
- **controller** — accepts HTTP requests, validates input shape (via `@Valid`), delegates to services, maps results to HTTP responses. Contains no business logic.
- **service** — implements business rules: uniqueness checks, password hashing calls, JWT issuance, aggregation queries for dashboards. Transaction/consistency boundary.
- **repository** — thin Spring Data MongoDB interfaces (`MongoRepository<Product, String>`) with derived/custom queries.
- **model** — `@Document`-annotated classes mapping to MongoDB collections.
- **dto** — decouples API contracts from persistence models; prevents over-posting (e.g., a client cannot set `role` via `ProductRequest`/`RegisterRequest`).
- **security** — `JwtUtil` (sign/parse/validate tokens), `JwtAuthenticationFilter`, `SecurityConfig` (filter chain, role rules), `CustomUserDetailsService`.
- **config** — CORS configuration, password encoder bean, any other app-wide beans.
- **exception** — domain exceptions (`DuplicateEmailException`, `DuplicateSkuException`, `ProductNotFoundException`) and a `@ControllerAdvice` mapping them to consistent JSON error responses.

---

## 13. Frontend Architecture

Recommended React project structure:

```
src/
├── pages/            # RegisterPage, LoginPage, ProductCatalogPage, ProductFormPage, DashboardPage
├── components/        # ProductCard, ProductTable, Navbar, ProtectedRoute, RoleGate, Pagination, SearchBar
├── services/          # api.js (axios instance), authService.js, productService.js, dashboardService.js
├── context/            # AuthContext (current user, role, token, login/logout functions)
├── routes/             # AppRoutes.jsx (React Router config, ProtectedRoute/AdminRoute wrappers)
└── App.jsx
```

**Key concerns:**
- **Authentication state:** `AuthContext` holds the decoded user (id, name, role) and token, exposing `login()`, `logout()`, and `isAuthenticated`.
- **Protected routes:** A `ProtectedRoute` component redirects unauthenticated users to `/login`; an `AdminRoute` wrapper additionally redirects non-admins away from admin-only pages (e.g., `/products/new`).
- **Role-based UI rendering:** Components check `user.role === "ADMIN"` to conditionally render Add/Edit/Delete controls — purely a UX convenience, not a security boundary.
- **Axios configuration:** A single configured `axios` instance with a base URL and a request interceptor that attaches `Authorization: Bearer <token>`; a response interceptor that catches 401s and logs the user out / redirects to login.

### 13.1 Frontend–Backend Communication
The React app communicates with Spring Boot exclusively over JSON REST calls to `/api/...`, using the shared Axios instance. CORS is configured on the backend to allow the frontend's origin. All state-changing calls (register, login, product create/update/delete) go through the service layer files, which centralize endpoint URLs and error handling.

### 13.2 Token Storage Guidance
Store the JWT in memory plus `localStorage` (or `sessionStorage` for shorter-lived sessions) is acceptable for this internship scope; document the XSS trade-off in code comments. An httpOnly cookie is more secure but adds backend complexity (CSRF handling) that is not required for this project's scope — note it under Future Enhancements instead.

---

## 14. Security Requirements

- **JWT authentication:** Stateless; token signed with a server-side secret (HS256 is sufficient), short-to-moderate expiration (e.g., 1–24 hours), validated on every protected request.
- **BCrypt password hashing:** All passwords hashed with Spring Security's `BCryptPasswordEncoder` before storage; plaintext passwords are never logged or persisted.
- **Spring Security filter chain:** Configured to permit `/api/auth/**` publicly, and require authentication for all other `/api/**` routes; the custom `JwtAuthenticationFilter` runs before `UsernamePasswordAuthenticationFilter`.
- **JWT filter:** Extracts and validates the bearer token, sets the `SecurityContext`, and rejects requests with missing/invalid/expired tokens.
- **Role-based authorization:** Enforced via `@PreAuthorize("hasRole('ADMIN')")` on admin-only service/controller methods, backed by `hasAuthority`/`hasRole` checks derived from the JWT's role claim.
- **Authentication vs. authorization:** See section 7.4.
- **CORS:** Restricted to the known frontend origin(s); credentials/headers configured explicitly rather than wildcarded.
- **Validation:** Bean Validation on all DTOs; invalid input rejected with 400 before hitting business logic.
- **Error handling:** Centralized via `@ControllerAdvice`, returning consistent JSON error bodies without leaking stack traces or internal details.
- **Protection against unauthorized product modification:** Every product-mutating endpoint is protected both by the global security rule and an explicit method-level `ADMIN` check, so a misconfigured route mapping cannot accidentally expose it.

Explicitly out of scope for this project: OAuth2/social login, refresh token rotation, rate limiting, account lockout policies, email verification, 2FA — these are noted under Future Enhancements rather than implemented, to avoid over-engineering.

---

## 15. Error Handling

| Scenario | HTTP Status | Notes |
|----------|-------------|-------|
| Invalid registration data (validation failure) | 400 Bad Request | Field-level error messages |
| Duplicate email on registration | 409 Conflict | Generic "email already registered" |
| Invalid login credentials | 401 Unauthorized | Generic message; do not reveal whether email exists |
| Missing/expired/invalid JWT | 401 Unauthorized | Triggers frontend logout/redirect |
| Authenticated but insufficient role | 403 Forbidden | e.g., USER calling `POST /api/products` |
| Product not found | 404 Not Found | On get/update/delete by invalid id |
| Duplicate SKU on create/update | 409 Conflict | |
| Invalid product data | 400 Bad Request | Field-level messages |
| Unhandled server/database error | 500 Internal Server Error | Generic message; details logged server-side only |

All error responses follow a consistent shape, e.g.:
```json
{ "timestamp": "...", "status": 403, "error": "Forbidden", "message": "Admin role required", "path": "/api/products" }
```

---

## 16. Non-Functional Requirements

- **Security:** All state-changing endpoints require authentication; admin endpoints require the `ADMIN` role; passwords hashed; secrets not hardcoded (use environment variables/config for JWT secret and MongoDB URI).
- **Performance:** Product listing paginated by default (page size 10–20) to avoid loading the full catalog at once; indexes on `email` and `sku`.
- **Maintainability:** Clear layered architecture (controller/service/repository/dto), consistent naming, DTOs separate from persistence models.
- **Responsiveness:** Frontend usable on both desktop and typical laptop/tablet widths using Tailwind's responsive utilities; mobile support is a nice-to-have, not mandatory.
- **Validation:** Both client-side (UX) and server-side (source of truth) validation on all forms.
- **Error handling:** Consistent, informative-but-safe error messages; no stack traces exposed to the client.
- **Code organization:** Feature-oriented folder structure on the frontend; layer-oriented package structure on the backend.
- **Scalability:** Not a primary concern for internship scope, but pagination, indexing, and stateless JWT auth keep the design reasonably scalable without extra effort.

---

## 17. User Flows

### 17.1 New User Registration
1. User navigates to `/register`.
2. User fills in Full Name, Email, Password, Confirm Password.
3. Frontend validates fields client-side.
4. Frontend calls `POST /api/auth/register`.
5. Backend validates, checks email uniqueness, hashes password, saves user with `role = USER`.
6. Backend returns 201; frontend shows success and redirects to `/login`.

### 17.2 Existing User Login
1. User navigates to `/login`.
2. User enters Email and Password.
3. Frontend calls `POST /api/auth/login`.
4. Backend validates credentials, issues JWT.
5. Frontend stores token, populates `AuthContext`, redirects to `/dashboard`.

### 17.3 USER Viewing Products
1. Authenticated USER navigates to `/products`.
2. Frontend calls `GET /api/products` with token attached.
3. Backend verifies token, confirms role is USER or ADMIN, returns paginated product list.
4. User can search/filter; frontend re-calls the endpoint with updated query params.
5. User clicks a product to view `GET /api/products/{id}` details.

### 17.4 ADMIN Adding a Product
1. Authenticated ADMIN navigates to `/products/new` (visible because role is ADMIN).
2. Admin fills in product form and submits.
3. Frontend calls `POST /api/products` with token.
4. Backend verifies token and ADMIN role, validates payload, checks SKU uniqueness, saves product.
5. Backend returns 201; frontend redirects to `/products` showing the new product.

### 17.5 ADMIN Editing a Product
1. Admin clicks "Edit" on a product row; navigates to `/products/{id}/edit`.
2. Form pre-fills with existing product data (`GET /api/products/{id}`).
3. Admin edits fields and submits.
4. Frontend calls `PUT /api/products/{id}` with token.
5. Backend verifies token/role, validates, checks SKU uniqueness (excluding current product), updates `updatedAt`, saves.
6. Backend returns 200; frontend redirects to catalog with updated data.

### 17.6 ADMIN Deleting a Product
1. Admin clicks "Delete" on a product row; confirmation dialog appears.
2. Admin confirms.
3. Frontend calls `DELETE /api/products/{id}` with token.
4. Backend verifies token/role, confirms product exists, deletes it.
5. Backend returns 204; frontend removes the product from the displayed list.

### 17.7 Unauthorized USER Attempting an ADMIN Operation
1. A USER (via manipulated frontend state, direct API call, or browser dev tools) sends `POST /api/products` with a valid USER token.
2. Backend's JWT filter authenticates the request successfully (valid token).
3. Backend's role check (`@PreAuthorize("hasRole('ADMIN')")`) evaluates the token's role claim as `USER` and rejects the request.
4. Backend returns 403 Forbidden; no product is created; frontend (if it somehow allowed the action) displays an appropriate error.

---

## 18. Acceptance Criteria

- **AC-1 (Registration):** Given valid registration data with a unique email, when the user submits the registration form, then the API returns 201 and a new user document is created with `role = "USER"`.
- **AC-2 (Duplicate email):** Given an email that already exists, when a user attempts to register with it, then the API returns 409 Conflict and no new user is created.
- **AC-3 (Password hashing):** Given a successfully registered user, when their document is inspected in MongoDB, then the `password` field is a BCrypt hash, never plaintext.
- **AC-4 (Login success):** Given valid credentials, when the user logs in, then the API returns 200 with a valid JWT containing the user's role.
- **AC-5 (Login failure):** Given invalid credentials, when the user attempts to log in, then the API returns 401 and no token is issued.
- **AC-6 (Unauthenticated access):** Given no token, when a client calls `GET /api/products`, then the API returns 401 Unauthorized.
- **AC-7 (USER read access):** Given a valid USER token, when the user calls `GET /api/products`, then the API returns 200 with the product list.
- **AC-8 (USER blocked from write):** Given a valid USER account, when the user attempts to create a product via `POST /api/products`, then the API must return HTTP 403 Forbidden and no product should be created.
- **AC-9 (ADMIN create):** Given a valid ADMIN token and valid product data with a unique SKU, when the admin calls `POST /api/products`, then the API returns 201 and the product is persisted.
- **AC-10 (Duplicate SKU):** Given a SKU that already exists, when an admin attempts to create or update a product with that SKU, then the API returns 409 Conflict and the write is rejected.
- **AC-11 (ADMIN update):** Given a valid ADMIN token and an existing product id, when the admin submits valid updated fields, then the API returns 200, persists the changes, and updates `updatedAt`.
- **AC-12 (ADMIN delete):** Given a valid ADMIN token and an existing product id, when the admin calls `DELETE /api/products/{id}`, then the API returns 204 and the product no longer appears in subsequent list calls.
- **AC-13 (Product not found):** Given a non-existent product id, when any authenticated user requests, updates, or deletes it, then the API returns 404 Not Found.
- **AC-14 (Search/filter):** Given products of multiple categories, when a user filters by a specific category, then only products of that category are returned.
- **AC-15 (Dashboard role differences):** Given a USER and an ADMIN both call `GET /api/dashboard/summary`, then the ADMIN response includes additional fields (e.g., low-stock count) not present in the USER response.
- **AC-16 (Expired token):** Given an expired JWT, when the client calls any protected endpoint, then the API returns 401 Unauthorized.

---

## 19. Development Phases

### Phase 1 — Project and MongoDB Setup
- **Tasks:** Initialize Spring Boot project (Spring Initializr: Web, Security, Data MongoDB, Validation); initialize React project (Vite or CRA) with Tailwind and React Router; set up MongoDB Atlas cluster and connection string; configure `application.yml`/`.env`.
- **Expected outcome:** Both projects run locally; backend connects to MongoDB Atlas successfully.
- **Dependencies:** None.
- **Testing:** Manual smoke test — backend health check endpoint responds; frontend renders a placeholder page.

### Phase 2 — Models and Repositories
- **Tasks:** Create `User` and `Product` `@Document` models; create `UserRepository` and `ProductRepository`; define unique indexes on `email` and `sku`.
- **Expected outcome:** Repositories can save/find documents via a simple test.
- **Dependencies:** Phase 1.
- **Testing:** Repository-level unit/integration tests (e.g., save and retrieve a user/product).

### Phase 3 — Registration
- **Tasks:** Build `RegisterRequest` DTO with validation; implement `AuthService.register()`; hash password with BCrypt; implement `AuthController.register()`; build Registration page in React.
- **Expected outcome:** New users can register via the UI and are persisted with `role = USER`.
- **Dependencies:** Phase 2.
- **Testing:** Manual + unit tests for duplicate email and validation failures (AC-1, AC-2, AC-3).

### Phase 4 — Login and JWT Authentication
- **Tasks:** Implement `JwtUtil` (generate/validate tokens); implement `AuthService.login()`; implement `AuthController.login()`; build Login page and `AuthContext` on frontend; configure Axios interceptor to attach token.
- **Expected outcome:** Users can log in and receive/store a working JWT.
- **Dependencies:** Phase 3.
- **Testing:** Manual + unit tests for valid/invalid login (AC-4, AC-5).

### Phase 5 — Spring Security and RBAC
- **Tasks:** Implement `JwtAuthenticationFilter`; configure `SecurityConfig` (public vs protected routes); implement `CustomUserDetailsService`; add `@PreAuthorize` role checks; implement `GlobalExceptionHandler`.
- **Expected outcome:** Protected endpoints reject unauthenticated/unauthorized requests correctly.
- **Dependencies:** Phase 4.
- **Testing:** Integration tests for 401/403 scenarios (AC-6, AC-8, AC-16).

### Phase 6 — Product CRUD
- **Tasks:** Build `ProductRequest`/`ProductResponse` DTOs; implement `ProductService` (create, update, delete, get, list with search/filter/pagination); implement `ProductController`; enforce ADMIN-only on write endpoints; handle duplicate SKU as 409.
- **Expected outcome:** Full product CRUD works end-to-end via API calls (e.g., Postman).
- **Dependencies:** Phase 5.
- **Testing:** Unit + integration tests covering AC-7, AC-9 through AC-14.

### Phase 7 — Dashboard APIs
- **Tasks:** Implement `DashboardService` with aggregation queries (total products, available, categories, low stock); implement `DashboardController` with role-aware response shaping.
- **Expected outcome:** Dashboard endpoint returns correct, role-differentiated statistics.
- **Dependencies:** Phase 6.
- **Testing:** Unit tests on aggregation logic; manual verification against seeded data (AC-15).

### Phase 8 — React Frontend
- **Tasks:** Build Product Catalog page (search, filter, pagination, role-based action buttons); build Product Form page (create/edit); build Dashboard page; implement `ProtectedRoute`/`AdminRoute`; wire all pages to backend via service layer.
- **Expected outcome:** Fully navigable frontend reflecting role-based UI and consuming all backend APIs.
- **Dependencies:** Phases 3–7 (backend endpoints available).
- **Testing:** Manual UI walkthrough of all user flows (Section 17).

### Phase 9 — Integration and Testing
- **Tasks:** End-to-end manual testing of all user flows and acceptance criteria; fix bugs; verify RBAC cannot be bypassed via direct API calls; verify error responses match Section 15.
- **Expected outcome:** All acceptance criteria in Section 18 pass.
- **Dependencies:** Phase 8.
- **Testing:** Full manual regression pass; optionally a small set of automated integration tests for critical paths (auth, RBAC, SKU uniqueness).

### Phase 10 — Deployment
- **Tasks:** Deploy backend (e.g., Render/Railway/EC2) with environment-based config for JWT secret and MongoDB Atlas URI; deploy frontend (e.g., Vercel/Netlify) pointed at the deployed backend; configure CORS for the production frontend origin.
- **Expected outcome:** Publicly accessible, working deployment.
- **Dependencies:** Phase 9.
- **Testing:** Smoke test all major flows against the deployed environment.

---

## 20. Future Enhancements

The following are explicitly out of scope for the internship implementation but are reasonable next steps:
- Refresh tokens / token rotation and httpOnly cookie storage with CSRF protection
- Email verification and password reset flows
- Admin user management UI (promote/demote roles, deactivate accounts)
- Product images and file upload support
- Audit logging of product changes (who changed what, when)
- Advanced analytics/charts on the dashboard
- Rate limiting and account lockout after failed login attempts
- Automated CI/CD pipeline and containerization (Docker)
- Unit/integration test coverage expansion and a dedicated test database