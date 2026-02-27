module.exports = {
  apps: [
    {
      name: "readme-bot",
      script: "scripts/bot-local.js",
      watch: false,
      autorestart: true,
      instances: 1,
      exec_mode: "fork",
      error_file: "logs/error.log",
      out_file: "logs/output.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss"
    }
  ]
};