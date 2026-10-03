import { startVitest } from "vitest/node";
import { readFileSync } from "fs";
import path from "path";

async function main() {
  const tempDir = process.argv[2];
  const jsonOut = path.join(tempDir, "result.json");

  const vitest = await startVitest("test", ["tests/test.ts"], {
    root: tempDir,
    reporters: ["json"],
    outputFile: jsonOut,
    pool: "forks",
    isolate: true,
    testTimeout: 8000,
    include: ["tests/test.ts"],
  });

  await vitest.close();
  process.stdout.write(readFileSync(jsonOut, "utf8"));
}

main().catch((e) => {
  process.stderr.write(String(e));
  process.exit(1);
});
