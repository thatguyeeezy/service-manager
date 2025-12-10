# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Set Up Database
1. Open phpMyAdmin: http://localhost/phpmyadmin
2. Create database: `service_manager`
3. Import: `database/schema.sql`

### Step 3: Configure
```bash
# Copy environment file
copy .env.example .env

# Edit .env and set your database password (if needed)
# Change JWT_SECRET to a random string
```

### Step 4: Start the Application
```bash
# Use the startup script (recommended)
scripts\start.bat

# Or manually:
# Terminal 1:
npm run ws

# Terminal 2:
npm run dev
```

### Step 5: Access the Panel
1. Open: http://localhost:3000
2. Register your first account (becomes admin)
3. Create your first service!

## 📝 Example Service Configurations

### Teamspeak Server
- **Working Directory**: `C:\services\teamspeak`
- **Start Command**: `ts3server_startscript.bat start`
- **Port**: 9987

### Node.js Bot
- **Working Directory**: `C:\services\bot`
- **Start Command**: `node bot.js`
- **Environment**: `{"NODE_ENV": "production"}`

### Next.js App
- **Working Directory**: `C:\services\myapp`
- **Start Command**: `npm run start`
- **Port**: 3000

## 🔧 Troubleshooting

**Database connection error?**
- Check MySQL is running in XAMPP
- Verify credentials in `.env`

**WebSocket not connecting?**
- Ensure WebSocket server is running (`npm run ws`)
- Check port 3001 is not in use

**Service won't start?**
- Verify working directory exists
- Check start command is correct
- Ensure executable has proper permissions

## 📚 Next Steps

- Read [SETUP.md](SETUP.md) for detailed setup
- Check [ARCHITECTURE.md](ARCHITECTURE.md) for system overview
- Configure external access (port forwarding)
- Set up HTTPS for production

