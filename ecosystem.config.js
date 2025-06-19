module.exports = {
  apps: [
    {
      name: 'ders-server',
      script: './index.js',
      cwd: '/var/www/ders/server',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 5003
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5003
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: '/var/www/ders/logs/server-error.log',
      out_file: '/var/www/ders/logs/server-out.log',
      log_file: '/var/www/ders/logs/server-combined.log',
      time: true
    },
    {
      name: 'ders-web',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/ders/web',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: '/var/www/ders/logs/web-error.log',
      out_file: '/var/www/ders/logs/web-out.log',
      log_file: '/var/www/ders/logs/web-combined.log',
      time: true
    }
  ]
}; 