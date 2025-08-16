# PM2 Setup Guide for ERP System

This guide explains how to use PM2 to manage the ERP System backend and frontend applications.

## Prerequisites

1. Install PM2 globally:
```bash
npm install -g pm2
```

Or use the provided script:
```bash
npm run pm2:install
```

## Project Structure

```
erp-system/
├── ecosystem.config.js          # Root PM2 configuration
├── package.json                 # Root package.json with PM2 scripts
├── backend/
│   ├── ecosystem.config.js      # Backend-specific PM2 configuration
│   ├── package.json            # Backend package.json with PM2 scripts
│   └── index.js                # Backend entry point
└── frontend/
    ├── ecosystem.config.js      # Frontend-specific PM2 configuration
    ├── package.json            # Frontend package.json with PM2 scripts
    └── ...                     # Frontend files
```

## Installation

Install all dependencies:
```bash
npm run install:all
```

## PM2 Scripts

### Root Level Scripts (from project root)

#### Start Applications
- `npm run pm2:start` - Start both backend and frontend
- `npm run pm2:start:prod` - Start both in production mode
- `npm run pm2:start:backend` - Start only backend
- `npm run pm2:start:frontend` - Build and start only frontend

#### Stop Applications
- `npm run pm2:stop` - Stop both applications
- `npm run pm2:stop:backend` - Stop only backend
- `npm run pm2:stop:frontend` - Stop only frontend

#### Restart Applications
- `npm run pm2:restart` - Restart both applications
- `npm run pm2:restart:backend` - Restart only backend
- `npm run pm2:restart:frontend` - Restart only frontend

#### Monitoring and Logs
- `npm run pm2:status` - Show status of all applications
- `npm run pm2:logs` - Show logs from all applications
- `npm run pm2:logs:backend` - Show only backend logs
- `npm run pm2:logs:frontend` - Show only frontend logs
- `npm run pm2:monit` - Open PM2 monitoring dashboard

#### Advanced PM2 Commands
- `npm run pm2:reload` - Zero-downtime reload of applications
- `npm run pm2:delete` - Delete all applications from PM2
- `npm run pm2:save` - Save current PM2 configuration
- `npm run pm2:resurrect` - Restore saved PM2 configuration
- `npm run pm2:startup` - Generate startup script
- `npm run pm2:kill` - Kill PM2 daemon

### Backend Scripts (from backend directory)

```bash
cd backend
npm run pm2:start          # Start backend
npm run pm2:start:prod     # Start in production mode
npm run pm2:stop           # Stop backend
npm run pm2:restart        # Restart backend
npm run pm2:reload         # Zero-downtime reload
npm run pm2:delete         # Delete from PM2
npm run pm2:logs           # Show logs
npm run pm2:monit          # Open monitoring
npm run pm2:status         # Show status
```

### Frontend Scripts (from frontend directory)

```bash
cd frontend
npm run pm2:build          # Build frontend only
npm run pm2:serve          # Serve built frontend only
npm run pm2:start          # Build and start frontend
npm run pm2:start:prod     # Build and start in production
npm run pm2:stop           # Stop frontend
npm run pm2:restart        # Restart frontend
npm run pm2:reload         # Zero-downtime reload
npm run pm2:delete         # Delete from PM2
npm run pm2:logs           # Show logs
npm run pm2:monit          # Open monitoring
npm run pm2:status         # Show status
```

## Quick Start Guide

1. **Install dependencies:**
   ```bash
   npm run install:all
   ```

2. **Start both applications:**
   ```bash
   npm run pm2:start
   ```

3. **Check status:**
   ```bash
   npm run pm2:status
   ```

4. **View logs:**
   ```bash
   npm run pm2:logs
   ```

5. **Monitor applications:**
   ```bash
   npm run pm2:monit
   ```

## Production Deployment

1. **Start in production mode:**
   ```bash
   npm run pm2:start:prod
   ```

2. **Save PM2 configuration:**
   ```bash
   npm run pm2:save
   ```

3. **Generate startup script (for auto-start on boot):**
   ```bash
   npm run pm2:startup
   ```

## Configuration Details

### Backend Configuration
- **Port:** 3001
- **Environment:** Development/Production
- **Memory Limit:** 1GB
- **Auto-restart:** Enabled
- **Logs:** Stored in `backend/logs/`

### Frontend Configuration
- **Port:** 5173
- **Environment:** Production
- **Memory Limit:** 1GB
- **Auto-restart:** Enabled
- **Logs:** Stored in `frontend/logs/`

## Log Files

Logs are automatically created in the following locations:
- `backend/logs/err.log` - Backend error logs
- `backend/logs/out.log` - Backend output logs
- `backend/logs/combined.log` - Backend combined logs
- `frontend/logs/err.log` - Frontend error logs
- `frontend/logs/out.log` - Frontend output logs
- `frontend/logs/combined.log` - Frontend combined logs

## Troubleshooting

### Common Issues

1. **Port already in use:**
   - Check if applications are already running: `npm run pm2:status`
   - Stop existing processes: `npm run pm2:stop`

2. **Build errors:**
   - Ensure all dependencies are installed: `npm run install:all`
   - Check frontend build: `cd frontend && npm run build`

3. **Permission errors:**
   - Run with sudo if needed: `sudo npm run pm2:start`

4. **Memory issues:**
   - Check memory usage: `npm run pm2:monit`
   - Restart applications: `npm run pm2:restart`

### Useful Commands

```bash
# View all PM2 processes
pm2 list

# View detailed information
pm2 show erp-backend
pm2 show erp-frontend

# View real-time logs
pm2 logs --lines 100

# Restart specific application
pm2 restart erp-backend

# Scale applications (if needed)
pm2 scale erp-backend 2
```

## Environment Variables

The applications use the following environment variables:

### Backend
- `NODE_ENV`: development/production
- `PORT`: 3001 (default)

### Frontend
- `NODE_ENV`: production
- `PORT`: 5173 (default)

You can modify these in the respective `ecosystem.config.js` files.

