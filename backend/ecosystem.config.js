module.exports = {
    apps: [
      {
        name: "aikan-backend",
        script: "dist/server.js",
        cwd: "/var/www/aikan/backend",
        instances: 1,
        exec_mode: "fork",
        env: {
          NODE_ENV: "production",
        },
        error_file: "./logs/pm2-error.log",
        out_file: "./logs/pm2-out.log",
        log_date_format: "YYYY-MM-DD HH:mm:ss Z",
        merge_logs: true,
        autorestart: true,
        watch: false,
        max_memory_restart: "1G",
        // Wait for graceful shutdown
        kill_timeout: 5000,
        wait_ready: true,
        listen_timeout: 10000,
      },
    ],
  };
  
  