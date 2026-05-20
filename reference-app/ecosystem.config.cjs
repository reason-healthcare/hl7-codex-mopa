// pm2 ecosystem — starts all six OGCA apps in dev (hot-reload) mode.
// Run from the reference-app/ directory: pm2 start ecosystem.config.cjs
/** @type {import('pm2').StartOptions[]} */
module.exports = {
  apps: [
    {
      name: "ehr",
      cwd: "./apps/ehr",
      script: "pnpm",
      args: "dev",
      watch: false,
    },
    {
      name: "smart-app",
      cwd: "./apps/smart-app",
      script: "pnpm",
      args: "dev",
      watch: false,
    },
    {
      name: "crd-service",
      cwd: "./apps/crd-service",
      script: "pnpm",
      args: "dev",
      watch: false,
    },
    {
      name: "dtr-client",
      cwd: "./apps/dtr-client",
      script: "pnpm",
      args: "dev",
      watch: false,
    },
    {
      name: "pas-service",
      cwd: "./apps/pas-service",
      script: "pnpm",
      args: "dev",
      watch: false,
    },
    {
      name: "payer-backend",
      cwd: "./apps/payer-backend",
      script: "pnpm",
      args: "dev",
      watch: false,
    },
  ],
};
