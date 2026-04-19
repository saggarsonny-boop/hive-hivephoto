/**
 * GrapplerHook — engine metadata for the Hive governance layer.
 * This object is the machine-readable version of ENGINE_GRAMMAR.md.
 */
export const GrapplerHook = {
  engine: "HivePhoto",
  id: "hivephoto",
  domain: "hivephoto.hive.baby",
  status: "building",
  tier: 2,
  schema: "photo-intelligence",
  safety: "standard",
  stack: ["nextjs", "typescript", "tailwind", "clerk", "neon", "r2", "anthropic"],
  version: "0.1.0",
  noAds: true,
  noInvestors: true,
  noAgenda: true,
} as const;

export type GrapplerHookType = typeof GrapplerHook;
