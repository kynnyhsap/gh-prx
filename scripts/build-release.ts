import { chmodSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { basename, join } from "node:path";

interface PackageJson {
  version?: string;
}

interface TargetDef {
  target: Bun.Build.Target;
  suffix: string;
  ext: "" | ".exe";
}

const TARGETS: TargetDef[] = [
  { target: "bun-darwin-arm64", suffix: "darwin-arm64", ext: "" },
  { target: "bun-darwin-x64-baseline", suffix: "darwin-amd64", ext: "" },
  { target: "bun-linux-arm64", suffix: "linux-arm64", ext: "" },
  { target: "bun-linux-x64-baseline", suffix: "linux-amd64", ext: "" },
  { target: "bun-windows-arm64", suffix: "windows-arm64", ext: ".exe" },
  { target: "bun-windows-x64-baseline", suffix: "windows-amd64", ext: ".exe" },
];

const RELEASE_OUTDIR = process.env.GH_PRX_RELEASE_OUTDIR?.trim() || "release-dist";

function readPackageVersion(): string {
  const raw = readFileSync(new URL("../package.json", import.meta.url), "utf8");
  const parsed = JSON.parse(raw) as PackageJson;
  if (!parsed.version || typeof parsed.version !== "string") {
    throw new Error("package.json version is missing");
  }
  return parsed.version;
}

function normalizeVersion(input?: string): string {
  if (!input) return readPackageVersion();
  const trimmed = input.trim();
  if (!trimmed) return readPackageVersion();
  return trimmed.startsWith("v") ? trimmed.slice(1) : trimmed;
}

function sha256(path: string): string {
  const data = readFileSync(path);
  return createHash("sha256").update(data).digest("hex");
}

const argVersion = Bun.argv[2];
const version = normalizeVersion(argVersion || process.env.GH_PRX_RELEASE_VERSION);
const packageVersion = readPackageVersion();

if (version !== packageVersion) {
  throw new Error(
    `Release version mismatch: tag/version=${version}, package.json=${packageVersion}. Bump package.json first.`,
  );
}

rmSync(RELEASE_OUTDIR, { recursive: true, force: true });
mkdirSync(RELEASE_OUTDIR, { recursive: true });

const artifacts: string[] = [];

for (const target of TARGETS) {
  const outfile = join(RELEASE_OUTDIR, `gh-prx_v${version}_${target.suffix}${target.ext}`);
  const result = await Bun.build({
    entrypoints: ["./src/cli/index.ts"],
    compile: {
      target: target.target,
      outfile,
      autoloadPackageJson: false,
      autoloadDotenv: false,
      autoloadBunfig: false,
      autoloadTsconfig: false,
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
    throw new Error(`Failed to build target ${target.target}`);
  }

  if (!target.ext) {
    chmodSync(outfile, 0o755);
  }

  artifacts.push(outfile);
  console.log(`Built ${outfile}`);
}

const checksums = artifacts.map((path) => `${sha256(path)}  ${basename(path)}`).join("\n");

const checksumsPath = join(RELEASE_OUTDIR, "checksums.txt");
writeFileSync(checksumsPath, `${checksums}\n`, "utf8");
artifacts.push(checksumsPath);

console.log(`Wrote ${checksumsPath}`);
console.log("Release artifacts:");
for (const path of artifacts) {
  console.log(`- ${path}`);
}
