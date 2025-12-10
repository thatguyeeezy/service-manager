# Setup Guide

## Prerequisites

1. **Windows Server 2022** with:
   - Node.js 18+ installed
   - XAMPP installed and running (Apache + MySQL)
   - npm installed

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Database

1. Open phpMyAdmin: http://localhost/phpmyadmin
2. Create a new database called `service_manager`
3. Import the SQL schema:
   - Click on the `service_manager` database
   - Go to the "Import" tab
   - Select `database/schema.sql`
   - Click "Go"

Alternatively, you can run the SQL file directly in MySQL.

### 3. Configure Environment

1. Copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env
   ```

2. Edit `.env` and update:
   - Database credentials (if different from defaults)
   - JWT_SECRET (use a strong random string)
   - Service paths if needed

### 4. Start the Application

**Development Mode:**
```bash
# Option 1: Use the startup script
scripts\start.bat

# Option 2: Manual start
# Terminal 1: Start WebSocket server
node server/index.js

# Terminal 2: Start Next.js
npm run dev
```

**Production Mode:**
```bash
scripts\start-production.bat
```

### 5. Access the Panel

1. Open your browser: http://localhost:3000
2. Register your first account (this will be an admin account)
3. Start creating and managing your services!

## Service Configuration Examples

### Teamspeak Server

- **Name**: My Teamspeak Server
- **Type**: Teamspeak Server
- **Working Directory**: `C:\services\teamspeak`
- **Start Command**: `ts3server_startscript.bat start` or `ts3server.exe`
- **Port**: 9987
- **External Port**: 9987 (if different from internal)

### Teamspeak Bot

- **Name**: My TS Bot
- **Type**: Teamspeak Bot
- **Working Directory**: `C:\services\tsbot`
- **Start Command**: `node bot.js` or `npm start`
- **Port**: (leave empty if not applicable)

### Next.js Application

- **Name**: My Next.js App
- **Type**: Next.js Application
- **Working Directory**: `C:\services\myapp`
- **Start Command**: `npm run start` or `node server.js`
- **Port**: 3000 (or your app's port)
- **Environment Variables**: 
  ```json
  {"NODE_ENV": "production", "PORT": "3000"}
  ```

## External Access Setup

To access services from outside your VPS:

1. **Windows Firewall**: Allow inbound connections on your service ports
2. **Router/Network**: Port forward external ports to your VPS IP
3. **Apache Reverse Proxy** (Optional): Configure Apache to proxy requests

### Apache Reverse Proxy Example

Add to your Apache `httpd.conf` or virtual host:

```apache
<VirtualHost *:80>
    ServerName your-domain.com
    
    ProxyPreserveHost On
    ProxyPass /api http://localhost:3000/api
    ProxyPassReverse /api http://localhost:3000/api
    
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/
</VirtualHost>
```

## Troubleshooting

### Database Connection Issues
- Verify MySQL is running in XAMPP
- Check database credentials in `.env`
- Ensure database `service_manager` exists

### WebSocket Connection Issues
- Verify WebSocket server is running on port 3001
- Check firewall settings
- Ensure both Next.js and WebSocket servers are running

### Service Won't Start
- Verify working directory exists
- Check start command is correct
- Ensure executable permissions
- Check Windows paths use backslashes or forward slashes

### Port Already in Use
- Change `WS_PORT` in `.env` for WebSocket server
- Change Next.js port: `npm run dev -- -p 3001`

## Security Recommendations

1. **Change JWT_SECRET** to a strong random string
2. **Use strong passwords** for all accounts
3. **Enable HTTPS** in production (use Apache with SSL)
4. **Restrict database access** to localhost only
5. **Regular backups** of the database
6. **Keep Node.js and dependencies updated**

## Next Steps

- Configure your services
- Set up port forwarding for external access
- Customize the UI if needed
- Set up automated backups
- Configure monitoring/alerting

