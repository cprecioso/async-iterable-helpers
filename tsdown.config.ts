import { defineConfig } from "tsdown";

export default defineConfig({
  entry: "src/index.ts",
  outDir: "dist",
  clean: true,

  format: "esm",
  platform: "neutral",
  target: "es2022",

  sourcemap: true,
  dts: { sourcemap: true },
});
