---
id: 028b48b3-256b-4180-8329-3854770860f4
slug: abi-third-float-arg
title: The Third Float Arrives in a GPR
difficulty: 3
concepts:
  - abi
  - float-args
  - fpu
  - stack-args
symbol: func_800a2d20
hints:
  - "The `sub.s` computes `fa1 - fa0`. Keep that order straight: it is the second argument minus the first."
  - "The value loaded by `lwc1` is the third argument. Watch what multiplies it and what gets added at the end."
---

# fa0, fa1, and then the float registers run out

The FPU reserves only **two** argument registers. A third `f32` argument is
passed in `a2`, which is an *integer* register. `a2` holds the float's raw
bits. The callee can't do float math on a GPR, so the first thing IDO does is
move the value across. It stores `a2` to the stack, then loads the same four
bytes back with `lwc1`. That name stands for "load word to coprocessor 1", the
FPU's version of `lw`.

This is `fmadd3(a, b, c)`, which computes `a * b + c`:

```asm
sw     a2, 8(sp)       # c arrives in a2: store its bits in memory
mul.s  ft0, fa0, fa1   # a * b, in the meantime
lwc1   ft1, 8(sp)      # then load them into the FPU
add.s  fv0, ft0, ft1   # a * b + c
jr     ra
nop
```

The `sw`/`lwc1` pair through `8(sp)` only moves the value from one register
bank to the other. At this optimization level there is no register-to-register
move between the banks, so the value goes out to memory and back. The slot it
uses, `8(sp)`, is the reserved shadow slot for `a2`. The lesson on *homing*
explains these slots properly. When a float function's listing opens with
`sw a2` and later has `lwc1` from the same offset, read it as: **this function
takes a third float argument**.

Also notice the scheduling. The `mul.s` sits between the store and the load,
so the processor does useful work while it waits for memory. The trip through
memory costs no extra time.

The target combines its arguments in a pattern you will see in every game's
math library. Decode it one `.s` instruction at a time.

## Your task

Write `func_800a2d20` to reproduce the target assembly.

<!-- solution -->
```c
f32 func_800a2d20(f32 a, f32 b, f32 t) {
    return a + (b - a) * t;
}
```
