# Service Configuration Examples

## How Working Directory Works

When you create a service in the panel, you specify the **Working Directory** - this is where the service will run from. The `SERVICES_BASE_PATH` in `.env` is just a placeholder and not currently used.

**Important:** You can use either forward slashes (`/`) or backslashes (`\`) in Windows paths, but forward slashes are recommended for consistency.

## Your Actual Service Examples

### 1. Teamspeak Bot (C:\ts3-bot)

**Configuration:**
- **Name**: TS3 Bot
- **Description**: My Teamspeak bot
- **Type**: Teamspeak Bot
- **Working Directory**: `C:/ts3-bot` or `C:\ts3-bot`
- **Start Command**: `node bot.js`
- **Stop Command**: (leave empty, or use `taskkill /F /IM node.exe /FI "WINDOWTITLE eq ts3-bot*"`)
- **Port**: (leave empty if bot doesn't listen on a port)
- **Environment Variables**: 
  ```json
  {"NODE_ENV": "production"}
  ```
  Or if you have a `.env` file in that directory, you can leave this empty.

**What happens:**
- The service manager will `cd` to `C:/ts3-bot`
- Then run `node bot.js`
- All output (stdout/stderr) will be captured and shown in the console

---

### 2. Community Forum (C:\xampp\nodejs-apps\community-forum)

**Configuration:**
- **Name**: Community Forum
- **Description**: My Next.js community forum
- **Type**: Next.js Application
- **Working Directory**: `C:/xampp/nodejs-apps/community-forum` or `C:\xampp\nodejs-apps\community-forum`
- **Start Command**: 
  - Development: `npm run dev`
  - Production: `npm run start` or `npm start`
- **Stop Command**: (leave empty)
- **Port**: `3000` (or whatever port your Next.js app uses)
- **External Port**: `3000` (if you want external access)
- **Environment Variables**: 
  ```json
  {"NODE_ENV": "production", "PORT": "3000"}
  ```

**What happens:**
- The service manager will `cd` to `C:/xampp/nodejs-apps/community-forum`
- Then run `npm run start` (or your chosen command)
- The app will start and you can access it at http://localhost:3000
- All console output will be visible in the panel

---

### 3. Teamspeak Server (Example)

**Configuration:**
- **Name**: Teamspeak Server
- **Description**: My Teamspeak 3 server
- **Type**: Teamspeak Server
- **Working Directory**: `C:/teamspeak` (or wherever your TS server is installed)
- **Start Command**: `ts3server_startscript.bat start` or `ts3server.exe`
- **Stop Command**: `ts3server_startscript.bat stop`
- **Port**: `9987` (default TS3 voice port)
- **External Port**: `9987` (for external access)
- **Environment Variables**: (usually not needed for TS3)

---

## Path Format Tips

✅ **Good (forward slashes):**
- `C:/ts3-bot`
- `C:/xampp/nodejs-apps/community-forum`
- `C:/services/teamspeak`

✅ **Also Good (backslashes):**
- `C:\ts3-bot`
- `C:\xampp\nodejs-apps\community-forum`

❌ **Avoid:**
- Spaces in paths (if possible) - use quotes in commands if needed
- Relative paths like `../bot` - use absolute paths

## Command Examples

### Node.js Applications
- `node bot.js`
- `node server.js`
- `npm start`
- `npm run dev`
- `npm run production`

### Teamspeak
- `ts3server_startscript.bat start`
- `ts3server.exe`
- `start_ts3server.bat`

### Batch Files
- `start.bat`
- `run.bat`

### Python (if you have Python services)
- `python app.py`
- `python3 main.py`

## Environment Variables

You can set environment variables in two formats:

**JSON format:**
```json
{"NODE_ENV": "production", "PORT": "3000", "DATABASE_URL": "mysql://..."}
```

**Key=Value format (one per line):**
```
NODE_ENV=production
PORT=3000
DATABASE_URL=mysql://...
```

## Quick Setup Steps

1. **Start the panel**: Run `scripts\start.bat`
2. **Login/Register**: Go to http://localhost:3000
3. **Create Service**: Click "Create Service"
4. **Fill in the form** with your actual paths and commands
5. **Click "Create Service"**
6. **Start the service**: Click "Start" on the service card
7. **View console**: Click "View Console" to see real-time logs

## Troubleshooting

**Service won't start?**
- Check that the working directory exists
- Verify the start command is correct
- Make sure Node.js/npm is in your PATH
- Check the console for error messages

**Can't see logs?**
- Ensure WebSocket server is running (`npm run ws`)
- Check browser console for WebSocket connection errors
- Verify the service is actually running (check status)

**Path not found?**
- Use absolute paths (full path starting with `C:/`)
- Check spelling and capitalization
- Verify the directory exists before creating the service

