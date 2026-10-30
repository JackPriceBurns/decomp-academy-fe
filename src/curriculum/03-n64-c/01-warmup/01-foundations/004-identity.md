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
  - "The argument `x` arrives in a0, and the return value has to end up in v0."
  - "Returning the argument unchanged is a single register copy. Write the one-line C, and the compiler will produce the copy."
---

# Where arguments arrive

Under the N64's calling convention, the first integer argument arrives in `a0`.
That is what the **a** stands for. The next three arrive in `a1`, `a2`, and
`a3`. The return value, as you already know, leaves in `v0`.

These are *different registers*. The argument comes in through `a0`, and the
answer goes out through `v0`. So even a function that returns its input
unchanged has one real job: to move the value from one register to the other.

```asm
or   v0, a0, zero   # v0 = a0 | 0, a register-to-register copy
jr   ra             # return
nop
```

MIPS has no separate copy instruction, so the compiler uses `or` with the zero
register again. If you OR a value with 0, you get the same value back, written
to whichever destination register you chose. In the last lesson, `zero` helped
load a constant. In this lesson, it helps copy a register. Learn to recognize
`or rd, rs, zero` and read it as "`rd` = `rs`". It is one of the most common
lines in MIPS.

So when the body of a function is a single copy from an argument register to
`v0`, ask yourself what C function would need to do *nothing* except hand its
input back.

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
