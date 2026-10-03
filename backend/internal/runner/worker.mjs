import { startVitest } from "vitest/node";
import { readFileSync, realpathSync } from "fs";
import path from "path";

async function main() {
  // realpath обязателен: на macOS tmp-путь приходит через symlink /var -> /private/var,
  // без него vite в jsdom-окружении падает с "Failed to load url"
  const tempDir = realpathSync(process.argv[2]);
  const mode = process.argv[3] || "run";
  const testFile = process.argv[4] || "tests/test.ts";
  const jsonOut = path.join(tempDir, "result.json");

  const config = {
    root: tempDir,
    reporters: ["json"],
    outputFile: jsonOut,
    pool: "forks",
    isolate: true,
    testTimeout: 8000,
    include: [testFile],
    esbuild: { jsx: "automatic" },
  };

  if (mode === "typecheck") {
    config.typecheck = {
      enabled: true,
      include: ["tests/**"],
      tsconfig: "tsconfig.json",
      ignoreSourceErrors: true,
    };
  }

  const vitest = await startVitest(
    "test",
    [testFile],
    config,
    // vite-оверрайды: esbuild — опция vite, а не vitest
    { esbuild: { jsx: "automatic" } }
  );

  await vitest.close();
  process.stdout.write(readFileSync(jsonOut, "utf8"));
}

main().catch((e) => {
  process.stderr.write(String(e));
  process.exit(1);
});
