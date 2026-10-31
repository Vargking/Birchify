import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    // Windows-mounted workspaces can miss native file-change notifications.
    watch: { usePolling: true, interval: 200 },
  },
});
