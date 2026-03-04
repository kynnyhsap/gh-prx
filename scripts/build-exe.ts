import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

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

function currentTarget(): { target: Bun.Build.Target; suffix: string; ext: string } {
  const arch = process.arch;
  const platform = process.platform;

  if (platform === "darwin" && arch === "arm64") {
    return { target: "bun-darwin-arm64", suffix: "darwin-arm64", ext: "" };
  }

  if (platform === "darwin" && arch === "x64") {
    return { target: "bun-darwin-x64-baseline", suffix: "darwin-amd64", ext: "" };
  }

  if (platform === "linux" && arch === "arm64") {
    return { target: "bun-linux-arm64", suffix: "linux-arm64", ext: "" };
  }

  if (platform === "linux" && arch === "x64") {
    return { target: "bun-linux-x64-baseline", suffix: "linux-amd64", ext: "" };
  }

  if (platform === "win32" && arch === "arm64") {
    return { target: "bun-windows-arm64", suffix: "windows-arm64", ext: ".exe" };
  }

  if (platform === "win32" && arch === "x64") {
    return { target: "bun-windows-x64-baseline", suffix: "windows-amd64", ext: ".exe" };
  }

  throw new Error(`Unsupported host target: ${platform}-${arch}`);
}

const version = readPackageVersion();
const targetInfo = currentTarget();

mkdirSync("release-dist", { recursive: true });
const outfile = join("release-dist", `gh-prx_v${version}_${targetInfo.suffix}${targetInfo.ext}`);

const result = await Bun.build({
  entrypoints: ["./src/cli/index.ts"],
  compile: {
    target: targetInfo.target,
    outfile,
  },
  minify: true,
  sourcemap: "none",
  define: {
    GH_PRX_VERSION: JSON.stringify(version),
  },
});

if (!result.success || !existsSync(outfile)) {
  for (const log of result.logs) {
    console.error(log);
  }
  process.exit(1);
}

console.log(`Built ${outfile}`);
