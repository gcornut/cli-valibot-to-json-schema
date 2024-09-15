import { defineConfig } from "tsup";

export default [
    defineConfig({
        entry: ["./cli/index.ts"],
        clean: true,
        format: ["cjs"],
        outDir: "./bin",
        external: ["esbuild-runner"],
        platform: "node",
        target: "node16",
        banner: { js: "#!/usr/bin/env node" },
    }),
];
