# Deployment Configuration

## Overview
This application has been configured for **Static** deployment, serving only the React frontend. The Express.js backend features are not available in static deployment.

## Deployment Type
- **Deployment Target**: Static
- **Note**: This configuration serves only the frontend React application. API endpoints will not work in static deployment.

## Build Process
The build process creates:
1. **Frontend Build**: Static assets in `dist/public/` directory only

## Deployment Configuration

### Files
- `replit.toml` - Contains deployment configuration
- `build-static.sh` - Static build script

### Configuration
```toml
[deployment]
deploymentTarget = "static"
build = ["./build-static.sh"]
publicDir = "dist/public"
```

### Build Command
```bash
./build-static.sh
```
This command:
1. Builds only the React frontend using Vite → `dist/public/`

### Static Deployment Limitations
- **API endpoints** will not work (no server-side functionality)
- **Database features** will not work
- **Newsletter subscription** will not work
- **Blog post creation/editing** will not work
- Only the frontend React application will be served

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