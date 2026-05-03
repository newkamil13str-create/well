// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'kamilshop-web',
      cwd: './apps/web',
      script: 'node',
      args: '.next/standalone/server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      max_memory_restart: '500M',
      restart_delay: 3000,
    },
    {
      name: 'kamilshop-wa',
      cwd: './apps/bot-wa',
      script: 'npx',
      args: 'ts-node index.ts',
      env: {
        NODE_ENV: 'production',
      },
      restart_delay: 5000,
      max_restarts: 10,
    },
    {
      name: 'kamilshop-tg',
      cwd: './apps/bot-tg',
      script: 'npx',
      args: 'ts-node index.ts',
      env: {
        NODE_ENV: 'production',
      },
      restart_delay: 3000,
      max_restarts: 10,
    },
  ],
}
