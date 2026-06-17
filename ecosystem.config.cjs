// PM2 process configuration for the SDET monorepo.
// Run from the repo root:
//   npm run build          # compile shared -> api -> client
//   pm2 start ecosystem.config.cjs
module.exports = {
  apps: [
    {
      name: "sdet-api",
      cwd: "./api",
      script: "dist/index.js",
      // dist/index.js is an ES module ("type": "module" in api/package.json),
      // so let Node load it directly rather than forking via the interpreter.
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 3890,
      },
    },
  ],
};
