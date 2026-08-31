---
id: 028b48b3-256b-4180-8329-3854770860f4
slug: abi-third-float-arg
title: The Third Float Rides a GPR
difficulty: 3
concepts:
  - abi
  - float-args
  - fpu
  - stack-args
symbol: func_800a2d20
hints:
  - "The `sub.s` computes `fa1 - fa0`. Keep that order straight — it's the second argument minus the first."
  - "The value loaded by `lwc1` is the third argument; watch what multiplies it and what gets added at the end."
---

# fa0, fa1… and then the seats run out

The FPU only reserves **two** argument registers. A third `f32` argument still
gets passed — but in `a2`, an *integer* register, carrying the float's raw bits.
The callee can't do float math on a GPR, so the first thing IDO does is shuffle
it across: store `a2` to the stack, then load the same four bytes back with
`lwc1` — "load word to coprocessor 1", the FPU's `lw`.

Here's `fmadd3(a, b, c)`, which computes `a * b + c`:

```asm
sw     a2, 8(sp)       # c arrives in a2 — park its bits in memory…
mul.s  ft0, fa0, fa1   # a * b, meanwhile
lwc1   ft1, 8(sp)      # …and lift them into the FPU
add.s  fv0, ft0, ft1   # a * b + c
jr     ra
nop
```

That `sw`/`lwc1` pair through `8(sp)` is pure plumbing — there's no
register-to-register move between banks at this opt level, so the value takes a
round trip through memory. The slot it uses, `8(sp)`, is `a2`'s reserved shadow
slot; the lesson on *homing* will name it properly. When you see a float
function whose listing opens with `sw a2` and later `lwc1` from the same offset,
read it as: **this function takes a third float argument**.

Notice also the scheduling: the `mul.s` slips between the store and the load,
covering the memory latency with useful work. The shuffle costs nothing extra.

The target combines its arguments in a shape you'll meet in every game's math
library. Decode it one `.s` at a time.

## Your task

Write `func_800a2d20` to reproduce the target assembly.

<!-- solution -->
```c
f32 func_800a2d20(f32 a, f32 b, f32 t) {
    return a + (b - a) * t;
}
```
