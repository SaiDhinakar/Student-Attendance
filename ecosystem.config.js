module.exports = {
  apps: [
    {
      name: "student-attendance-backend",
      script: "main.py",
      interpreter: "./venv/bin/python3",
      env: {
        SERVER_HOST: "0.0.0.0",
        SERVER_PORT: "8000",
        ALLOWED_CLIENT_IP: "127.0.0.1",
        SECRET_KEY: "production-secret-key-change-me"
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
      cwd: "/mnt/data/PROJECTS/Student-Attendance",
      env: {
        NODE_ENV: "production",
      },
      instances: 1,
      exec_mode: "fork",
      watch: false,
      autorestart: true
    }
  ]
};