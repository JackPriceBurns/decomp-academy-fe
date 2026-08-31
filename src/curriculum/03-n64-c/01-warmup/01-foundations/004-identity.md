---
id: d2063344-b266-4810-8255-b11bb00b8272
slug: foundations-identity
title: Arguments Arrive in a0
difficulty: 1
concepts:
  - registers
  - calling-convention
symbol: identity
hints:
  - "The argument `x` arrives in a0; the return value has to end up in v0."
  - "Returning the argument unchanged is a single register copy — write the one-line C and let the compiler emit it."
---

# Where do arguments come from?

On the N64's calling convention, the first integer argument arrives in `a0` —
that's what the **a** stands for. The next three ride in `a1`, `a2`, and `a3`.
The return value, as you know, leaves in `v0`.

Notice those are *different registers*. Argument in `a0`, answer out in `v0` —
so even a function that returns its input completely unchanged has one real job
to do: get the value across.

```asm
or   v0, a0, zero   # v0 = a0 | 0 — a register-to-register copy
jr   ra             # return
nop
```

An `or`? MIPS has no dedicated copy instruction, so the compiler leans on the
zero register again: OR a value with 0 and you get the value back, landed
wherever you pointed the destination. Last lesson `zero` loaded your constants;
this lesson it copies registers. Learn to spot `or rd, rs, zero` and read it
simply as "`rd` = `rs`" — it's one of the most common lines in all of MIPS.

So when the body of a function is a single copy from an argument register to
`v0`, ask: what C function would need *only* to hand its input back?

## Your task

Write `identity`, taking an `s32 x`, to reproduce the assembly above.

<!-- starter -->
```c
s32 identity(s32 x) {
    return 0;
}
```

<!-- solution -->
```c
s32 identity(s32 x) {
    return x;
}
```
