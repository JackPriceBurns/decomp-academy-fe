---
id: globals-read-float
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

Floating-point globals live in the SDA too, but conceptually in a *second*
small-data area. The GameCube ABI reserves **two** small-data base registers:
`r13` for the read/write sections (`.sdata`/`.sbss`) and **`r2`** for the
read-only ones (`.sdata2`, where const data and float constants sit). Don't read
`r2` as "the immutable global" register, though: MWCC parks float globals in
`.sdata2` *by default*, so even a writable `f32` like `gGravity` here is reached
through `r2`, while a plain `int` global goes to `.sdata` and uses `r13`. The
base register tracks the *section the compiler chose*, not the C `const`-ness. A
float global is read with **`lfs`** (load floating single) straight into an FPR:

```asm
lfs   f1, fg@sda21(r2)   # load global float fg into f1
blr
```
```
R_PPC_EMB_SDA21   fg
```

The relocation is still spelled `R_PPC_EMB_SDA21` — that one reloc type covers
both small-data windows, and the linker resolves it against whichever base
(`r13` or `r2`) the symbol's section uses. So an `lfs sym@sda21` feeding an FPR
result tells you `sym` was a global `f32`. No address computation, no constant
pool — just one load.

## Your task

`extern f32 gGravity;` is provided. Write `readGravity` to reproduce the `lfs` assembly above.

<!-- starter -->
```c
f32 readGravity(void) {
    return 0.0f;
}
```

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
