// PM2 Ecosystem Configuration for FindHub
// This configuration manages all FindHub applications with PM2 process manager

module.exports = {
  apps: [
    {
      name: 'findhub-server',
      cwd: './apps/server',
      script: 'bun',
      args: 'run dist/index.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/server-error.log',
      out_file: './logs/server-out.log',
      log_file: './logs/server-combined.log',
      time: true,
      max_memory_restart: '1G',
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s'
    },
    {
      name: 'findhub-web',
      cwd: './apps/web',
      script: 'bun',
      args: 'start',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: './logs/web-error.log',
      out_file: './logs/web-out.log',
      log_file: './logs/web-combined.log',
      time: true,
      max_memory_restart: '1G',
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s'
    },
    {
      name: 'findhub-admin',
      cwd: './apps/admin',
      script: 'bun',
      args: 'start',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
        NEXT_PUBLIC_ADMIN_MODE: 'true'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3002,
        NEXT_PUBLIC_ADMIN_MODE: 'true'
      },
      error_file: './logs/admin-error.log',
      out_file: './logs/admin-out.log',
      log_file: './logs/admin-combined.log',
      time: true,
      max_memory_restart: '1G',
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ],

  deploy: {
    production: {
      user: 'deploy',
      host: ['your-server.com'],
      ref: 'origin/main',
      repo: 'git@github.com:your-username/findhub.git',
      path: '/var/www/findhub',
      'pre-deploy-local': '',
      'post-deploy': 'bun install --frozen-lockfile && bun run build && bun run db:migrate && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
      'ssh_options': 'ForwardAgent=yes'
    },
    staging: {
      user: 'deploy',
      host: ['staging-server.com'],
      ref: 'origin/develop',
      repo: 'git@github.com:your-username/findhub.git',
      path: '/var/www/findhub-staging',
      'post-deploy': 'bun install --frozen-lockfile && bun run build && bun run db:migrate && pm2 reload ecosystem.config.js --env staging',
      env: {
        NODE_ENV: 'staging'
      }
    }
  }
};