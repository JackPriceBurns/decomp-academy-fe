---
id: foundations-identity
title: Arguments Live in Registers Too
difficulty: 1
concepts:
  - registers
  - calling-convention
symbol: identity
hints:
  - The argument `x` arrives in r3, which is also the return register.
  - Returning it unchanged needs no work at all — the compiler emits just `blr`.
---

# Where do arguments come from?

The GC ABI passes the first integer argument in **`r3`** — the *same* register
used for the return value. That means some functions have nothing at all for
the compiler to emit except the return instruction itself.

```asm
blr
```

That single `blr` is a complete, valid function. Later integer and pointer
arguments go in `r4`, `r5`, `r6` … up to `r10`. Floating-point arguments are
separate: they use `f1`–`f8` and don't consume an integer register slot.

When you see only a `blr` and no instructions that touch `r3`, ask yourself:
what relationship between the input and output would make any computation
unnecessary?

## Your task

Write `identity`, taking an `int x`, to reproduce the assembly above.

<!-- starter -->
```c
int identity(int x) {
    return 0;
}
```

<!-- solution -->
```c
int identity(int x) {
    return x;
}
```
