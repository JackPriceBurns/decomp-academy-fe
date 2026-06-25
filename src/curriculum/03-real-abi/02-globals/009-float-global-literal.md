---
id: globals-float-global-literal
title: "A Float Global Times a Pooled Literal"
difficulty: 3
concepts:
  - globals
  - sda21
  - literal-pool
  - float
  - chaining
symbol: applyDrag
hints:
  - Two lfs loads — one is the named float global, one is the pooled literal (an
    @N symbol) — then an fmuls, then an stfs back to a third float global.
  - The reloc name tells the two loads apart - a real name versus a synthetic
    @N. Their FPR order is just scheduling.
---

# Two `lfs` loads, only one is a global

You have read a float global (`lfs` of a named symbol) and you have seen a float
literal become a pooled `@N` constant (`lfs` of a synthetic symbol). Put them in
one expression and you get *two* `lfs` loads that look almost identical — the
only difference is the relocation name. One reloc is a global you named; the
other is a compiler-minted `@N` label standing in for the constant.

After both are in FPRs, an `fmuls` multiplies them and an `stfs` writes the
single-precision result into the destination float global. Remember from the
literal lesson: the suffix matters. A bare `0.5` is a `double` and drags the
whole expression to double precision (`lfd`/`fmul`/`frsp`); the `f` suffix keeps
it `lfs`/`fmuls`/`stfs`.

Consider `spin()`, which multiplies the float global `gAngle` by `1.5f` and
stores it into `gWobble`:

```asm
lfs   f1, @5@sda21(r2)      # load the pooled literal 1.5f
lfs   f0, gAngle@sda21(r2)  # load the float global gAngle
fmuls f0, f1, f0           # gAngle * 1.5f
stfs  f0, gWobble@sda21(r2) # gWobble = result
blr
```

Both loads are `lfs` through `r2` (the `.sdata2` base from the read-float
lesson), but `@5` is the constant and `gAngle` is the global. The target assembly
multiplies a *different* float global by a *different* literal before storing —
read the two reloc names and the literal's value off the disassembly.

## Your task

The globals are declared for you: `gVelocity` and `gScaled` (both `f32`). Write
`applyDrag` (no arguments, no return) to reproduce the assembly above.

<!-- starter -->
```c
void applyDrag(void) {
    // scale one float global by a literal, store into the other
}
```

<!-- solution -->
```c
void applyDrag(void) {
    gScaled = gVelocity * 0.75f;
}
```

<!-- context -->
```c
extern f32 gVelocity;
extern f32 gScaled;
```
