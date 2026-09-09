// @ts-check
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './',
  timeout: 30_000,
  use: {
    baseURL: process.env.AXIA_BASE_URL || 'http://localhost:8080',
    headless: true,
    launchOptions: {
      executablePath: '/opt/pw-browsers/chromium',
    },
  },
});
