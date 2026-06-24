import { Tier } from "@/lib/lessons/types";
import tiers from "./generated/tiers.json";

// The curriculum "acts" that group chapters on the map. Compiled from each
// tier's _tier.md by scripts/build-curriculum.mjs, sorted by order.
export const TIERS = tiers as unknown as Tier[];

export const TIER_BY_ID = new Map(TIERS.map((t) => [t.id, t]));
