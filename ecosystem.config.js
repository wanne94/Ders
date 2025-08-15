module.exports = {
  apps: [
    {
      name: 'ders-web',
      script: 'npm',
      args: 'start',
      cwd: '/root/ders.ba/web',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: '/root/logs/ders-web-error.log',
      out_file: '/root/logs/ders-web-out.log',
      log_file: '/root/logs/ders-web-combined.log',
      time: true
    },
    {
      name: 'ders-api',
      script: 'index.js',
      cwd: '/root/ders.ba/server',
      env: {
        NODE_ENV: 'production',
        PORT: 5003,
        MONGODB_URI: 'mongodb://avdoAdmin:WanNeAvdo1994@127.0.0.1:27017/Predavanja?authSource=admin'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: '/root/logs/ders-api-error.log',
      out_file: '/root/logs/ders-api-out.log',
      log_file: '/root/logs/ders-api-combined.log',
      time: true
    }
  ]
};