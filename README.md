# Document Management System (DMS)

A production-grade full-stack document management dashboard built with Spring Boot and React.

## Architecture

```
project_sws/
├── backend/                    # Spring Boot 3.2 + Maven
│   └── src/main/java/com/dms/
│       ├── controller/         # REST controllers
│       ├── service/            # Business logic + @Async processing
│       ├── repository/         # Spring Data JPA repositories
│       ├── entity/             # JPA entities (Document, Notification)
│       ├── dto/                # Request/Response DTOs
│       ├── mapper/             # Entity ↔ DTO mappers
│       ├── storage/            # Local disk storage service
│       ├── sse/                # Server-Sent Events service
│       ├── config/             # Security, CORS, Async config
│       ├── exception/          # Global exception handling
│       └── security/           # JWT utility (auth-ready)
└── frontend/                   # React 18 + Vite + TypeScript
    └── src/
        ├── components/         # Reusable UI components + shadcn/ui
        ├── pages/              # Dashboard, Upload, Notifications
        ├── hooks/              # React Query hooks + custom hooks
        ├── services/           # Axios API layer + SSE client
        ├── store/              # Zustand stores (notifications, upload, theme)
        ├── layouts/            # MainLayout with SSE initialization
        ├── types/              # TypeScript interfaces
        └── utils/              # Format utilities
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui |
| State | Zustand (client state), TanStack Query (server state) |
| Realtime | Server-Sent Events (SSE) |
| Backend | Spring Boot 3.2, Spring Security, Spring Data JPA |
| Database | MySQL 8+ |
| Auth | JWT (structure ready, all endpoints open for demo) |

## Prerequisites

- Java 17+
- Maven 3.8+
- Node.js 18+
- MySQL 8+

## Database Setup

```sql
CREATE DATABASE dms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Tables are auto-created by Hibernate (`spring.jpa.hibernate.ddl-auto=update`).

## Environment Variables

### Backend (`backend/src/main/resources/application.properties`)

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/dms_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=root

app.upload.base-dir=uploads
app.upload.max-file-size-bytes=52428800   # 50MB
app.jwt.secret=your-256-bit-secret-key-here
app.jwt.expiration=86400000               # 24 hours in ms
```

## Running the Backend

```bash
cd backend
mvn spring-boot:run
```

Backend starts on `http://localhost:8080`

Uploaded files are stored in `backend/uploads/yyyy/MM/dd/` with UUID filenames.

## Running the Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend starts on `http://localhost:5173`

Vite proxies `/api/*` → `http://localhost:8080`

## API Reference

### Documents

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/documents/upload` | Upload one or more PDFs (multipart) |
| GET | `/api/documents` | List documents (paginated, filterable) |
| GET | `/api/documents/{id}` | Get document by ID |
| GET | `/api/documents/download/{id}` | Download PDF file |
| DELETE | `/api/documents/{id}` | Delete document |

**Query params for GET /api/documents:**
- `page`, `size` — pagination
- `search` — filename search (case-insensitive)
- `status` — filter by PENDING/PROCESSING/COMPLETED/FAILED
- `sortBy`, `sortDir` — sorting

### Notifications

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | List notifications (paginated) |
| GET | `/api/notifications/unread-count` | Get unread count |
| PATCH | `/api/notifications/{id}/read` | Mark one as read |
| PATCH | `/api/notifications/read-all` | Mark all as read |

### Realtime (SSE)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sse/subscribe` | Subscribe to SSE stream |

**SSE Events:**
- `notification` — new notification created (JSON: NotificationDTO)
- `document-update` — document status changed (JSON: DocumentDTO)

## Realtime Architecture

The system uses **Server-Sent Events (SSE)** for push notifications:

1. Frontend connects to `/api/sse/subscribe` on app load (via `MainLayout`)
2. `SseService` maintains a list of active `SseEmitter` connections
3. When documents are processed or bulk uploads complete, `SseService.broadcast()` pushes events to all connected clients
4. Frontend `useSSE` hook listens for events and:
   - Invalidates React Query caches (triggers refetch)
   - Updates Zustand notification store
   - Shows toast notifications

**Bulk Upload Logic (> 3 files):**
- Files are saved to disk synchronously
- Processing runs via `@Async` thread pool
- `CompletableFuture.allOf()` waits for all files
- Single SSE notification sent when all complete

## Running Tests

### Backend

```bash
cd backend
mvn test
```

### Frontend

```bash
cd frontend
npm run test
```

## Key Features

- **Drag & Drop Upload** — multi-file, with per-file progress bars
- **Smart Bulk Notifications** — >3 files triggers background processing + SSE notification
- **Persistent Notifications** — stored in MySQL, not localStorage
- **Dark/Light Mode** — persisted in localStorage via Zustand
- **Real-time Updates** — document status changes pushed via SSE
- **Secure Downloads** — files served with Content-Disposition headers
- **Path Traversal Prevention** — filenames sanitized before storage
- **Global Error Handling** — Spring `@RestControllerAdvice` + Axios interceptors
