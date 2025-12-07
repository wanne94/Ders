module.exports = {
  apps: [
    {
      name: 'ders-server',
      script: './index.js',
      cwd: '/var/www/ders.ba/server',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      kill_timeout: 5000,
      wait_ready: false,
      env: {
        NODE_ENV: 'production',
        PORT: 5003
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5003
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: '/var/www/ders.ba/logs/server-error.log',
      out_file: '/var/www/ders.ba/logs/server-out.log',
      log_file: '/var/www/ders.ba/logs/server-combined.log',
      time: true
    },
    {
      name: 'ders-web',
      script: './node_modules/.bin/next',
      args: 'start -p 3002',
      cwd: '/var/www/ders.ba/web',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      kill_timeout: 10000,
      listen_timeout: 15000,
      restart_delay: 5000,
      env: {
        NODE_ENV: 'production',
        PORT: 3002
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3002
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: '/var/www/ders.ba/logs/web-error.log',
      out_file: '/var/www/ders.ba/logs/web-out.log',
      log_file: '/var/www/ders.ba/logs/web-combined.log',
      time: true
    }
  ]
};