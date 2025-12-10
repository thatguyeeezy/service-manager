# Service Management Panel

A Pterodactyl-like service management panel for Windows Server 2022, designed to manage services like Teamspeak servers, bots, and Next.js instances.

## Features

- 🔐 **User Authentication** - Secure login/register system with JWT
- 🎮 **Service Management** - Start, stop, restart services easily
- 📺 **Real-time Console** - Live console output for each service
- 📊 **Service Monitoring** - Real-time status and resource monitoring
- 🌐 **Remote Access** - Configure and access services from outside your VPS
- 🎨 **Modern UI** - Clean, responsive interface built with Next.js

## Prerequisites

- Windows Server 2022
- Node.js 18+ and npm
- XAMPP (Apache, MySQL, PHP)
- MySQL database running

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up the database:**
   - Open phpMyAdmin (http://localhost/phpmyadmin)
   - Create a new database called `service_manager`
   - Import the SQL schema from `database/schema.sql`

3. **Configure environment:**
   - Copy `.env.example` to `.env`
   - Update database credentials and JWT secret

4. **Start the application:**
   ```bash
   npm run dev
   ```

5. **Access the panel:**
   - Open http://localhost:3000
   - Register your first admin account

## Architecture

- **Frontend**: Next.js 14 with React
- **Backend API**: Next.js API routes + Express WebSocket server
- **Database**: MySQL (via XAMPP)
- **Authentication**: JWT tokens
- **Real-time**: WebSocket for console streaming
- **Service Management**: Node.js child_process for Windows services

## Service Configuration

Services are configured in the database and can be managed through the web interface. Each service can have:
- Custom start/stop commands
- Working directory
- Environment variables
- Port mappings
- Auto-restart on failure

## Security Notes

- Change the default JWT secret in production
- Use strong passwords
- Consider adding HTTPS/SSL
- Configure Windows Firewall for external access
- Use reverse proxy (Apache) for production deployment

