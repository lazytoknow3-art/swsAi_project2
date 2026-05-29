# DocManager — Document Management System

A full-stack document management dashboard where you can upload, manage, and track PDF files with real-time notifications.

---

## What It Does

- Upload single or multiple PDF files with drag & drop
- Track upload progress per file with a progress bar
- View all uploaded documents in a searchable, sortable table
- Get real-time notifications when files finish processing
- Dark / Light mode support

---

## Tech Stack

**Frontend**
- React 18 + Vite + TypeScript
- Tailwind CSS + shadcn/ui (components)
- Zustand (app state), TanStack Query (server state)
- Axios (API calls), React Router (navigation)
- Server-Sent Events (real-time updates)

**Backend**
- Spring Boot 3.2 + Java 21+
- Spring Security (JWT-ready), Spring Data JPA
- MySQL 8 (database)
- SSE / `@Async` (real-time + background processing)

---

## Project Structure

```
project_sws/
├── backend/        # Spring Boot API
└── frontend/       # React app
```

---

## Prerequisites

Make sure you have these installed:

| Tool | Version |
|------|---------|
| Java | 17+ |
| Node.js | 18+ |
| MySQL | 8+ |

> No need to install Maven — the project includes `mvnw.cmd` wrapper.

---

## Setup

### 1. Create the Database

Open MySQL and run:

```sql
CREATE DATABASE dms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Set Your MySQL Credentials

Open `backend/src/main/resources/application.properties` and update:

```properties
spring.datasource.username=your_mysql_username
spring.datasource.password=your_mysql_password
```

> Tables are created automatically by Hibernate on first run.

---

## Running the App

### Start the Backend

Open a terminal:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

Wait until you see:
```
Started DocumentManagementApplication in X.XXX seconds
```

Backend runs at → `http://localhost:8080`

---

### Start the Frontend

Open a **second** terminal:

```powershell
cd frontend
npm install
npm run dev
```

Frontend runs at → `http://localhost:5173`

> Vite automatically proxies all `/api` requests to the backend.

---

## How File Upload Works

This is the core feature of the app. Here is exactly what happens when you upload a PDF:

### Step 1 — User picks or drops a file
- `DropZone.tsx` captures the file via drag & drop or file picker (`<input type="file">`)
- It validates the file before sending:
  - Only PDF files allowed (`application/pdf`)
  - Maximum size 50MB
  - Empty files are rejected

### Step 2 — Frontend sends the file
- `useUpload.ts` hook calls `documentService.upload()`
- Axios sends a `POST /api/documents/upload` request with `multipart/form-data`
- The `onUploadProgress` callback updates the progress bar in real time for each file

### Step 3 — Backend receives and stores the file
- `DocumentController.java` receives the file as Spring's `MultipartFile`
- `StorageService.java` writes the file to disk at:
  ```
  uploads/yyyy/MM/dd/<uuid>.pdf
  ```
- The original filename, size, type and storage path are saved to MySQL

### Step 4 — Background processing
- `DocumentService.java` triggers `processDocumentAsync()` using `@Async`
- This runs in a separate thread so the upload response is instant
- The document status changes: `PENDING → PROCESSING → COMPLETED`

### Step 5 — Real-time notification
- Once processing completes, a notification is saved to the database
- The backend pushes it to the frontend via SSE (`SseEmitter`)
- The frontend receives it and:
  - Shows a toast message
  - Updates the notifications page
  - Refreshes the documents table
  - Updates the bell badge count

### Upload behavior by file count

| Files uploaded | Behavior |
|----------------|----------|
| 1 – 3 files | Each file gets its own notification on completion |
| More than 3 files | Processed in background using `CompletableFuture`, one combined notification when all done |

---

## API Endpoints

### Documents

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/documents/upload` | Upload one or more PDFs |
| GET | `/api/documents` | List documents (paginated + filterable) |
| GET | `/api/documents/{id}` | Get document details |
| GET | `/api/documents/download/{id}` | Download a PDF |
| DELETE | `/api/documents/{id}` | Delete a document |

**Supported query params for listing:**
- `page`, `size` — pagination
- `search` — search by filename
- `status` — filter by PENDING / PROCESSING / COMPLETED / FAILED
- `sortBy`, `sortDir` — sorting

### Notifications

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | List all notifications |
| GET | `/api/notifications/unread-count` | Get unread count |
| PATCH | `/api/notifications/{id}/read` | Mark one as read |
| PATCH | `/api/notifications/read-all` | Mark all as read |

### Real-time

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sse/subscribe` | Subscribe to live events |

---

## How Real-time Works

1. When the app loads, the frontend connects to `/api/sse/subscribe`
2. After a file finishes processing, the backend pushes an event through SSE
3. The frontend receives it instantly and:
   - Shows a toast notification
   - Updates the notifications page
   - Refreshes the documents table
   - Updates the bell badge count

---

## File Storage

Uploaded files are stored on disk at:
```
backend/uploads/yyyy/MM/dd/<uuid>.pdf
```

- Original filename is saved in the database
- UUID is used as the stored filename to avoid conflicts
- Filenames are sanitized to prevent path traversal attacks

---

## Running Tests

**Backend:**
```powershell
cd backend
.\mvnw.cmd test
```

**Frontend:**
```powershell
cd frontend
npm run test
```

---

## Common Issues

| Problem | Fix |
|---------|-----|
| `Port 8080 already in use` | Run `netstat -ano \| findstr ":8080"` then `taskkill /F /PID <pid>` |
| `Access denied for user 'root'` | Wrong MySQL password in `application.properties` |
| Notifications not showing | Restart the backend so the latest code is loaded |
| Frontend blank page | Make sure the backend is running first |
