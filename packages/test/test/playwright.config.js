/**
 * The runtime tests: every helper against the live examples, served from
 * the static Storybook build on 127.0.0.1. Run with `npm run test:runtime`.
 */
import { defineConfig, devices } from "@playwright/test";

const port = 6901;

export default defineConfig({
  testDir: ".",
  testMatch: "*.spec.js",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? "list" : [["list"]],
  use: { baseURL: `http://127.0.0.1:${port}`, trace: "off" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "node serve.js",
    url: `http://127.0.0.1:${port}/index.json`,
    reuseExistingServer: false,
    stdout: "ignore",
  },
});
