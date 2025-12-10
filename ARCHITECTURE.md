# Architecture Overview

## System Architecture

This service management panel is built with a modern, scalable architecture:

```
┌─────────────────┐
│   Next.js App   │  (Port 3000)
│  (Frontend +    │
│   API Routes)   │
└────────┬────────┘
         │
         ├───► MySQL Database (via XAMPP)
         │
         └───► WebSocket Server (Port 3001)
                    │
                    └───► Service Manager
                              │
                              └───► Child Processes (Services)
```

## Components

### 1. Frontend (Next.js)
- **Pages**: Login, Dashboard, Service Console
- **Components**: Service cards, modals, console viewer
- **State Management**: React Context API (AuthContext)
- **Styling**: CSS Modules with dark theme

### 2. Backend API (Next.js API Routes)
- `/api/auth/*` - Authentication endpoints
- `/api/services/*` - Service CRUD operations
- `/api/services/[id]/control` - Service control (start/stop/restart)
- `/api/ws-token` - WebSocket authentication token

### 3. WebSocket Server (Express + ws)
- Real-time console log streaming
- Service log subscriptions
- Authentication via JWT
- Auto-reconnection support

### 4. Service Manager
- Process lifecycle management
- Log capture and broadcasting
- PID tracking
- Windows-compatible process spawning

### 5. Database (MySQL)
- **users**: User accounts and authentication
- **services**: Service configurations
- **service_logs**: Historical logs (optional)
- **service_stats**: Performance metrics (optional)

## Data Flow

### Service Start Flow
1. User clicks "Start" in UI
2. Frontend calls `/api/services/[id]/control` with `action: 'start'`
3. API validates request and updates service status to "starting"
4. ServiceManager spawns child process
5. Process stdout/stderr captured and broadcast via WebSocket
6. Service status updated to "running"
7. Frontend receives real-time logs via WebSocket

### Console View Flow
1. User navigates to service console page
2. Frontend authenticates with WebSocket server
3. Frontend subscribes to service logs
4. ServiceManager broadcasts logs to all subscribers
5. Frontend displays logs in real-time console

## Security

- **Authentication**: JWT tokens stored in localStorage
- **Authorization**: Role-based (admin/user)
- **WebSocket**: Token-based authentication
- **Database**: Parameterized queries (SQL injection prevention)
- **Password**: bcrypt hashing (10 rounds)

## Service Management

Services are managed as child processes:
- **Start**: Spawns new process with configured command
- **Stop**: Sends SIGTERM, then SIGKILL if needed
- **Restart**: Stops then starts service
- **Logs**: Captured from stdout/stderr streams

## Windows Compatibility

- Uses Node.js `child_process.spawn()` with `shell: true`
- Supports Windows paths (both `/` and `\`)
- Handles Windows service commands
- Compatible with Windows Server 2022

## Scalability Considerations

- **Database Connection Pooling**: MySQL connection pool (10 connections)
- **WebSocket**: Handles multiple concurrent connections
- **Process Management**: In-memory process tracking (can be extended to Redis)
- **Log Storage**: Optional database logging for persistence

## Future Enhancements

- Redis for distributed process management
- Docker container support
- Service templates/presets
- Resource monitoring (CPU, memory)
- Email notifications
- Service scheduling/cron
- Backup/restore functionality
- Multi-server support

