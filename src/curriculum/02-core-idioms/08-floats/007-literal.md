---
id: floats-literal
title: Loading a Float Constant from the SDA
difficulty: 2
concepts:
  - floating-point
  - constants
  - lfs
  - sda
symbol: quarter
hints:
  - A float constant is loaded from the small data area with `lfs`, not an
    immediate.
  - "`x * 0.25f` becomes `lfs f0, ...` then `fmuls f1, f0, f1`."
---

# Float literals don't fit in an immediate

There is no "load immediate float" instruction — a 32-bit constant can't be
encoded inline. Instead MWCC parks the value in the **small data area (SDA)** and
loads it with **`lfs`** (load floating single), addressed relative to `r2`/`r13`:

```asm
lfs   f0, ...      # load the constant 0.25f from the SDA
fmuls f1, f0, f1   # x * 0.25f
blr
```

The `...` is a relocation the linker fills in; in the disassembler you'll see a
concrete SDA-relative offset off `r2`, e.g. `lfs f0, 0x25f0(r2)` (or a symbolic
`lfs f0, lit@sda21(r2)`). When you spot `lfs` feeding straight into an
`fmuls`/`fadds`, the original C almost certainly had a literal like `0.25f` in
the expression.

## Your task

Write `quarter` taking an `f32 x` to match the target assembly above.

<!-- starter -->
```c
f32 quarter(f32 x) {
    return 0.0f;
}
```

<!-- solution -->
```c
f32 quarter(f32 x) {
    return x * 0.25f;
}
```
