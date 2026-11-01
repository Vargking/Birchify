import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 90000,
  use: {
    storageState: {cookies:[],origins:[{origin:"http://localhost:5173",localStorage:[{name:"birchify-tour-v2",value:"seen"}]}]},
    actionTimeout: 10000,
    baseURL: "http://localhost:5173",
    launchOptions: {
      executablePath:
        "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    },
    headless: true,
    viewport: { width: 1440, height: 1000 },
  },
  reporter: "list",
  workers: 1,
});
