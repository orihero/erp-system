module.exports = {
  apps: [
    {
      name: 'erp-frontend-build',
      script: 'npm',
      args: 'run build',
      cwd: './',
      instances: 1,
      autorestart: false,
      watch: false,
      max_memory_restart: '2G',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/build-err.log',
      out_file: './logs/build-out.log',
      log_file: './logs/build-combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true
    },
    {
      name: 'erp-frontend-serve',
      script: 'npm',
      args: 'run preview',
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 5173
      },
      error_file: './logs/serve-err.log',
      out_file: './logs/serve-out.log',
      log_file: './logs/serve-combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 4000,
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 8000
    }
  ]
};
