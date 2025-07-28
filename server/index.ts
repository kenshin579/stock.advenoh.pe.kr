import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import path from "path";
import { fileURLToPath } from "url";

// Next.js development server launcher
const USE_NEXTJS = true;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Serve attached_assets as static files
app.use('/attached_assets', express.static(path.join(projectRoot, 'attached_assets')));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      console.log(logLine);
    }
  });

  next();
});

(async () => {
  if (USE_NEXTJS) {
    // Import and start Next.js development server
    const { spawn } = await import('child_process');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const projectRoot = path.resolve(__dirname, '..');
    const nextjsPath = path.join(projectRoot, 'client_nextjs');
    
    console.log('🚀 Starting Next.js Development Server...');
    console.log('📁 Next.js path:', nextjsPath);
    
    // Start Next.js development server
    const nextProcess = spawn('npm', ['run', 'dev'], {
      cwd: nextjsPath,
      stdio: 'inherit',
      shell: true,
      env: {
        ...process.env,
        PORT: '3001'
      }
    });
    
    nextProcess.on('error', (error) => {
      console.error('❌ Failed to start Next.js:', error);
      process.exit(1);
    });
    
    return; // Exit early for Next.js mode
  }
  
  // Fallback for non-Next.js mode (not used currently)
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  const port = parseInt(process.env.PORT || '3001', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    console.log(`serving on port ${port}`);
  });
})();
