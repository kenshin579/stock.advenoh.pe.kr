# Deployment Configuration

## Overview
This application is a full-stack web application with Express.js backend and React frontend. It requires **Autoscale** deployment rather than static deployment.

## Deployment Type
- **Deployment Target**: Autoscale (not Static)
- **Reason**: This is a full-stack application with an Express.js server that serves both API endpoints and static files

## Build Process
The build process creates:
1. **Frontend Build**: Static assets in `dist/public/` directory
2. **Backend Build**: Server bundle as `dist/index.js`

## Deployment Configuration

### Files
- `replit.toml` - Contains deployment configuration
- `package.json` - Contains build and start scripts

### Configuration
```toml
[deployment]
deploymentTarget = "autoscale"
build = ["npm", "run", "build"]
run = ["npm", "start"]
```

### Build Command
```bash
npm run build
```
This command:
1. Builds the React frontend using Vite → `dist/public/`
2. Builds the Express server using ESBuild → `dist/index.js`

### Start Command
```bash
npm start
```
This runs `NODE_ENV=production node dist/index.js`

## Deployment Structure
```
dist/
├── index.js          # Express server bundle
└── public/           # Static frontend assets
    ├── index.html
    └── assets/
        ├── index-[hash].css
        └── index-[hash].js
```

## Environment Variables
- `NODE_ENV=production` - Set automatically in production
- `PORT` - Set by Replit deployment platform
- `DATABASE_URL` - PostgreSQL connection string (if using database)

## Deployment Steps
1. Ensure `replit.toml` is configured for autoscale deployment
2. Run `npm run build` to create production build
3. Test locally with `npm start`
4. Deploy using Replit's deployment interface