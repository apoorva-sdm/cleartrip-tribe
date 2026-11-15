import { useId } from "react";

/** A per-instance SVG id. useId output contains colons, which are stripped so it is safe inside url(#…). */
export function useSvgId(prefix: string): string {
  return `${prefix}${useId().replace(/:/g, "")}`;
}
