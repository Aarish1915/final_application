module.exports = {
  apps: [
    {
      name: "ingri-world-api",
      script: "./src/server.mjs",
      instances: "max",       // Use all CPU cores
      exec_mode: "cluster",   // Run in cluster mode
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      }
    }
  ]
};
