module.exports = {
  apps: [
    {
      name: "sdet-api-1",
      cwd: "./api",
      script: "dist/index.js",
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 3890,
      },
    },
    {
      name: "sdet-api-2",
      cwd: "./api",
      script: "dist/index.js",
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 3891,
      },
    },
    {
      name: "sdet-api-3",
      cwd: "./api",
      script: "dist/index.js",
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 3892,
      },
    },
  ],
};
