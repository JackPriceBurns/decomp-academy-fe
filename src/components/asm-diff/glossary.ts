import type { AsmDialect } from "@/lib/asm";
import type { Seg } from "@/lib/objdiff/client";

export interface InsnDoc {
  name: string;
  descriptiveName: string;
  usage: string;
  description: string;
}
type RawEntry = { Name: string; DescriptiveName: string; Usage: string; Description: string };

export const glossaryMaps: Record<AsmDialect, Map<string, InsnDoc> | null> = {
  ppc: null,
  "arm:thumb": null,
};
const glossaryPromises: Record<AsmDialect, Promise<Map<string, InsnDoc>> | null> = {
  ppc: null,
  "arm:thumb": null,
};

export function loadGlossary(dialect: AsmDialect): Promise<Map<string, InsnDoc>> {
  let promise = glossaryPromises[dialect];
  if (!promise) {
    const data =
      dialect === "arm:thumb"
        ? import("@/lib/asm/thumb-instructions.json")
        : import("@/lib/asm/ppc-instructions.json");
    promise = data.then((m) => {
      const map = new Map<string, InsnDoc>();
      for (const e of m.default as RawEntry[]) {
        map.set(e.Name, {
          name: e.Name,
          descriptiveName: e.DescriptiveName,
          usage: e.Usage,
          description: e.Description,
        });
      }
      glossaryMaps[dialect] = map;
      return map;
    });
    glossaryPromises[dialect] = promise;
  }
  return promise;
}

export function preloadGlossary(dialect: AsmDialect): void {
  void loadGlossary(dialect);
}

export function lookupInsn(
  map: Map<string, InsnDoc>,
  mnemonic: string,
  dialect: AsmDialect,
): InsnDoc | null {
  const direct = map.get(mnemonic);
  if (direct) return direct;
  if (dialect === "arm:thumb") {
    return mnemonic.endsWith("s") ? (map.get(mnemonic.slice(0, -1)) ?? null) : null;
  }
  let s = mnemonic.replace(/[+-]$/, "");
  if (s.endsWith(".")) s = s.slice(0, -1);
  if (s.endsWith("o")) s = s.slice(0, -1);
  const stripped = map.get(s);
  if (stripped) return stripped;
  if (mnemonic.startsWith("b")) {
    const b = mnemonic.replace(/(la|l|a)$/, "");
    const branch = map.get(b);
    if (branch) return branch;
  }
  return null;
}

function usagePlaceholders(usage: string): string[] {
  const sp = usage.indexOf(" ");
  if (sp < 0) return [];
  return usage
    .slice(sp + 1)
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
}

export function instructionOperands(segs: Seg[]): string[] {
  const mi = segs.findIndex((s) => s.tok === "mnemonic");
  if (mi < 0) return [];
  const after = segs
    .slice(mi + 1)
    .map((s) => s.text)
    .join("")
    .replace(/~>/g, "")
    .trim();
  return after
    ? after
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean)
    : [];
}

export function fillDescription(doc: InsnDoc, operands: string[]): string {
  const ph = usagePlaceholders(doc.usage);
  const subs: Record<string, string> = {};
  let offset = 0;
  if (ph.length === operands.length + 1 && /^crf?[DS]/.test(ph[0])) {
    subs[ph[0]] = "cr0";
    offset = 1;
  }
  for (let i = 0; i < operands.length && i + offset < ph.length; i++) {
    const p = ph[i + offset];
    const o = operands[i];
    const pm = p.match(/^(\w+)\((\w+)\)$/);
    const om = o.match(/^(-?[\w@.+-]+)\((\w+)\)$/);
    if (pm && om) {
      subs[pm[1]] = om[1];
      subs[pm[2]] = om[2];
    } else {
      subs[p] = o;
    }
  }
  return doc.description.replace(/\{([^}]+)\}/g, (_, name) => {
    const br = name.indexOf("[");
    if (br >= 0) return (subs[name.slice(0, br)] ?? name.slice(0, br)) + name.slice(br);
    return subs[name] ?? name;
  });
}
