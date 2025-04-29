// Load environment variables from .env file
const fs = require('fs');
const path = require('path');

// Parse .env file manually
const envPath = path.resolve(__dirname, '.env');
const envConfig = {};

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  
  // First pass: collect all key-value pairs
  lines.forEach(line => {
    // Skip comments and empty lines
    if (line.trim().startsWith('#') || !line.trim()) return;
    
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      
      // Remove quotes if present
      value = value.replace(/^['"]|['"]$/g, '');
      
      envConfig[key] = value;
    }
  });
  
  // Second pass: resolve variables like ${VAR}
  Object.keys(envConfig).forEach(key => {
    const value = envConfig[key];
    const variableRegex = /\${([\w.-]+)}/g;
    let match;
    let resolvedValue = value;
    
    while ((match = variableRegex.exec(value)) !== null) {
      const varName = match[1];
      if (envConfig[varName]) {
        resolvedValue = resolvedValue.replace(match[0], envConfig[varName]);
      }
    }
    
    envConfig[key] = resolvedValue;
  });
}

// Get HOST_IP from env or use fallback
const HOST_IP = envConfig.HOST_IP || '127.0.0.1';
const SERVER_PORT = envConfig.SERVER_PORT || '5021';
const FRONTEND_PORT = envConfig.FRONTEND_PORT || '5022';

module.exports = {
  apps: [
    {
      name: "student-attendance-backend",
      script: "main.py",
      interpreter: "./venv/bin/python3",
      env: {
        SERVER_HOST: envConfig.SERVER_HOST || "0.0.0.0",
        SERVER_PORT: SERVER_PORT,
        ALLOWED_CLIENT_IP: HOST_IP,
        HOST_IP: HOST_IP,
        SECRET_KEY: envConfig.SECRET_KEY || "production-secret-key-change-me"
      },
      instances: 1,
      exec_mode: "fork",
      watch: false,
      autorestart: true
    },
    {
      name: "student-attendance-frontend",
      script: "npm",
      args: "run serve",
      cwd: "./", // Use current directory
      env: {
        NODE_ENV: "production",
        HOST_IP: HOST_IP,
        PORT: FRONTEND_PORT,
        VITE_SERVER_BASE_URL: `http://${HOST_IP}:${SERVER_PORT}`  
      },
      instances: 1,
      exec_mode: "fork",
      watch: false,
      autorestart: true
    }
  ]
};