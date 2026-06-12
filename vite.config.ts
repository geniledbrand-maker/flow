import { defineConfig } from "vite";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "/flow/",
  plugins: [tailwindcss(), reactRouter()],
});
