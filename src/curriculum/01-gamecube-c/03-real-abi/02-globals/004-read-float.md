---
id: 73b603b7-3022-515a-8501-1241a080a7cf
slug: globals-read-float
title: A Global Float and the Second Small Data Area
difficulty: 3
concepts:
  - globals
  - sda
  - sda2
  - float
  - lfs
symbol: readGravity
hints:
  - A global f32 is loaded with `lfs` into f1, addressed in the small-data area.
  - "`return gGravity;` compiles to `lfs f1, gGravity@sda21(r2)` — relocation
    R_PPC_EMB_SDA21."
---

# Floats get their own small-data section

Float globals live in the SDA too, but really in its second half. The ABI sets
aside two base registers here. `r13` is the base for the read/write sections,
`.sdata` and `.sbss`. Const data and float constants go elsewhere, into the
read-only `.sdata2`, and that's what `r2` addresses. Tempting as it is to call
`r2` the const register, that isn't what it means. MWCC files float globals under
`.sdata2` by default, mutable or not, so the writable `f32` `gGravity` still
comes in off `r2`, while a plain `int` global would land in `.sdata` behind
`r13`. The base register reports the section MWCC picked, not your C `const`.
Reading the float is a single `lfs` (load floating single) into an FPR:

```asm
lfs   f1, fg@sda21(r2)   # load global float fg into f1
blr
```
```
R_PPC_EMB_SDA21   fg
```

The relocation reads `R_PPC_EMB_SDA21` either way. That one reloc type spans both
windows, and it's the linker that binds it to `r13` or `r2` by the symbol's
section. See an `lfs sym@sda21` land its result in an FPR and you've caught `sym`
as a global `f32`, no address built first, no constant pool involved.

## Your task

`extern f32 gGravity;` is provided. Write `readGravity` to reproduce the `lfs` assembly above.

<!-- solution -->
```c
f32 readGravity(void) {
    return gGravity;
}
```

<!-- context -->
```c
extern f32 gGravity;
```
