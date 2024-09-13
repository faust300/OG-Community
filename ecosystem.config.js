module.exports = {
  apps: [
    {
      name: 'OG Community API Server',
      script: './dist/main.js',
      args: 'start',
      watch: false,
      instances: -1,
      exec_mode: 'cluster',
      wait_ready: false,
      listen_timeout: 10000,
      kill_timeout: 5000,
      max_memory_restart: '5000M',
      time: true,
      env: {
        "NODE_ENV": "production",
      }
    },
  ],
};