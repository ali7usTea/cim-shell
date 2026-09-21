// Single source of truth fo revery MFE the Shell can load.
// Adding a 3rd, 4th.... 15th remote means adding one entry here - never
// scatter remote names/module paths through component code.

export type MfeKey = "fixed" | "order";

interface MfeRegistryEntry {
  /** Must match the `name` set in that remote's federation() plugins config. */
  federationName: string;
  /** Must match a key under that remote's federation() `exposes`. */
  exposeModule: string;
  /** Human label for error/loading UI. */
  label: string;
}

export const mfeRegistry: Record<MfeKey, MfeRegistryEntry> = {
  fixed: {
    federationName: "cim_fixed",
    exposeModule: "FixedApp",
    label: "Fixed",
  },
  order: {
    federationName: "cim_order",
    exposeModule: "OrderApp",
    label: "Order",
  },
};

/**
 * Builds the specifier passed to the dynamic `import()` federation call,
 * e.g. "cim_fixed/FixApp".
 */
export function remoteSpecifier(key: MfeKey): string {
  const entry = mfeRegistry[key];
  return `${entry.federationName}/${entry.exposeModule}`;
}
