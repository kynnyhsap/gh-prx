import { createColors } from "picocolors";

let colors = createColors(process.env.NO_COLOR === undefined);

export function setColorEnabled(enabled: boolean): void {
  colors = createColors(enabled);
}

export function isColorEnabled(noColorFlag?: boolean): boolean {
  if (noColorFlag) return false;
  return process.env.NO_COLOR === undefined;
}

export function c() {
  return colors;
}
