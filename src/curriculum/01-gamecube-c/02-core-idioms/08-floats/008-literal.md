---
id: def3e219-7e4e-5c36-9b96-d5de18b6f76f
slug: floats-literal
title: Loading a Float Constant from the SDA
difficulty: 2
concepts:
  - floating-point
  - constants
  - lfs
  - sda
symbol: func_803bcf88
hints:
  - A float constant is loaded from the small data area with `lfs`, not an
    immediate.
  - "`x * 0.25f` becomes `lfs f0, ...` then `fmuls f1, f0, f1`."
---

# Float literals don't fit in an immediate

PowerPC has no load-immediate for floats — a 32-bit constant won't fit inside
an instruction word. So MWCC stashes the value in the small data area (SDA) and
pulls it back with `lfs` (load floating single), addressed off `r2`/`r13`. A
function that doubles its input compiles like this:

```asm
lfs   f0, ...      # load 2.0f from the SDA
fmuls f1, f0, f1   # single-precision multiply
blr
```

Those `...` are a relocation; the linker resolves them, and in the disassembler
you'll see an SDA-relative offset off `r2`, like `lfs f0, 0x20(r2)` or the
symbolic `lfs f0, lit@sda21(r2)`. See an `lfs` flowing straight into an
`fmuls`/`fadds` and you can bet the source had an `f`-suffixed float literal in
that expression. Whatever number `lfs` pulls in is the literal itself — read it
off the disassembly symbol or the SDA entry.

## Your task

Write `func_803bcf88` to match the target assembly above.

<!-- solution -->
```c
f32 func_803bcf88(f32 x) {
    return x * 0.25f;
}
```
