import { readFileSync } from "node:fs";

interface PackageJson {
  version?: string;
}

function readPackageVersion(): string {
  const raw = readFileSync(new URL("../package.json", import.meta.url), "utf8");
  const parsed = JSON.parse(raw) as PackageJson;
  if (!parsed.version || typeof parsed.version !== "string") {
    throw new Error("package.json version is missing");
  }
  return parsed.version;
}

const version = readPackageVersion();

const result = await Bun.build({
  entrypoints: ["./src/cli/index.ts"],
  target: "node",
  outdir: "dist",
  sourcemap: "external",
  define: {
    GH_PRX_VERSION: JSON.stringify(version),
  },
});

if (!result.success) {
  for (const log of result.logs) {
    console.error(log);
  }
  process.exit(1);
}
