import type { OutputFormat } from "../domain/types";

export function printResult(format: OutputFormat, data: unknown, textRenderer: () => string): void {
  if (format === "json") {
    process.stdout.write(`${JSON.stringify(data, null, 2)}\n`);
    return;
  }
  if (format === "jsonl") {
    if (Array.isArray(data)) {
      for (const item of data) process.stdout.write(`${JSON.stringify(item)}\n`);
      return;
    }
    if (typeof data === "object" && data !== null) {
      for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
        process.stdout.write(`${JSON.stringify({ type: key, value })}\n`);
      }
      return;
    }
    process.stdout.write(`${JSON.stringify({ value: data })}\n`);
    return;
  }
  process.stdout.write(`${textRenderer()}\n`);
}
