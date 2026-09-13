// ecosystem.config.js
// PM2 inatumia faili hii kuendesha na kudumisha programu (auto-restart ikianguka).
// Matumizi: pm2 start ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "pendo-stylish",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      cwd: __dirname,
      instances: 1, // VPS ina 2GB RAM tu - instance 1 inatosha
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "600M",
      env: {
        NODE_ENV: "production",
      },
      error_file: "logs/pm2-error.log",
      out_file: "logs/pm2-out.log",
      time: true,
    },
  ],
};
